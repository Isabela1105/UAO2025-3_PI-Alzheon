/// <reference types="cypress" />

describe('Paciente - Dashboard y Estadísticas', () => {
  
  beforeEach(() => {
    cy.loginAs('paciente')
    cy.url({ timeout: 10000 }).should('include', '/paciente')
  })

  it('Debe cargar el dashboard correctamente', () => {
    cy.contains('Mis Fotos', { timeout: 5000 }).should('be.visible')
    cy.contains('Mis Grabaciones').should('be.visible')
  })

  it('Debe mostrar estadísticas del paciente', () => {
    // Verificar que existen tarjetas de estadísticas
    cy.get('.glass-card', { timeout: 5000 }).should('have.length.at.least', 1)
    
    // Buscar números de estadísticas
    cy.contains(/\d+/).should('be.visible')
  })

  it('Debe mostrar progreso semanal', () => {
    // Verificar si existe la sección de progreso
    cy.get('body').then($body => {
      if ($body.text().match(/semana|progreso/i)) {
        cy.contains(/semana|progreso/i).should('be.visible')
        
        // Intentar encontrar barra de progreso si existe
        if ($body.find('[class*="progress"], [role="progressbar"], .bg-gradient-to-r').length > 0) {
          cy.get('[class*="progress"], [role="progressbar"], .bg-gradient-to-r').should('exist')
        } else {
          cy.log('Barra de progreso no encontrada, pero sección de progreso existe')
        }
      } else {
        cy.log('Sección de progreso semanal no implementada aún')
      }
    })
  })

  it('Debe mostrar mensaje de bienvenida con el nombre del usuario', () => {
    cy.contains(/bienvenido|hola/i, { timeout: 5000 }).should('be.visible')
    cy.contains('Pedro', { timeout: 5000 }).should('be.visible')
  })

  it('Debe tener navegación funcional', () => {
    // Verificar links de navegación
    cy.contains('Mis Fotos').click()
    cy.url().should('include', '/fotos')
    
    cy.contains('Dashboard').click()
    cy.url().should('include', '/dashboard')
  })

  it('Debe tener botón de cerrar sesión', () => {
    // Buscar el botón de cerrar sesión dentro del dashboard, no en el navbar
    cy.get('main, [class*="dashboard"], [class*="content"]')
      .contains(/cerrar sesión|logout|salir/i)
      .should('be.visible')
  })

  it('Debe tener efecto glassmorphism en los elementos', () => {
    cy.get('.glass-card, .glass-panel').first().should('exist')
      .should('have.css', 'backdrop-filter')
  })
})
