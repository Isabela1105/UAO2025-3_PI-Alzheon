import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['paciente', 'cuidador/familiar', 'medico'],
        required: true
    },
    // Relación para cuidadores/familiares
    pacienteAsociado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false
    },
    // Relación inversa para pacientes (múltiples cuidadores)
    cuidadores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    // Relación para médicos (pacientes asignados)
    pacientesAsignados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    // Relación inversa para pacientes (múltiples médicos)
    medicosAsignados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    // Campos para recuperación de contraseña
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, {
    timestamps: true
});

// Índice para mejorar búsquedas por rol y relaciones
usuarioSchema.index({ rol: 1 });
usuarioSchema.index({ pacienteAsociado: 1 });

export default mongoose.model('Usuario', usuarioSchema);