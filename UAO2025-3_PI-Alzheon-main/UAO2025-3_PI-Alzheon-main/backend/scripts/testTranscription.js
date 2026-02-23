import dotenv from 'dotenv';
import { transcribeAudio } from '../services/transcriptionService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno ANTES de cualquier otra cosa
const envPath = path.join(__dirname, '..', '.env');
console.log('📂 Cargando variables de entorno desde:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('❌ Error cargando .env:', result.error);
    process.exit(1);
}

console.log('');
console.log('='.repeat(60));
console.log('🧪 TEST DE TRANSCRIPCIÓN CON GOOGLE GEMINI');
console.log('='.repeat(60));
console.log('');

// Verificar API Key
console.log('📋 Verificando configuración...');
console.log('');

// Debug: Mostrar todas las variables de entorno relacionadas
const googleKey = process.env.GOOGLE_API_KEY || result.parsed?.GOOGLE_API_KEY;

if (googleKey) {
    const keyPreview = googleKey.substring(0, 20) + '...';
    console.log(`✅ GOOGLE_API_KEY encontrada: ${keyPreview}`);
    console.log(`   Longitud completa: ${googleKey.length} caracteres`);
    
    // Forzar la variable en process.env si no está
    if (!process.env.GOOGLE_API_KEY && result.parsed?.GOOGLE_API_KEY) {
        process.env.GOOGLE_API_KEY = result.parsed.GOOGLE_API_KEY;
        console.log('   ℹ️ Variable forzada en process.env');
    }
} else {
    console.error('❌ GOOGLE_API_KEY NO está configurada en el archivo .env');
    console.error('   Archivo buscado:', envPath);
    console.error('   Variables cargadas:', Object.keys(result.parsed || {}).join(', '));
    console.error('');
    console.error('   Por favor agrega: GOOGLE_API_KEY=tu_clave_aqui');
    process.exit(1);
}

console.log('');
console.log('📝 Creando audio de prueba (texto a voz simulado)...');

// Crear un pequeño audio de prueba (WAV simple)
// Este es un archivo WAV mínimo de 1 segundo de silencio
const createTestWavBuffer = () => {
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const duration = 1; // 1 segundo
    const numSamples = sampleRate * duration;
    const blockAlign = numChannels * bitsPerSample / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    
    const buffer = Buffer.alloc(44 + dataSize);
    
    // WAV Header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size
    buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    
    // Silence (all zeros)
    buffer.fill(0, 44);
    
    return buffer;
};

const testAudioBuffer = createTestWavBuffer();
console.log(`✅ Audio de prueba creado (${testAudioBuffer.length} bytes)`);

console.log('');
console.log('🚀 Iniciando transcripción...');
console.log('-'.repeat(60));

try {
    const transcription = await transcribeAudio(testAudioBuffer, 'test-audio.wav');
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ RESULTADO DE LA TRANSCRIPCIÓN');
    console.log('='.repeat(60));
    
    if (transcription) {
        console.log('');
        console.log('📄 Transcripción:');
        console.log(transcription);
        console.log('');
        console.log(`📏 Longitud: ${transcription.length} caracteres`);
        console.log('');
        console.log('✅ ¡La transcripción funciona correctamente!');
    } else {
        console.log('');
        console.log('⚠️ La transcripción retornó null');
        console.log('   Revisa los logs anteriores para más detalles');
    }
    
} catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.log('❌ ERROR EN LA TRANSCRIPCIÓN');
    console.log('='.repeat(60));
    console.error('');
    console.error('Mensaje:', error.message);
    console.error('');
    console.error('Stack:', error.stack);
}

console.log('');
console.log('='.repeat(60));
console.log('🏁 Test completado');
console.log('='.repeat(60));
