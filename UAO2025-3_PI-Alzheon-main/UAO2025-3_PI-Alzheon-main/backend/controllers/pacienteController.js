import Foto from '../models/foto.js';
import Grabacion from '../models/grabacion.js';
import Configuracion from '../models/configuracion.js';
import Usuario from '../models/usuario.js';
import AnalisisCognitivo from '../models/analisisCognitivo.js';
import AlertaCognitiva from '../models/alertaCognitiva.js';
import bcrypt from 'bcryptjs';
import { uploadAudioToR2 } from '../services/uploadService.js';
import { transcribeAudio } from '../services/transcriptionService.js';
import { analizarTexto, detectarDesviaciones } from '../services/nlpAnalysisService.js';

// Obtener fotos del paciente
export const getPatientPhotos = async (req, res) => {
    try {
        const pacienteId = req.usuario._id;
        
        const fotos = await Foto.find({ pacienteId })
            .populate('cuidadorId', 'nombre email')
            .sort({ createdAt: -1 });
        
        res.json(fotos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Subir grabación de audio o texto
export const uploadRecording = async (req, res) => {
    try {
        const pacienteId = req.usuario._id;
        const { photoId, duration, note, descripcionTexto } = req.body;
        
        // Verificar que al menos haya audio o texto
        if (!req.file && !descripcionTexto) {
            return res.status(400).json({ 
                error: 'Debes proporcionar un archivo de audio o una descripción de texto' 
            });
        }
        
        // Verificar que la foto pertenece al paciente
        const foto = await Foto.findOne({ _id: photoId, pacienteId });
        if (!foto) {
            return res.status(404).json({ error: 'Foto no encontrada' });
        }

        let audioUrl = null;
        let transcripcion = null;
        let tipoContenido = 'texto';
        let duracionFinal = 0;

        // Procesar audio si existe
        if (req.file) {
            console.log('🎵 Procesando audio...');
            console.log('   - Tamaño:', req.file.buffer.length, 'bytes');
            console.log('   - Tipo MIME:', req.file.mimetype);
            console.log('   - Nombre original:', req.file.originalname);
            
            // Subir audio a R2
            console.log('☁️ Subiendo audio a R2...');
            audioUrl = await uploadAudioToR2(
                req.file.buffer, 
                req.file.mimetype, 
                req.file.originalname
            );
            console.log('✅ Audio subido a R2:', audioUrl);
            
            // Intentar transcribir el audio
            console.log('🎙️ Iniciando transcripción...');
            try {
                transcripcion = await transcribeAudio(req.file.buffer, req.file.originalname);
                if (transcripcion) {
                    console.log('✅ Audio transcrito exitosamente:', transcripcion.substring(0, 50) + '...');
                } else {
                    console.log('⚠️ No se pudo transcribir el audio (puede ser que no esté configurado OpenAI)');
                }
            } catch (error) {
                console.error('❌ Error al transcribir audio:', error.message);
                // Continuar sin transcripción
            }
            
            duracionFinal = parseInt(duration) || 0;
            tipoContenido = descripcionTexto ? 'ambos' : 'audio';
        }
        
        // Crear grabación
        const grabacion = new Grabacion({
            photoId,
            pacienteId,
            fotoUrl: foto.url_contenido,
            audioUrl,
            duracion: duracionFinal,
            nota: note || '',
            descripcionTexto: descripcionTexto || null,
            transcripcion: transcripcion || null,
            tipoContenido,
            fecha: new Date()
        });
        
        await grabacion.save();
        
        // Actualizar estadísticas
        await Configuracion.findOneAndUpdate(
            { usuarioId: pacienteId },
            { 
                $inc: { 'estadisticas.sesionesCompletadas': 1 },
                $set: { 'estadisticas.ultimaGrabacion': new Date() }
            }
        );

        // ========== ANÁLISIS COGNITIVO AUTOMÁTICO (HU-03) ==========
        // Analizar el texto si existe transcripción o descripción
        const textoParaAnalizar = transcripcion || descripcionTexto;
        
        if (textoParaAnalizar && textoParaAnalizar.trim().length > 20) {
            console.log('🧠 Iniciando análisis cognitivo del texto...');
            
            try {
                // Realizar análisis con Vertex AI
                const resultadoAnalisis = await analizarTexto(textoParaAnalizar);
                
                // Verificar si es la primera grabación (establecer como línea base)
                const totalAnalisis = await AnalisisCognitivo.countDocuments({ pacienteId });
                const esLineaBase = totalAnalisis < 3; // Primeros 3 análisis forman la línea base
                
                // Crear registro de análisis cognitivo
                const analisis = new AnalisisCognitivo({
                    pacienteId,
                    grabacionId: grabacion._id,
                    esLineaBase,
                    ...resultadoAnalisis
                });
                
                await analisis.save();
                console.log(`✅ Análisis cognitivo guardado (línea base: ${esLineaBase})`);
                
                // Si no es línea base, detectar desviaciones
                if (!esLineaBase) {
                    const lineaBase = await AnalisisCognitivo.obtenerLineaBase(pacienteId);
                    
                    if (lineaBase) {
                        // Obtener umbral de la configuración del médico (por defecto 15%)
                        const config = await Configuracion.findOne({ usuarioId: pacienteId });
                        const umbralDesviacion = config?.umbralDesviacion || 0.15;
                        
                        const desviaciones = detectarDesviaciones(analisis, lineaBase, umbralDesviacion);
                        
                        if (desviaciones.length > 0) {
                            console.log(`⚠️ Se detectaron ${desviaciones.length} desviaciones cognitivas`);
                            
                            // Determinar severidad según las desviaciones
                            const maxDesviacion = Math.max(...desviaciones.map(d => Math.abs(d.porcentaje || 0)));
                            let severidad = 'baja';
                            let tipo = 'desviacion_moderada';
                            
                            if (maxDesviacion >= 50) {
                                severidad = 'critica';
                                tipo = 'desviacion_severa';
                            } else if (maxDesviacion >= 35) {
                                severidad = 'alta';
                                tipo = 'desviacion_severa';
                            } else if (maxDesviacion >= 25) {
                                severidad = 'media';
                                tipo = 'desviacion_moderada';
                            }
                            
                            // Obtener médicos asignados al paciente
                            const paciente = await Usuario.findById(pacienteId).populate('medicosAsignados');
                            
                            if (paciente && paciente.medicosAsignados && paciente.medicosAsignados.length > 0) {
                                // Crear alerta para cada médico asignado
                                for (const medico of paciente.medicosAsignados) {
                                    const metricas = desviaciones.map(d => d.metrica).join(', ');
                                    
                                    const alerta = new AlertaCognitiva({
                                        pacienteId,
                                        medicoId: medico._id,
                                        analisisId: analisis._id, // ✅ CORREGIDO: era analisisCognitivo._id
                                        tipo,
                                        severidad,
                                        titulo: `Desviación cognitiva detectada - ${paciente.nombre}`,
                                        descripcion: `Se detectaron ${desviaciones.length} desviaciones cognitivas respecto a la línea base en: ${metricas}. Desviación máxima: ${maxDesviacion.toFixed(1)}%.`,
                                        desviaciones,
                                        recomendaciones: []
                                    });
                                    
                                    await alerta.save();
                                    console.log(`🚨 Alerta ${severidad} creada para médico ${medico.nombre}`);
                                }
                            } else {
                                console.log('⚠️ Paciente no tiene médicos asignados, no se crearon alertas');
                            }
                        } else {
                            console.log('✅ No se detectaron desviaciones significativas');
                        }
                    }
                }
            } catch (error) {
                // No bloquear la respuesta si falla el análisis
                console.error('❌ Error en análisis cognitivo:', error.message);
            }
        }
        
        res.status(201).json(grabacion);
    } catch (error) {
        console.error('Error en uploadRecording:', error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener grabaciones del paciente
export const getPatientRecordings = async (req, res) => {
    try {
        const pacienteId = req.usuario._id;
        
        const grabaciones = await Grabacion.find({ pacienteId })
            .populate('photoId', 'etiqueta')
            .sort({ fecha: -1 });
        
        res.json(grabaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener configuración del paciente
export const getPatientSettings = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        
        let configuracion = await Configuracion.findOne({ usuarioId });
        
        // Si no existe, crear una por defecto
        if (!configuracion) {
            configuracion = await Configuracion.create({ usuarioId });
        }
        
        // Retornar en el formato esperado por el frontend
        res.json({
            enabled: configuracion.recordatorios.enabled,
            hour: configuracion.recordatorios.hour,
            frequency: configuracion.recordatorios.frequency,
            motivationalMessage: configuracion.recordatorios.motivationalMessage,
            nextSession: configuracion.recordatorios.nextSession
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar configuración de recordatorios
export const updatePatientSettings = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        const { enabled, hour, frequency, motivationalMessage } = req.body;
        
        // Calcular próxima sesión
        let nextSession = null;
        if (enabled) {
            nextSession = calculateNextSession(hour, frequency);
        }
        
        const configuracion = await Configuracion.findOneAndUpdate(
            { usuarioId },
            {
                'recordatorios.enabled': enabled,
                'recordatorios.hour': hour,
                'recordatorios.frequency': frequency,
                'recordatorios.motivationalMessage': motivationalMessage,
                'recordatorios.nextSession': nextSession
            },
            { new: true, upsert: true }
        );
        
        res.json({
            enabled: configuracion.recordatorios.enabled,
            hour: configuracion.recordatorios.hour,
            frequency: configuracion.recordatorios.frequency,
            motivationalMessage: configuracion.recordatorios.motivationalMessage,
            nextSession: configuracion.recordatorios.nextSession
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar perfil del paciente
export const updatePatientProfile = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        const { nombre, email, telefono } = req.body;
        
        // Actualizar usuario
        const usuario = await Usuario.findByIdAndUpdate(
            usuarioId,
            { nombre, email },
            { new: true }
        ).select('-password');
        
        // Actualizar teléfono en configuración
        if (telefono !== undefined) {
            await Configuracion.findOneAndUpdate(
                { usuarioId },
                { 'perfil.telefono': telefono },
                { upsert: true }
            );
        }
        
        res.json({ nombre: usuario.nombre, email: usuario.email, telefono });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cambiar contraseña
export const updatePatientPassword = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        const { currentPassword, newPassword } = req.body;
        
        // Verificar contraseña actual
        const usuario = await Usuario.findById(usuarioId);
        const passwordMatch = await bcrypt.compare(currentPassword, usuario.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }
        
        // Hashear nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Actualizar contraseña
        usuario.password = hashedPassword;
        await usuario.save();
        
        res.json({ msg: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función auxiliar para calcular próxima sesión
const calculateNextSession = (hour, frequency) => {
    const now = new Date();
    const [hours, minutes] = hour.split(':');
    const nextSession = new Date();
    nextSession.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Si ya pasó la hora de hoy, empezar desde mañana
    if (nextSession <= now) {
        nextSession.setDate(nextSession.getDate() + 1);
    }
    
    // Ajustar según frecuencia
    switch (frequency) {
        case 'cada_2_dias':
            nextSession.setDate(nextSession.getDate() + 1);
            break;
        case 'semanal':
            nextSession.setDate(nextSession.getDate() + 6);
            break;
        // 'diario' no necesita ajuste adicional
    }
    
    return nextSession;
};
