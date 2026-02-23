import mongoose from 'mongoose';

const analisisCognitivoSchema = new mongoose.Schema({
    pacienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        index: true
    },
    grabacionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grabacion',
        required: true
    },
    // Métricas cognitivas (0.0 - 1.0)
    coherencia: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    },
    claridad: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    },
    riquezaLexica: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    },
    memoria: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    },
    emocion: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    },
    orientacion: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    },
    razonamiento: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    },
    atencion: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    },
    // Métricas lingüísticas
    palabrasUnicas: {
        type: Number,
        default: 0
    },
    palabrasTotales: {
        type: Number,
        default: 0
    },
    longitudPromedioPalabras: {
        type: Number,
        default: 0
    },
    pausas: {
        type: Number,
        default: 0
    },
    repeticiones: {
        type: Number,
        default: 0
    },
    // Puntuación global (0-100)
    puntuacionGlobal: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    // Observaciones y alertas
    observaciones: {
        type: String,
        default: ''
    },
    alertas: [{
        type: String
    }],
    // Metadatos
    esLineaBase: {
        type: Boolean,
        default: false
    },
    fechaAnalisis: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices para mejorar búsquedas
analisisCognitivoSchema.index({ pacienteId: 1, fechaAnalisis: -1 });
analisisCognitivoSchema.index({ pacienteId: 1, esLineaBase: 1 });

// Método para obtener línea base de un paciente
analisisCognitivoSchema.statics.obtenerLineaBase = async function(pacienteId) {
    return await this.findOne({ 
        pacienteId, 
        esLineaBase: true 
    }).sort({ fechaAnalisis: 1 }); // La primera evaluación
};

// Método para calcular promedio de métricas
analisisCognitivoSchema.statics.calcularPromedios = async function(pacienteId, fechaInicio, fechaFin) {
    const analisis = await this.find({
        pacienteId,
        fechaAnalisis: {
            $gte: fechaInicio,
            $lte: fechaFin
        }
    });

    if (analisis.length === 0) return null;

    const promedios = {
        coherencia: 0,
        claridad: 0,
        riquezaLexica: 0,
        memoria: 0,
        emocion: 0,
        orientacion: 0,
        razonamiento: 0,
        atencion: 0,
        puntuacionGlobal: 0
    };

    analisis.forEach(a => {
        Object.keys(promedios).forEach(key => {
            promedios[key] += a[key];
        });
    });

    Object.keys(promedios).forEach(key => {
        promedios[key] = promedios[key] / analisis.length;
    });

    return promedios;
};

export default mongoose.model('AnalisisCognitivo', analisisCognitivoSchema);
