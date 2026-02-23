import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
        const response = await axios.get(url);
        
        console.log('📋 Modelos disponibles en tu API de Gemini:\n');
        
        response.data.models.forEach(model => {
            console.log(`✅ ${model.name}`);
            console.log(`   Nombre corto: ${model.name.replace('models/', '')}`);
            if (model.supportedGenerationMethods) {
                console.log(`   Métodos: ${model.supportedGenerationMethods.join(', ')}`);
            }
            console.log('');
        });
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

listModels();
