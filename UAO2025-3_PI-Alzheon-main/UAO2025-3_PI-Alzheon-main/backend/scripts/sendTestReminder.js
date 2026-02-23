import dotenv from 'dotenv';
import { sendReminderEmail, buildReminderHtml } from '../services/reminderMailer.js';

// Cargar variables desde backend/.env
dotenv.config();

const TARGET = process.argv[2] || 'josedaniel3046@gmail.com';
const NAME = 'Jose';
const MESSAGE = 'Este es un mensaje motivacional de prueba desde Alzheon. ¡Sigue adelante!';

const main = async () => {
    try {
        const html = buildReminderHtml(NAME, MESSAGE);
        const res = await sendReminderEmail(TARGET, 'Recordatorio de prueba - Alzheon', html);
        console.log('Resultado Resend:', res);
        process.exit(0);
    } catch (err) {
        console.error('Error enviando correo de prueba:', err);
        process.exit(2);
    }
};

main();
