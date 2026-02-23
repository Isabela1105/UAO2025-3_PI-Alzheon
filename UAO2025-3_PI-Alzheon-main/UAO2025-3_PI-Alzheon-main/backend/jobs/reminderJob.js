import Configuracion from '../models/configuracion.js';
import Usuario from '../models/usuario.js';
import { sendReminderEmail, buildReminderHtml } from '../services/reminderMailer.js';

const MS_MINUTE = 60 * 1000;

const calculateNextSession = (hour, frequency) => {
    const now = new Date();
    const [hours, minutes] = (hour || '10:00').split(':');
    const nextSession = new Date();
    nextSession.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // Si ya pasó la hora de hoy, empezar desde mañana
    if (nextSession <= now) {
        nextSession.setDate(nextSession.getDate() + 1);
    }

    // Ajustar según frecuencia
    switch (frequency) {
        case 'cada_2_dias':
            // ya se avanzó 1 si pasó hoy; sumar 1 más para total 2
            nextSession.setDate(nextSession.getDate() + 1);
            break;
        case 'semanal':
            // avanzar 6 días más para completar 7
            nextSession.setDate(nextSession.getDate() + 6);
            break;
        // 'diario' no necesita ajuste adicional
    }

    return nextSession;
};

const processDueReminders = async () => {
    try {
        const now = new Date();
        // Buscar configuraciones con recordatorios activos y nextSession <= now
        const dueConfigs = await Configuracion.find({
            'recordatorios.enabled': true,
            'recordatorios.nextSession': { $lte: now }
        }).populate('usuarioId', 'nombre email');

        if (!dueConfigs.length) return;

        console.log(`Encontrados ${dueConfigs.length} recordatorios pendientes`);

        for (const config of dueConfigs) {
            try {
                const usuario = config.usuarioId;
                if (!usuario || !usuario.email) {
                    console.warn('Configuracion sin usuario o email, id:', config._id);
                    continue;
                }

                const subject = 'Recordatorio de Alzheon';
                const html = buildReminderHtml(usuario.nombre, config.recordatorios.motivationalMessage);

                await sendReminderEmail(usuario.email, subject, html);

                // calcular y guardar la próxima sesión
                const next = calculateNextSession(config.recordatorios.hour, config.recordatorios.frequency);
                config.recordatorios.nextSession = next;
                await config.save();

                console.log(`Recordatorio procesado para ${usuario.email}. Próxima: ${next.toISOString()}`);
            } catch (err) {
                console.error('Error procesando un recordatorio:', err?.message || err);
            }
        }
    } catch (error) {
        console.error('Error al consultar recordatorios:', error?.message || error);
    }
};

export const startReminderWorker = (intervalMs = MS_MINUTE) => {
    console.log('Iniciando worker de recordatorios, interval (ms):', intervalMs);
    // Ejecutar inmediatamente y luego en intervalo
    processDueReminders();
    const id = setInterval(processDueReminders, intervalMs);
    return () => clearInterval(id);
};
