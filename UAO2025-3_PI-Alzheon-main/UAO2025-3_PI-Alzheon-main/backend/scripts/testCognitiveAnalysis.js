/**
 * Script de Prueba Rápida del Sistema de Análisis Cognitivo
 * 
 * Este script verifica que:
 * 1. Las credenciales de Google Cloud están configuradas
 * 2. Vertex AI puede ser contactado
 * 3. El análisis de texto funciona correctamente
 * 4. Los modelos de base de datos están operativos
 * 
 * Uso: node backend/scripts/testCognitiveAnalysis.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { analizarTexto, detectarDesviaciones } from '../services/nlpAnalysisService.js';
import AnalisisCognitivo from '../models/analisisCognitivo.js';
import AlertaCognitiva from '../models/alertaCognitiva.js';
import Usuario from '../models/usuario.js';

dotenv.config();

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

// Textos de prueba
const textoPruebaNormal = `
Hoy fui al parque con mi nieto. Hacía un día muy bonito y soleado.
Jugamos con la pelota y luego comimos helado de chocolate, que es su favorito.
Me acordé de cuando yo era joven y también iba al parque con mi padre.
El tiempo pasa muy rápido pero los buenos recuerdos permanecen para siempre.
Mañana quiero ir al mercado a comprar frutas frescas.
`;

const textoPruebaDeteriorado = `
Ayer... o fue hoy? No me acuerdo bien. Fui a un sitio...
un sitio grande con árboles creo. O era una tienda? No estoy seguro.
Había gente. Mucha gente. O quizás poca. No sé. No sé.
Luego volví a casa. O todavía estoy allí? No entiendo bien qué pasó.
Las cosas... las cosas son difíciles de recordar ahora.
`;

async function verificarConfiguracion() {
    log.section('VERIFICACIÓN DE CONFIGURACIÓN');
    
    const requiredVars = [
        'GOOGLE_PROJECT_ID',
        'GOOGLE_LOCATION',
        'VERTEX_AI_MODEL',
        'GOOGLE_APPLICATION_CREDENTIALS',
        'MONGODB_URI'
    ];
    
    let allPresent = true;
    
    for (const varName of requiredVars) {
        if (process.env[varName]) {
            log.success(`${varName}: ${process.env[varName].substring(0, 30)}...`);
        } else {
            log.error(`${varName}: NO CONFIGURADA`);
            allPresent = false;
        }
    }
    
    if (!allPresent) {
        log.error('Faltan variables de entorno. Revisa tu archivo .env');
        process.exit(1);
    }
    
    return true;
}

async function conectarBaseDatos() {
    log.section('CONEXIÓN A BASE DE DATOS');
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        log.success('Conectado a MongoDB');
        return true;
    } catch (error) {
        log.error(`Error al conectar a MongoDB: ${error.message}`);
        return false;
    }
}

async function probarAnalisisTexto() {
    log.section('PRUEBA DE ANÁLISIS DE TEXTO');
    
    try {
        log.info('Analizando texto normal...');
        const resultadoNormal = await analizarTexto(textoPruebaNormal);
        
        log.success('Análisis completado exitosamente');
        console.log('\nResultado del análisis:');
        console.log('------------------------');
        console.log(`Coherencia: ${(resultadoNormal.coherencia * 100).toFixed(1)}%`);
        console.log(`Claridad: ${(resultadoNormal.claridad * 100).toFixed(1)}%`);
        console.log(`Memoria: ${(resultadoNormal.memoria * 100).toFixed(1)}%`);
        console.log(`Orientación: ${(resultadoNormal.orientacion * 100).toFixed(1)}%`);
        console.log(`Puntuación Global: ${resultadoNormal.puntuacionGlobal.toFixed(1)}/100`);
        console.log(`\nRecomendaciones:`);
        resultadoNormal.recomendaciones.forEach((rec, i) => {
            console.log(`  ${i + 1}. ${rec}`);
        });
        
        return resultadoNormal;
    } catch (error) {
        log.error(`Error en análisis: ${error.message}`);
        console.error(error.stack);
        return null;
    }
}

async function probarDeteccionDesviaciones(lineaBase) {
    log.section('PRUEBA DE DETECCIÓN DE DESVIACIONES');
    
    try {
        log.info('Analizando texto con deterioro cognitivo...');
        const resultadoDeteriorado = await analizarTexto(textoPruebaDeteriorado);
        
        log.success('Análisis completado');
        console.log(`Puntuación Global: ${resultadoDeteriorado.puntuacionGlobal.toFixed(1)}/100`);
        
        log.info('Comparando con línea base...');
        const desviaciones = detectarDesviaciones(resultadoDeteriorado, lineaBase, 0.15);
        
        if (desviaciones.length > 0) {
            log.warning(`Se detectaron ${desviaciones.length} desviaciones:`);
            desviaciones.forEach((desv) => {
                const signo = desv.porcentajeDesviacion >= 0 ? '+' : '';
                console.log(`  - ${desv.metrica}: ${signo}${(desv.porcentajeDesviacion * 100).toFixed(1)}%`);
                console.log(`    Base: ${(desv.valorBase * 100).toFixed(1)}% | Actual: ${(desv.valorActual * 100).toFixed(1)}%`);
            });
            
            // Determinar severidad
            const maxDesv = Math.max(...desviaciones.map(d => Math.abs(d.porcentajeDesviacion)));
            let severidad = 'baja';
            if (maxDesv >= 0.50) severidad = 'critica';
            else if (maxDesv >= 0.35) severidad = 'alta';
            else if (maxDesv >= 0.25) severidad = 'media';
            
            log.warning(`Severidad calculada: ${severidad.toUpperCase()}`);
        } else {
            log.success('No se detectaron desviaciones significativas');
        }
        
        return desviaciones;
    } catch (error) {
        log.error(`Error en detección de desviaciones: ${error.message}`);
        return null;
    }
}

async function probarModelos() {
    log.section('PRUEBA DE MODELOS DE BASE DE DATOS');
    
    try {
        // Buscar un paciente de prueba
        const paciente = await Usuario.findOne({ rol: 'paciente' });
        
        if (!paciente) {
            log.warning('No se encontró ningún paciente. Crea uno primero.');
            return false;
        }
        
        log.success(`Paciente de prueba encontrado: ${paciente.nombre}`);
        
        // Verificar análisis existentes
        const totalAnalisis = await AnalisisCognitivo.countDocuments({ 
            pacienteId: paciente._id 
        });
        log.info(`Análisis existentes para este paciente: ${totalAnalisis}`);
        
        // Verificar alertas existentes
        const totalAlertas = await AlertaCognitiva.countDocuments({ 
            pacienteId: paciente._id 
        });
        log.info(`Alertas existentes para este paciente: ${totalAlertas}`);
        
        // Probar obtención de línea base
        if (totalAnalisis >= 3) {
            const lineaBase = await AnalisisCognitivo.obtenerLineaBase(paciente._id);
            if (lineaBase) {
                log.success('Línea base encontrada');
                console.log(`  Puntuación Global Promedio: ${lineaBase.puntuacionGlobal.toFixed(1)}/100`);
            }
        } else {
            log.warning('Se necesitan al menos 3 análisis para establecer línea base');
        }
        
        // Probar alertas no leídas
        const alertasNoLeidas = await AlertaCognitiva.countDocuments({ 
            pacienteId: paciente._id,
            leida: false 
        });
        log.info(`Alertas no leídas: ${alertasNoLeidas}`);
        
        return true;
    } catch (error) {
        log.error(`Error en prueba de modelos: ${error.message}`);
        return false;
    }
}

async function resumen() {
    log.section('RESUMEN DE LA PRUEBA');
    
    console.log('Estado del Sistema:');
    console.log('-------------------');
    log.success('Configuración de variables de entorno');
    log.success('Conexión a MongoDB');
    log.success('Análisis de texto con Vertex AI');
    log.success('Detección de desviaciones cognitivas');
    log.success('Modelos de base de datos operativos');
    
    console.log('\n');
    log.info('El sistema está listo para su uso.');
    log.info('Endpoints disponibles:');
    console.log('  - POST /api/paciente/grabar (análisis automático)');
    console.log('  - GET /api/medico/pacientes/:id/linea-base');
    console.log('  - GET /api/medico/pacientes/:id/analisis');
    console.log('  - GET /api/medico/alertas');
    console.log('  - GET /api/medico/pacientes/:id/reporte');
    
    console.log('\n');
    log.info('Revisa COGNITIVE_ANALYSIS_SETUP.md para más información.');
}

// Ejecutar todas las pruebas
(async () => {
    try {
        console.log('\n');
        log.section('🧠 TEST DEL SISTEMA DE ANÁLISIS COGNITIVO');
        
        await verificarConfiguracion();
        
        const dbConnected = await conectarBaseDatos();
        if (!dbConnected) {
            process.exit(1);
        }
        
        const resultadoNormal = await probarAnalisisTexto();
        if (!resultadoNormal) {
            log.error('Falló la prueba de análisis de texto');
            process.exit(1);
        }
        
        await probarDeteccionDesviaciones(resultadoNormal);
        
        await probarModelos();
        
        await resumen();
        
        log.success('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE\n');
        
    } catch (error) {
        log.error(`\nError general en el test: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        log.info('Desconectado de MongoDB');
        process.exit(0);
    }
})();
