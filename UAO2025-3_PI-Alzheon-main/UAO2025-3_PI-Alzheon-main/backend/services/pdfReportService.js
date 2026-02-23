import PDFDocument from 'pdfkit';
import crypto from 'crypto';

/**
 * Generar reporte PDF de análisis cognitivo
 */
export const generarReportePDF = (paciente, lineaBase, promedios, analisisHistorial, encriptar = false) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            
            // Capturar el contenido del PDF en memoria
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                let buffer = Buffer.concat(chunks);
                
                // Encriptar si se solicita
                if (encriptar) {
                    buffer = encriptarReporte(buffer);
                }
                
                resolve(buffer);
            });
            doc.on('error', reject);

            // === ENCABEZADO ===
            doc.fontSize(24).font('Helvetica-Bold').text('Reporte de Análisis Cognitivo', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica').text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, { align: 'center' });
            doc.moveDown(2);

            // === INFORMACIÓN DEL PACIENTE ===
            doc.fontSize(16).font('Helvetica-Bold').text('Información del Paciente');
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica');
            doc.text(`Nombre: ${paciente.nombre}`);
            doc.text(`Email: ${paciente.email}`);
            doc.text(`Total de análisis: ${analisisHistorial.length}`);
            doc.moveDown(1.5);

            // === LÍNEA BASE ===
            if (lineaBase) {
                doc.fontSize(16).font('Helvetica-Bold').text('Línea Base (Primeros 3 análisis)');
                doc.moveDown(0.5);
                
                // Tabla de métricas base
                const metricas = ['coherencia', 'claridad', 'riquezaLexica', 'memoria', 'emocion', 'orientacion', 'razonamiento', 'atencion'];
                const metricLabels = {
                    coherencia: 'Coherencia',
                    claridad: 'Claridad',
                    riquezaLexica: 'Riqueza Léxica',
                    memoria: 'Memoria',
                    emocion: 'Emoción',
                    orientacion: 'Orientación',
                    razonamiento: 'Razonamiento',
                    atencion: 'Atención'
                };

                doc.fontSize(10);
                metricas.forEach(metrica => {
                    const valor = lineaBase[metrica];
                    const porcentaje = Math.round(valor * 100);
                    doc.text(`${metricLabels[metrica]}: ${porcentaje}%`, { continued: true });
                    doc.text(` ${'█'.repeat(Math.floor(porcentaje / 5))}`, { align: 'right' });
                });
                
                doc.fontSize(12);
                doc.text(`\nPuntuación Global: ${lineaBase.puntuacionGlobal.toFixed(1)}/100`);
                doc.moveDown(1.5);
            }

            // === PROMEDIOS DEL PERÍODO ===
            if (promedios) {
                doc.fontSize(16).font('Helvetica-Bold').text('Promedios del Período Actual');
                doc.moveDown(0.5);
                
                doc.fontSize(10);
                const metricas = ['coherencia', 'claridad', 'riquezaLexica', 'memoria', 'emocion', 'orientacion', 'razonamiento', 'atencion'];
                const metricLabels = {
                    coherencia: 'Coherencia',
                    claridad: 'Claridad',
                    riquezaLexica: 'Riqueza Léxica',
                    memoria: 'Memoria',
                    emocion: 'Emoción',
                    orientacion: 'Orientación',
                    razonamiento: 'Razonamiento',
                    atencion: 'Atención'
                };

                metricas.forEach(metrica => {
                    const valor = promedios[metrica];
                    const porcentaje = Math.round(valor * 100);
                    let diferencia = '';
                    
                    if (lineaBase && lineaBase[metrica]) {
                        const diff = ((valor - lineaBase[metrica]) / lineaBase[metrica]) * 100;
                        const signo = diff >= 0 ? '+' : '';
                        diferencia = ` (${signo}${diff.toFixed(1)}% vs base)`;
                    }
                    
                    doc.text(`${metricLabels[metrica]}: ${porcentaje}%${diferencia}`, { continued: true });
                    doc.text(` ${'█'.repeat(Math.floor(porcentaje / 5))}`, { align: 'right' });
                });
                
                doc.fontSize(12);
                doc.text(`\nPuntuación Global: ${promedios.puntuacionGlobal.toFixed(1)}/100`);
                doc.moveDown(1.5);
            }

            // === HISTORIAL DE ANÁLISIS ===
            doc.fontSize(16).font('Helvetica-Bold').text('Historial de Análisis');
            doc.moveDown(0.5);

            analisisHistorial.slice(0, 10).forEach((analisis, index) => {
                if (doc.y > 700) {
                    doc.addPage();
                }

                doc.fontSize(12).font('Helvetica-Bold');
                doc.text(`${index + 1}. ${new Date(analisis.fechaAnalisis).toLocaleDateString('es-ES')}`, { continued: true });
                doc.font('Helvetica').text(` - Puntuación: ${analisis.puntuacionGlobal.toFixed(1)}/100`);
                
                if (analisis.observaciones) {
                    doc.fontSize(10).font('Helvetica');
                    doc.text(`   Observaciones: ${analisis.observaciones}`, { indent: 20 });
                }

                if (analisis.alertas && analisis.alertas.length > 0) {
                    doc.fontSize(10).font('Helvetica');
                    doc.text(`   Alertas: ${analisis.alertas.join(', ')}`, { indent: 20 });
                }
                
                doc.moveDown(0.5);
            });

            // === PIE DE PÁGINA ===
            doc.moveDown(2);
            doc.fontSize(8).font('Helvetica').fillColor('gray');
            doc.text('Este reporte es confidencial y está destinado únicamente para uso médico profesional.', { align: 'center' });
            doc.text('Alzheon - Sistema de Monitoreo Cognitivo', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Encriptar reporte usando AES-256-CBC
 */
function encriptarReporte(buffer) {
    const key = Buffer.from(process.env.REPORT_ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    
    // Retornar IV + datos encriptados
    return Buffer.concat([iv, encrypted]);
}

/**
 * Desencriptar reporte
 */
export const desencriptarReporte = (encryptedBuffer) => {
    const key = Buffer.from(process.env.REPORT_ENCRYPTION_KEY, 'hex');
    const iv = encryptedBuffer.slice(0, 16);
    const encrypted = encryptedBuffer.slice(16);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    
    return decrypted;
};
