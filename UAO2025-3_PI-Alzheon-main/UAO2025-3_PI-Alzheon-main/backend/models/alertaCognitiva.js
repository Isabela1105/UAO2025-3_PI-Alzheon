import mongoose from 'mongoose';

const alertaCognitivaSchema = new mongoose.Schema({
    pacienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        index: true
    },
    medicoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        index: true
    },
    analisisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnalisisCognitivo',
        required: true
    },
    // Tipo de alerta
    tipo: {
        type: String,
        enum: ['desviacion_moderada', 'desviacion_severa', 'mejora_significativa', 'evaluacion_inicial'],
        required: true
    },
    // Severidad
    severidad: {
        type: String,
        enum: ['baja', 'media', 'alta', 'critica'],
        required: true
    },
    // Título y descripción
    titulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    // Desviaciones detectadas
    desviaciones: [{
        metrica: String,
        valorAnterior: Number,
        valorActual: Number,
        diferencia: Number,
        porcentaje: Number,
        severidad: String
    }],
    // Recomendaciones
    recomendaciones: [{
        tipo: String,
        mensaje: String,
        prioridad: String
    }],
    // Estado de la alerta
    leida: {
        type: Boolean,
        default: false
    },
    fechaLectura: {
        type: Date
    },
    // Acciones tomadas por el médico
    accionTomada: {
        type: String
    },
    fechaAccion: {
        type: Date
    },
    // Metadatos
    fechaCreacion: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Índices para mejorar búsquedas
alertaCognitivaSchema.index({ medicoId: 1, leida: 1, fechaCreacion: -1 });
alertaCognitivaSchema.index({ pacienteId: 1, fechaCreacion: -1 });

// Método para marcar como leída
alertaCognitivaSchema.methods.marcarLeida = async function() {
    this.leida = true;
    this.fechaLectura = new Date();
    return await this.save();
};

// Método para registrar acción
alertaCognitivaSchema.methods.registrarAccion = async function(accion) {
    this.accionTomada = accion;
    this.fechaAccion = new Date();
    return await this.save();
};

// Método estático para obtener alertas no leídas
alertaCognitivaSchema.statics.obtenerNoLeidas = async function(medicoId) {
    return await this.find({ 
        medicoId, 
        leida: false 
    })
    .populate('pacienteId', 'nombre email')
    .populate('analisisId')
    .sort({ fechaCreacion: -1 });
};

// Método estático para obtener historial
alertaCognitivaSchema.statics.obtenerHistorial = async function(medicoId, pacienteId = null, fechaInicio = null, fechaFin = null) {
    const query = { medicoId };
    
    if (pacienteId) {
        query.pacienteId = pacienteId;
    }
    
    if (fechaInicio || fechaFin) {
        query.fechaCreacion = {};
        if (fechaInicio) query.fechaCreacion.$gte = fechaInicio;
        if (fechaFin) query.fechaCreacion.$lte = fechaFin;
    }
    
    return await this.find(query)
        .populate('pacienteId', 'nombre email')
        .populate('analisisId')
        .sort({ fechaCreacion: -1 });
};

export default mongoose.model('AlertaCognitiva', alertaCognitivaSchema);
