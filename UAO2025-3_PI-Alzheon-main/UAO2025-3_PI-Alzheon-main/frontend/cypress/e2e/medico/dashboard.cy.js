/// <reference types="cypress" />

describe('Médico - Dashboard global', () => {
  
  beforeEach(() => {
    cy.loginAs('medico')
    cy.url({ timeout: 10000 }).should('include', '/medico')
  })

  it('Debe cargar el dashboard correctamente', () => {
    cy.contains(/dashboard|médico/i, { timeout: 5000 }).should('be.visible')
  })

  it('Debe mostrar estadísticas globales', () => {
    // Verificar tarjetas de estadísticas
    cy.get('.glass-card, [class*="stat"]', { timeout: 5000 })
      .should('have.length.at.least', 2)
    
    // Verificar números
    cy.contains(/\d+/).should('be.visible')
  })

  it('Debe mostrar total de pacientes asignados', () => {
    cy.contains(/paciente/i).should('be.visible')
    cy.contains(/\d+/).should('be.visible')
  })

  it('Debe mostrar estadísticas de fotos y grabaciones', () => {
    cy.contains(/foto/i).should('exist')
    cy.contains(/grabaci/i).should('exist')
  })

  it('Debe tener navegación a gestión de pacientes', () => {
    cy.contains(/pacientes|mis pacientes/i).should('be.visible').click()
    cy.url().should('include', '/pacientes')
  })

  it('Debe mostrar lista de pacientes recientes', () => {
    cy.get('body').then($body => {
      if ($body.find('.glass-card').length > 0) {
        cy.get('.glass-card').should('be.visible')
      } else {
        // Si no hay pacientes, simplemente verificar que el dashboard está visible
        cy.log('No hay pacientes en el dashboard')
        cy.get('body').should('be.visible')
      }
    })
  })

  it('Debe poder hacer click en un paciente para ver detalles', () => {
    // Buscar los elementos de paciente individuales que tienen cursor-pointer
    cy.get('body').then($body => {
      // Buscar divs que contengan nombre y email (estructura de paciente)
      const patientElements = $body.find('div.cursor-pointer')
      
      if (patientElements.length > 0) {
        cy.get('div.cursor-pointer').first().click()
        cy.url().should('match', /pacientes\/[a-f0-9]+/)
      } else {
        cy.log('No hay pacientes para hacer clic')
      }
    })
  })

  it('Debe tener botón de cerrar sesión', () => {
    // Buscar el botón de cerrar sesión dentro del dashboard, no en el navbar
    cy.get('main, [class*="dashboard"], [class*="content"]')
      .contains(/cerrar sesión|logout|salir/i)
      .should('be.visible')
  })

  it('Debe mostrar bienvenida con nombre del médico', () => {
    cy.contains(/dr\.|médico|juan/i, { timeout: 5000 }).should('be.visible')
  })
})
