import dotenv from 'dotenv';
// Asegurarnos de cargar variables de entorno siempre que se importe el servicio.
dotenv.config();

let resend = null;
let isTestMode = process.env.NODE_ENV === 'test';

if (!isTestMode) {
    // Sólo inicializar la librería Resend en entornos distintos a test
    try {
        const { Resend } = await import('resend');
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            throw new Error('RESEND_API_KEY no definida. Añádela en backend/.env o en las variables de entorno.');
        }
        resend = new Resend(resendApiKey);
    } catch (err) {
        // Re-lanzar para entornos que no sean test
        throw err;
    }
} else {
    // Modo test: guardaremos los emails enviados en memoria para inspección
    global.__SENT_EMAILS = global.__SENT_EMAILS || [];
}

/**
 * Envía un correo de recordatorio usando Resend.
 * @param {string} toEmail
 * @param {string} subject
 * @param {string} htmlBody
 */
export const sendReminderEmail = async (toEmail, subject, htmlBody) => {
    if (isTestMode) {
        // Almacenar en memoria para que las pruebas puedan inspeccionarlo
        const record = { to: toEmail, subject, html: htmlBody, id: `test-${Date.now()}` };
        global.__SENT_EMAILS.push(record);
        console.log(`(test) Email simulado a ${toEmail}: ${record.id}`);
        return record;
    }

    try {
        const data = await resend.emails.send({
            from: 'Alzheon <onboarding@resend.dev>',
            to: [toEmail],
            subject,
            html: htmlBody
        });

        console.log(`Email enviado a ${toEmail}: ${data.id || 'sin-id'}`);
        return data;
    } catch (error) {
        console.error('Error enviando email con Resend:', error?.message || error);
        throw error;
    }
};

/** Helper para construir un HTML simple */
export const buildReminderHtml = (nombre, motivationalMessage) => {
    return `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111">
            <h2>Hola ${nombre || 'amigo'},</h2>
            <p>${motivationalMessage}</p>
            <p>Un abrazo del equipo de Alzheon.</p>
        </div>
    `;
};

export const buildResetPasswordHtml = (nombre, resetLink) => {
    return `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111;"> 
            <div style="max-width:600px;margin:0 auto;background:linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.85));padding:24px;border-radius:16px;border:1px solid rgba(0,0,0,0.06);box-shadow:0 6px 18px rgba(0,0,0,0.08);">
                <h2 style="margin:0 0 8px 0;font-size:20px;color:#0b1221">Hola ${nombre || 'usuario'}</h2>
                <p style="margin:0 0 12px 0;color:#1f2937">Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para establecer una nueva contraseña.</p>
                <div style="text-align:center;margin:18px 0;">
                    <a href="${resetLink}" target="_blank" style="display:inline-block;padding:12px 20px;border-radius:12px;background:#0f1724;color:#fff;text-decoration:none;font-weight:600;">Restablecer contraseña</a>
                </div>
                <p style="margin:0 0 8px 0;color:#374151">Si no solicitaste este cambio, puedes ignorar este correo.</p>
                <p style="margin:0 0 8px 0;color:#6b7280">Este enlace expirará en 1 hora.</p>
                <p style="margin:14px 0 0 0;color:#6b7280">Saludos,<br/>Equipo Alzheon</p>
            </div>
        </div>
    `;
};
