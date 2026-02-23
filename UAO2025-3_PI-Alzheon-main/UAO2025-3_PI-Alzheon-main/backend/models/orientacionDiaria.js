import mongoose from 'mongoose';

const orientacionDiariaSchema = new mongoose.Schema({
    pacienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        index: true
    },
    fecha: {
        type: Date,
        required: true,
        index: true,
        // Agrupar por día
        default: () => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            return hoy;
        }
    },
    // Preguntas de Orientación Temporal
    preguntas: {
        // ¿Qué día de la semana es hoy?
        diaSemana: {
            pregunta: String,
            respuestaCorrecta: String,
            respuestaUsuario: String,
            correcta: Boolean,
            intentos: { type: Number, default: 0 }
        },
        // ¿Qué fecha es hoy?
        fechaCompleta: {
            pregunta: String,
            respuestaCorrecta: String,
            respuestaUsuario: String,
            correcta: Boolean,
            intentos: { type: Number, default: 0 }
        },
        // ¿Qué mes es?
        mes: {
            pregunta: String,
            respuestaCorrecta: String,
            respuestaUsuario: String,
            correcta: Boolean,
            intentos: { type: Number, default: 0 }
        },
        // ¿Qué año es?
        año: {
            pregunta: String,
            respuestaCorrecta: String,
            respuestaUsuario: String,
            correcta: Boolean,
            intentos: { type: Number, default: 0 }
        },
        // ¿Qué hora es aproximadamente?
        hora: {
            pregunta: String,
            respuestaCorrecta: String,
            respuestaUsuario: String,
            correcta: Boolean,
            intentos: { type: Number, default: 0 }
        },
        // ¿En qué ciudad estamos?
        ciudad: {
            pregunta: String,
            respuestaCorrecta: String,
            respuestaUsuario: String,
            correcta: Boolean,
            intentos: { type: Number, default: 0 }
        },
        // ¿En qué país estamos?
        pais: {
            pregunta: String,
            respuestaCorrecta: String,
            respuestaUsuario: String,
            correcta: Boolean,
            intentos: { type: Number, default: 0 }
        },
        // ¿En qué lugar específico estamos? (hogar, hospital, etc)
        lugarEspecifico: {
            pregunta: String,
            respuestaCorrecta: String,
            respuestaUsuario: String,
            correcta: Boolean,
            intentos: { type: Number, default: 0 }
        }
    },
    // Puntuación de orientación (0-100)
    puntuacionOrientacion: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    // Contadores
    respuestasCorrectas: {
        type: Number,
        default: 0
    },
    respuestasIncorrectas: {
        type: Number,
        default: 0 
    },
    totalRespuestas: {
        type: Number,
        default: 0
    },
    // Estado del test
    completado: {
        type: Boolean,
        default: false
    },
    iniciado: {
        type: Date,
        default: Date.now
    },
    finalizado: Date,
    // Duración en minutos
    duracion: Number,
    // Observaciones del evaluador
    observaciones: String,
    // Áreas problemáticas
    areasProblematicas: [String], // ['temporal', 'espacial']
}, {
    timestamps: true
});

// Índice compuesto para buscar por paciente y fecha
orientacionDiariaSchema.index({ pacienteId: 1, fecha: -1 });

// Método para calcular puntuación
orientacionDiariaSchema.methods.calcularPuntuacion = function() {
    const totalPreguntas = Object.keys(this.preguntas).length;
    if (totalPreguntas === 0) return 0;
    
    const correctas = Object.values(this.preguntas).filter(p => p.correcta).length;
    this.puntuacionOrientacion = Math.round((correctas / totalPreguntas) * 100);
    this.respuestasCorrectas = correctas;
    this.respuestasIncorrectas = totalPreguntas - correctas;
    this.totalRespuestas = totalPreguntas;
    
    // Identificar áreas problemáticas
    const areasProblematicas = [];
    const preguntas = this.preguntas;
    
    // Verificar problemas de orientación temporal
    if (!preguntas.diaSemana?.correcta || !preguntas.fechaCompleta?.correcta || 
        !preguntas.mes?.correcta || !preguntas.año?.correcta) {
        areasProblematicas.push('temporal');
    }
    
    // Verificar problemas de orientación espacial
    if (!preguntas.ciudad?.correcta || !preguntas.pais?.correcta || 
        !preguntas.lugarEspecifico?.correcta) {
        areasProblematicas.push('espacial');
    }
    
    this.areasProblematicas = areasProblematicas;
    
    return this.puntuacionOrientacion;
};

// Método estático para obtener el test de hoy
orientacionDiariaSchema.statics.obtenerTestHoy = async function(pacienteId) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);
    
    return await this.findOne({
        pacienteId,
        fecha: {
            $gte: hoy,
            $lt: mañana
        }
    });
};

// Método para obtener historial
orientacionDiariaSchema.statics.obtenerHistorial = async function(pacienteId, dias = 30) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    fecha.setHours(0, 0, 0, 0);
    
    return await this.find({
        pacienteId,
        fecha: { $gte: fecha }
    }).sort({ fecha: -1 });
};

export default mongoose.model('OrientacionDiaria', orientacionDiariaSchema);
