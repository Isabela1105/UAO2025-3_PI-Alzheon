import { defineConfig } from "cypress";
import dotenv from 'dotenv';

// Cargar variables de entorno de Cypress
dotenv.config({ path: '.env.cypress' });

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:8080',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      // Pasar variables de entorno a Cypress
      config.env = {
        ...config.env,
        API_URL: process.env.CYPRESS_API_URL || 'http://localhost:5500',
        MEDICO_EMAIL: process.env.CYPRESS_MEDICO_EMAIL || 'medico@test.com',
        MEDICO_PASSWORD: process.env.CYPRESS_MEDICO_PASSWORD || 'Test1234!',
        CUIDADOR_EMAIL: process.env.CYPRESS_CUIDADOR_EMAIL || 'cuidador@test.com',
        CUIDADOR_PASSWORD: process.env.CYPRESS_CUIDADOR_PASSWORD || 'Test1234!',
        PACIENTE_EMAIL: process.env.CYPRESS_PACIENTE_EMAIL || 'paciente@test.com',
        PACIENTE_PASSWORD: process.env.CYPRESS_PACIENTE_PASSWORD || 'Test1234!',
        R2_PUBLIC_URL: process.env.CYPRESS_R2_PUBLIC_URL || 'https://pub-df2792cdde6643e78473234a1cfe7722.r2.dev'
      };
      return config;
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});

