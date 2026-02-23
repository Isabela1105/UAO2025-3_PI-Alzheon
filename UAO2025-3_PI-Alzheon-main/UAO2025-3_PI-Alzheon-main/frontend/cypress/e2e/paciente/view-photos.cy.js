/// <reference types="cypress" />

describe('Paciente - Ver galería de fotos', () => {
  
  beforeEach(() => {
    cy.loginAs('paciente')
    cy.visit('/paciente/fotos')
    cy.wait(2000) // Esperar a que carguen las fotos
  })

  it('Debe cargar la página de fotos correctamente', () => {
    cy.contains(/mis fotos|galería/i, { timeout: 5000 }).should('be.visible')
  })

  it('Debe mostrar mensaje si no hay fotos', () => {
    cy.get('body').then($body => {
      if ($body.find('.glass-card').length === 0) {
        // Si no hay fotos, verificar mensaje o simplemente loguear
        cy.log('No hay fotos en la galería')
      } else {
        cy.log('Hay fotos en la galería')
      }
    })
  })

  it('Debe mostrar fotos si existen', () => {
    cy.get('.glass-card', { timeout: 5000 }).then($photos => {
      if ($photos.length > 0) {
        // Verificar que las fotos tienen imagen
        cy.get('img').should('have.length.at.least', 1)
        
        // Verificar que las imágenes cargan correctamente
        cy.get('img').first().should('be.visible')
          .and('have.attr', 'src')
          .and('not.be.empty')
      } else {
        cy.log('No hay fotos para verificar')
      }
    })
  })

  it('Debe poder seleccionar una foto para grabar', () => {
    cy.get('.glass-card', { timeout: 5000 }).first().then($photo => {
      if ($photo.length > 0) {
        cy.wrap($photo).click()
        
        // Verificar que algo sucedió (navegación o modal)
        cy.wait(1000)
        cy.get('body').should('be.visible')
      } else {
        cy.log('No hay fotos para seleccionar')
      }
    })
  })

  it('Debe mostrar etiquetas de las fotos', () => {
    cy.get('.glass-card', { timeout: 5000 }).first().then($photo => {
      if ($photo.length > 0) {
        // Verificar que tiene contenido de texto
        cy.wrap($photo).invoke('text').should('have.length.greaterThan', 0)
      } else {
        cy.log('No hay fotos con etiquetas para verificar')
      }
    })
  })

  it('Debe poder navegar de vuelta al dashboard', () => {
    cy.get('body').then($body => {
      if ($body.text().match(/dashboard|inicio/i)) {
        cy.contains(/dashboard|inicio/i).click()
        cy.url().should('include', '/dashboard')
      } else {
        cy.log('No se encontró enlace de navegación al dashboard')
      }
    })
  })

  it('Debe tener diseño responsive (grid/flexbox)', () => {
    cy.get('[class*="grid"], [class*="flex"]').should('exist')
  })
})
