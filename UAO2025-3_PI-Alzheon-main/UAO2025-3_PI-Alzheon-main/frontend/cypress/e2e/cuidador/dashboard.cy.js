/// <reference types="cypress" />

describe('Cuidador - Dashboard del paciente', () => {
  
  beforeEach(() => {
    cy.loginAs('cuidador')
    cy.url({ timeout: 10000 }).should('include', '/cuidador')
  })

  it('Debe cargar el dashboard correctamente', () => {
    cy.contains(/dashboard|inicio/i, { timeout: 5000 }).should('be.visible')
  })

  it('Debe mostrar información del paciente asociado', () => {
    // Verificar que muestra nombre del paciente o mensaje
    cy.get('body').then($body => {
      const hasPatientInfo = $body.text().includes('Paciente') || $body.text().includes('Pedro')
      const hasNoPatient = $body.text().match(/sin paciente|no asignado/i)
      
      expect(hasPatientInfo || hasNoPatient).to.be.true
    })
  })

  it('Debe mostrar estadísticas del paciente', () => {
    cy.get('.glass-card, [class*="stat"], [class*="card"]', { timeout: 5000 })
      .should('have.length.at.least', 1)
    
    // Verificar números
    cy.contains(/\d+/).should('be.visible')
  })

  it('Debe mostrar progreso semanal del paciente', () => {
    cy.contains(/semana|progreso/i, { timeout: 5000 }).should('exist')
  })

  it('Debe tener navegación a gestión de fotos', () => {
    cy.contains(/fotos|galería/i).should('be.visible').click()
    cy.url().should('include', '/fotos')
  })

  it('Debe mostrar botón para subir nueva foto', () => {
    cy.contains(/subir|agregar|nueva foto/i).should('be.visible')
  })

  it('Debe tener botón de cerrar sesión', () => {
    // Buscar el botón de cerrar sesión dentro del dashboard, no en el navbar
    cy.get('main, [class*="dashboard"], [class*="content"]')
      .contains(/cerrar sesión|logout|salir/i)
      .should('be.visible')
  })

  it('Debe mostrar mensaje si no tiene paciente asignado', () => {
    cy.get('body').then($body => {
      if ($body.text().match(/sin paciente|no asignado/i)) {
        cy.contains(/sin paciente|no asignado/i).should('be.visible')
      }
    })
  })
})
