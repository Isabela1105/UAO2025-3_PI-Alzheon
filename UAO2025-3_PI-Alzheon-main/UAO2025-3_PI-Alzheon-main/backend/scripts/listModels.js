import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
const envPath = path.join(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (!process.env.GOOGLE_API_KEY && result.parsed?.GOOGLE_API_KEY) {
    process.env.GOOGLE_API_KEY = result.parsed.GOOGLE_API_KEY;
}

console.log('='.repeat(60));
console.log('📋 LISTANDO MODELOS DISPONIBLES EN GOOGLE GEMINI');
console.log('='.repeat(60));
console.log('');

if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY no encontrada');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

try {
    console.log('🔍 Consultando modelos disponibles...');
    console.log('');
    
    // Listar modelos disponibles
    const models = await genAI.listModels();
    
    console.log(`✅ Se encontraron ${models.length} modelos`);
    console.log('');
    console.log('='.repeat(60));
    
    for (const model of models) {
        console.log('');
        console.log(`📦 Modelo: ${model.name}`);
        console.log(`   Nombre para display: ${model.displayName}`);
        console.log(`   Descripción: ${model.description || 'N/A'}`);
        console.log(`   Métodos soportados: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
        console.log(`   Formatos de entrada: ${model.inputTokenLimit || 'N/A'} tokens`);
    }
    
    console.log('');
    console.log('='.repeat(60));
    
} catch (error) {
    console.error('❌ Error al listar modelos:', error.message);
}
