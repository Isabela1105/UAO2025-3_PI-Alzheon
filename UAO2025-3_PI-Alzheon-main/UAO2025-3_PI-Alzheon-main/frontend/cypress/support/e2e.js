// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Import cypress-file-upload
import 'cypress-file-upload'

// Configuración global
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar errores de React en desarrollo
  if (err.message.includes('ResizeObserver') || err.message.includes('chunk')) {
    return false
  }
  return true
})

// Configuración de timeouts
Cypress.config('defaultCommandTimeout', 10000)
Cypress.config('requestTimeout', 10000)
Cypress.config('responseTimeout', 10000)

// Limpiar antes de cada test
beforeEach(() => {
  // Limpiar localStorage y cookies antes de cada test
  cy.clearLocalStorage()
  cy.clearCookies()
})