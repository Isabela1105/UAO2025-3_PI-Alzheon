import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, r2Config } from '../config/r2.js';
import sharp from 'sharp';
import crypto from 'crypto';

/**
 * Genera un nombre único para el archivo
 */
const generateUniqueFileName = (prefix, extension) => {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(8).toString('hex');
    return `${prefix}-${timestamp}-${randomStr}.${extension}`;
};

/**
 * Comprimir imagen usando Sharp
 * @param {Buffer} buffer - Buffer de la imagen original
 * @returns {Promise<Buffer>} - Buffer de la imagen comprimida
 */
export const compressImage = async (buffer) => {
    try {
        // Comprimir a WebP con calidad 80%, máximo 1920px de ancho
        const compressed = await sharp(buffer)
            .resize(1920, null, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: 80 })
            .toBuffer();

        console.log(`✅ Imagen comprimida: ${buffer.length} → ${compressed.length} bytes`);
        return compressed;
    } catch (error) {
        console.error('❌ Error al comprimir imagen:', error);
        throw new Error('Error al comprimir la imagen');
    }
};

/**
 * Subir imagen a Cloudflare R2
 * @param {Buffer} buffer - Buffer de la imagen
 * @param {string} originalName - Nombre original del archivo
 * @returns {Promise<string>} - URL pública de la imagen
 */
export const uploadImageToR2 = async (buffer, originalName = 'image.jpg') => {
    try {
        // Comprimir imagen
        const compressedBuffer = await compressImage(buffer);

        // Generar nombre único
        const fileName = generateUniqueFileName('foto', 'webp');
        const key = `fotos/${fileName}`;

        // Subir a R2
        const command = new PutObjectCommand({
            Bucket: r2Config.bucketName,
            Key: key,
            Body: compressedBuffer,
            ContentType: 'image/webp',
        });

        await r2Client.send(command);

        // Retornar URL pública
        const publicUrl = `${r2Config.publicUrl}/${key}`;
        console.log(`✅ Imagen subida exitosamente: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error('❌ Error al subir imagen a R2:', error);
        throw new Error('Error al subir la imagen');
    }
};

/**
 * Subir audio a Cloudflare R2
 * @param {Buffer} buffer - Buffer del archivo de audio
 * @param {string} mimetype - Tipo MIME del audio
 * @param {string} originalName - Nombre original del archivo
 * @returns {Promise<string>} - URL pública del audio
 */
export const uploadAudioToR2 = async (buffer, mimetype, originalName = 'audio') => {
    try {
        // Determinar extensión del archivo
        const extension = mimetype.split('/')[1] || 'webm';
        
        // Generar nombre único
        const fileName = generateUniqueFileName('audio', extension);
        const key = `audios/${fileName}`;

        // Subir a R2
        const command = new PutObjectCommand({
            Bucket: r2Config.bucketName,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
        });

        await r2Client.send(command);

        // Retornar URL pública
        const publicUrl = `${r2Config.publicUrl}/${key}`;
        console.log(`✅ Audio subido exitosamente: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error('❌ Error al subir audio a R2:', error);
        throw new Error('Error al subir el audio');
    }
};

/**
 * Eliminar archivo de R2 (opcional, para implementación futura)
 * @param {string} fileUrl - URL del archivo a eliminar
 */
export const deleteFileFromR2 = async (fileUrl) => {
    try {
        // Extraer la key de la URL pública
        const key = fileUrl.replace(`${r2Config.publicUrl}/`, '');
        
        const command = new DeleteObjectCommand({
            Bucket: r2Config.bucketName,
            Key: key,
        });

        await r2Client.send(command);
        console.log(`✅ Archivo eliminado: ${key}`);
    } catch (error) {
        console.error('❌ Error al eliminar archivo:', error);
        throw new Error('Error al eliminar el archivo');
    }
};
