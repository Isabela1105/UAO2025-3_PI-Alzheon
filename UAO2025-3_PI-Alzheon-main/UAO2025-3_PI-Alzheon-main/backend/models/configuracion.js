import mongoose from 'mongoose';

const configuracionSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        unique: true
    },
    // Recordatorios
    recordatorios: {
        enabled: {
            type: Boolean,
            default: false
        },
        hour: {
            type: String,
            default: '10:00'
        },
        frequency: {
            type: String,
            enum: ['diario', 'cada_2_dias', 'semanal'],
            default: 'diario'
        },
        motivationalMessage: {
            type: String,
            default: 'Es hora de recordar momentos especiales'
        },
        nextSession: {
            type: Date
        }
    },
    // Perfil adicional
    perfil: {
        telefono: String
    },
    // Estadísticas
    estadisticas: {
        sesionesCompletadas: {
            type: Number,
            default: 0
        },
        metaSemanal: {
            type: Number,
            default: 7
        },
        ultimaGrabacion: {
            type: Date
        },
        totalFotos: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Configuracion', configuracionSchema);
