import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Usuario from '../models/usuario.js';

// Cargar variables de entorno
dotenv.config();

const fixMedicosAsignados = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Obtener todos los médicos
        const medicos = await Usuario.find({ rol: 'medico' });
        console.log(`\n📋 Encontrados ${medicos.length} médicos`);

        let totalFixed = 0;

        for (const medico of medicos) {
            console.log(`\n🩺 Médico: ${medico.nombre} (${medico.email})`);
            console.log(`   Pacientes asignados: ${medico.pacientesAsignados.length}`);

            for (const pacienteId of medico.pacientesAsignados) {
                const paciente = await Usuario.findById(pacienteId);
                
                if (!paciente) {
                    console.log(`   ⚠️  Paciente ${pacienteId} no encontrado`);
                    continue;
                }

                // Verificar si el médico ya está en medicosAsignados del paciente
                if (!paciente.medicosAsignados.includes(medico._id)) {
                    paciente.medicosAsignados.push(medico._id);
                    await paciente.save();
                    console.log(`   ✅ Agregado médico a paciente: ${paciente.nombre}`);
                    totalFixed++;
                } else {
                    console.log(`   ✓  Paciente ${paciente.nombre} ya tenía el médico asignado`);
                }
            }
        }

        console.log(`\n🎉 Proceso completado!`);
        console.log(`   Total de relaciones corregidas: ${totalFixed}`);

        await mongoose.connection.close();
        console.log('\n✅ Conexión cerrada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixMedicosAsignados();
