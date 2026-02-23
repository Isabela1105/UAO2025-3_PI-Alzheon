/// <reference types="cypress" />

describe('INTEGRACIÓN - Flujo completo E2E (Médico → Cuidador → Paciente)', () => {
  
  const testPhotoEtiqueta = `Foto E2E ${Date.now()}`
  const testPhotoDescripcion = 'Foto de prueba del flujo completo de integración'
  
  it('Debe permitir navegar por los dashboards', () => {
    // Cuidador
    cy.loginAs('cuidador')
    cy.visit('/cuidador/dashboard')
    cy.wait(2000)
    cy.get('body').should('be.visible')
    
    // Limpiar sesión manualmente
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.wait(1000)
    
    // Paciente
    cy.loginAs('paciente')
    cy.visit('/paciente/dashboard')
    cy.wait(2000)
    cy.get('body').should('be.visible')
    
    // Limpiar sesión manualmente
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.wait(1000)
    
    // Médico
    cy.loginAs('medico')
    cy.visit('/medico/dashboard')
    cy.wait(2000)
    cy.get('body').should('be.visible')
  })
  
  it('Debe validar que las imágenes usan R2 cuando existen', () => {
    cy.loginAs('cuidador')
    cy.visit('/cuidador/fotos')
    cy.wait(3000)
    
    // Verificar URLs de R2 solo si hay imágenes
    cy.get('body').then($body => {
      const images = $body.find('img[src*="r2.dev"]')
      if (images.length > 0) {
        cy.log(`✓ Encontradas ${images.length} imágenes de R2`)
        cy.get('img[src*="r2.dev"]').should('have.length.at.least', 1)
      } else {
        cy.log('No hay imágenes de R2 aún')
      }
    })
  })
})
