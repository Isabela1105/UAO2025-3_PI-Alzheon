import mongoose from 'mongoose';

const grabacionSchema = new mongoose.Schema({
    photoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Foto',
        required: true
    },
    pacienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    fotoUrl: {
        type: String,
        required: true
    },
    audioUrl: {
        type: String,
        required: false // Ya no es obligatorio, puede ser texto o audio
    },
    duracion: {
        type: Number,
        required: false // En segundos, solo si hay audio
    },
    nota: {
        type: String
    },
    descripcionTexto: {
        type: String,
        required: false // Descripción escrita por el paciente (alternativa al audio)
    },
    transcripcion: {
        type: String,
        required: false // Transcripción automática del audio
    },
    tipoContenido: {
        type: String,
        enum: ['audio', 'texto', 'ambos'],
        default: 'audio'
    },
    fecha: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices para mejorar búsquedas
grabacionSchema.index({ pacienteId: 1, fecha: -1 });
grabacionSchema.index({ photoId: 1 });

export default mongoose.model('Grabacion', grabacionSchema);
