import OrientacionDiaria from '../models/orientacionDiaria.js';

// Generar preguntas diarias de orientación
const generarPreguntasDiarias = (configuracion = {}) => {
    const hoy = new Date();
    const diaSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const diaLetra = diaSemana[hoy.getDay()];
    const fecha = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const mes = meses[hoy.getMonth()];
    const año = hoy.getFullYear().toString();
    const hora = hoy.getHours().toString();
    
    return {
        diaSemana: {
            pregunta: '¿Qué día de la semana es hoy?',
            respuestaCorrecta: diaLetra.toLowerCase(),
            respuestaUsuario: null,
            correcta: null,
            intentos: 0
        },
        fechaCompleta: {
            pregunta: '¿Cuál es la fecha de hoy? (día, mes, año)',
            respuestaCorrecta: fecha.toLowerCase(),
            respuestaUsuario: null,
            correcta: null,
            intentos: 0
        },
        mes: {
            pregunta: '¿En qué mes estamos?',
            respuestaCorrecta: mes.toLowerCase(),
            respuestaUsuario: null,
            correcta: null,
            intentos: 0
        },
        año: {
            pregunta: '¿En qué año estamos?',
            respuestaCorrecta: año,
            respuestaUsuario: null,
            correcta: null,
            intentos: 0
        },
        hora: {
            pregunta: '¿Qué hora es aproximadamente?',
            respuestaCorrecta: hora,
            respuestaUsuario: null,
            correcta: null,
            intentos: 0
        },
        ciudad: {
            pregunta: '¿En qué ciudad estamos?',
            respuestaCorrecta: configuracion.ciudad || 'desconocida',
            respuestaUsuario: null,
            correcta: null,
            intentos: 0
        },
        pais: {
            pregunta: '¿En qué país estamos?',
            respuestaCorrecta: configuracion.pais || 'colombia',
            respuestaUsuario: null,
            correcta: null,
            intentos: 0
        },
        lugarEspecifico: {
            pregunta: '¿En qué lugar específico estamos? (por ejemplo: hogar, hospital, oficina)',
            respuestaCorrecta: configuracion.lugarEspecifico || 'desconocido',
            respuestaUsuario: null,
            correcta: null,
            intentos: 0
        }
    };
};

// Normalizar respuesta del usuario para comparación
const normalizarRespuesta = (respuesta) => {
    if (!respuesta) return '';
    return respuesta
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Eliminar acentos
};

// Verificar si la respuesta es correcta (con tolerancia)
const verificarRespuesta = (respuestaUsuario, respuestaCorrecta, tipoPregunta) => {
    const normalizada = normalizarRespuesta(respuestaUsuario);
    const correcta = normalizarRespuesta(respuestaCorrecta);
    
    // Para horas, permitir rango de ±1 hora
    if (tipoPregunta === 'hora') {
        const horaUsuario = parseInt(normalizada);
        const horaCorrecta = parseInt(correcta);
        if (isNaN(horaUsuario) || isNaN(horaCorrecta)) return false;
        return Math.abs(horaUsuario - horaCorrecta) <= 1;
    }
    
    // Para fechas completas, permitir variaciones
    if (tipoPregunta === 'fechaCompleta') {
        // Búsqueda flexible de números
        const numeros = normalizada.match(/\d+/g) || [];
        const numerosCorrecto = correcta.match(/\d+/g) || [];
        return numeros.join('') === numerosCorrecto.join('');
    }
    
    // Para otras, coincidencia exacta
    return normalizada === correcta;
};

// Obtener o crear test del día
export const obtenerTestDelDia = async (req, res) => {
    try {
        const pacienteId = req.usuario._id;
        
        // Buscar test de hoy
        let test = await OrientacionDiaria.obtenerTestHoy(pacienteId);
        
        // Si no existe, crear uno nuevo
        if (!test) {
            const preguntas = generarPreguntasDiarias({
                ciudad: process.env.CIUDAD_DEFAULT || 'Desconocida',
                pais: process.env.PAIS_DEFAULT || 'Colombia',
                lugarEspecifico: process.env.LUGAR_DEFAULT || 'Hogar'
            });
            
            test = new OrientacionDiaria({
                pacienteId,
                preguntas
            });
            
            await test.save();
        }
        
        // No enviar respuestas correctas al frontend
        const testSinRespuestas = {
            _id: test._id,
            fecha: test.fecha,
            preguntas: {},
            completado: test.completado,
            puntuacionOrientacion: test.completado ? test.puntuacionOrientacion : null,
            respuestasCorrectas: test.completado ? test.respuestasCorrectas : null,
            areasProblematicas: test.completado ? test.areasProblematicas : null
        };
        
        // Copiar solo las preguntas sin mostrar respuestas correctas
        Object.entries(test.preguntas).forEach(([key, valor]) => {
            testSinRespuestas.preguntas[key] = {
                pregunta: valor.pregunta,
                respuestaUsuario: valor.respuestaUsuario,
                correcta: test.completado ? valor.correcta : null,
                intentos: valor.intentos
            };
        });
        
        res.json(testSinRespuestas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Responder una pregunta
export const responderPregunta = async (req, res) => {
    try {
        const pacienteId = req.usuario._id;
        const { nombrePregunta, respuesta } = req.body;
        
        let test = await OrientacionDiaria.obtenerTestHoy(pacienteId);
        
        if (!test) {
            return res.status(404).json({ error: 'No hay test disponible para hoy' });
        }
        
        if (!test.preguntas[nombrePregunta]) {
            return res.status(400).json({ error: 'Pregunta no válida' });
        }
        
        const pregunta = test.preguntas[nombrePregunta];
        pregunta.respuestaUsuario = respuesta;
        pregunta.intentos += 1;
        
        // Verificar si la respuesta es correcta
        const esCorrecta = verificarRespuesta(respuesta, pregunta.respuestaCorrecta, nombrePregunta);
        
        // Solo marcar como correcta si es la primera respuesta correcta
        if (esCorrecta && pregunta.correcta !== true) {
            pregunta.correcta = true;
        } else if (!esCorrecta && pregunta.correcta === null) {
            pregunta.correcta = false;
        }
        
        // Verificar si todas las preguntas han sido respondidas
        const todasRespondidas = Object.values(test.preguntas).every(p => p.respuestaUsuario !== null);
        
        if (todasRespondidas) {
            test.completado = true;
            test.finalizado = new Date();
            const inicio = new Date(test.iniciado);
            test.duracion = Math.round((test.finalizado - inicio) / 60000); // en minutos
            test.calcularPuntuacion();
        }
        
        await test.save();
        
        res.json({
            correcta: esCorrecta,
            esCorrecta,
            pregunta: {
                pregunta: pregunta.pregunta,
                respuestaUsuario: pregunta.respuestaUsuario,
                correcta: pregunta.correcta,
                intentos: pregunta.intentos
            },
            completado: test.completado,
            puntuacionOrientacion: test.completado ? test.puntuacionOrientacion : null,
            areasProblematicas: test.completado ? test.areasProblematicas : null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener historial de orientación
export const obtenerHistorial = async (req, res) => {
    try {
        const pacienteId = req.usuario._id;
        const { dias = 30 } = req.query;
        
        const historial = await OrientacionDiaria.obtenerHistorial(pacienteId, parseInt(dias));
        
        // No enviar respuestas correctas
        const historialSanitizado = historial.map(test => ({
            _id: test._id,
            fecha: test.fecha,
            puntuacionOrientacion: test.puntuacionOrientacion,
            respuestasCorrectas: test.respuestasCorrectas,
            respuestasIncorrectas: test.respuestasIncorrectas,
            totalRespuestas: test.totalRespuestas,
            completado: test.completado,
            duracion: test.duracion,
            areasProblematicas: test.areasProblematicas
        }));
        
        res.json(historialSanitizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un test completado (para revisión)
export const obtenerTestCompletado = async (req, res) => {
    try {
        const pacienteId = req.usuario._id;
        const { testId } = req.params;
        
        const test = await OrientacionDiaria.findOne({
            _id: testId,
            pacienteId
        });
        
        if (!test || !test.completado) {
            return res.status(404).json({ error: 'Test no encontrado o no completado' });
        }
        
        res.json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Para el médico: obtener historial de orientación de un paciente
export const obtenerHistorialPaciente = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const { dias = 30 } = req.query;
        
        const historial = await OrientacionDiaria.obtenerHistorial(pacienteId, parseInt(dias));
        
        // El médico ve todos los datos
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Reiniciar mi test (para pacientes)
export const reiniciarMiTest = async (req, res) => {
    try {
        const pacienteId = req.usuario._id;
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);
        
        // Eliminar test de hoy
        await OrientacionDiaria.deleteOne({
            pacienteId,
            fecha: {
                $gte: hoy,
                $lt: mañana
            }
        });
        
        // Crear nuevo test de orientación
        const preguntas = generarPreguntasDiarias({
            ciudad: process.env.CIUDAD_DEFAULT || 'Desconocida',
            pais: process.env.PAIS_DEFAULT || 'Colombia',
            lugarEspecifico: process.env.LUGAR_DEFAULT || 'Hogar'
        });
        
        const nuevoTest = new OrientacionDiaria({
            pacienteId,
            preguntas
        });
        
        await nuevoTest.save();
        
        res.json({ mensaje: 'Test reiniciado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Reiniciar test del día (admin/médico)
export const reiniciarTestDelDia = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);
        
        // Eliminar test de hoy
        await OrientacionDiaria.deleteOne({
            pacienteId,
            fecha: {
                $gte: hoy,
                $lt: mañana
            }
        });
        
        res.json({ mensaje: 'Test reiniciado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener estadísticas de orientación
export const obtenerEstadisticas = async (req, res) => {
    try {
        const pacienteId = req.usuario._id;
        const { dias = 30 } = req.query;
        
        const historial = await OrientacionDiaria.obtenerHistorial(pacienteId, parseInt(dias));
        
        if (historial.length === 0) {
            return res.json({
                totalTests: 0,
                testCompletados: 0,
                puntuacionPromedio: 0,
                puntuacionMinima: 0,
                puntuacionMaxima: 0,
                areasProblematicasComunes: [],
                tendencia: 'sin datos'
            });
        }
        
        const completados = historial.filter(t => t.completado);
        const puntuaciones = completados.map(t => t.puntuacionOrientacion);
        const puntuacionPromedio = puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length || 0;
        
        // Contar áreas problemáticas
        const areasConteo = {};
        completados.forEach(test => {
            test.areasProblematicas?.forEach(area => {
                areasConteo[area] = (areasConteo[area] || 0) + 1;
            });
        });
        
        // Determinar tendencia
        let tendencia = 'estable';
        if (puntuaciones.length >= 2) {
            const media = puntuaciones.slice(0, Math.floor(puntuaciones.length / 2));
            const reciente = puntuaciones.slice(Math.floor(puntuaciones.length / 2));
            const mediaAntigua = media.reduce((a, b) => a + b, 0) / media.length;
            const mediaReciente = reciente.reduce((a, b) => a + b, 0) / reciente.length;
            
            if (mediaReciente > mediaAntigua + 5) tendencia = 'mejorado';
            else if (mediaReciente < mediaAntigua - 5) tendencia = 'deteriorado';
        }
        
        res.json({
            totalTests: historial.length,
            testCompletados: completados.length,
            puntuacionPromedio: Math.round(puntuacionPromedio),
            puntuacionMinima: Math.min(...puntuaciones),
            puntuacionMaxima: Math.max(...puntuaciones),
            areasProblematicasComunes: Object.entries(areasConteo)
                .sort((a, b) => b[1] - a[1])
                .map(([area, count]) => ({ area, frecuencia: count })),
            tendencia
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
