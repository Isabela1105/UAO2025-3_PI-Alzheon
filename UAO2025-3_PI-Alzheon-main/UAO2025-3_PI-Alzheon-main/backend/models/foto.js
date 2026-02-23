import mongoose from 'mongoose';

const fotoSchema = new mongoose.Schema({
    etiqueta: {
        type: String,
        required: true
    },
    url_contenido: {
        type: String,
        required: true
    },
    descripcion: {
        type: String
    },
    pacienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    cuidadorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: true
});

// Índices para mejorar búsquedas
fotoSchema.index({ pacienteId: 1 });
fotoSchema.index({ cuidadorId: 1 });

export default mongoose.model('Foto', fotoSchema);
