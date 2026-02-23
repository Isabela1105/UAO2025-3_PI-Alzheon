/// <reference types="cypress" />

describe('Auth - Registro de usuarios', () => {
  
  beforeEach(() => {
    cy.visit('/register')
  })

  it('Debe cargar la página de registro correctamente', () => {
    cy.contains(/registr|crear cuenta/i).should('be.visible')
    cy.get('input[name="nombre"]').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('select[name="rol"]').should('be.visible')
  })

  it('Debe validar campos obligatorios', () => {
    cy.get('button[type="submit"]').click()
    
    // Verificar que no redirija
    cy.url().should('include', '/register')
  })

  it('Debe validar formato de email', () => {
    cy.get('input[name="nombre"]').type('Usuario Test')
    cy.get('input[type="email"]').type('emailinvalido')
    cy.get('input[type="password"]').first().type('Test1234!')
    cy.get('select[name="rol"]').select('paciente')
    cy.get('button[type="submit"]').click()
    
    // HTML5 validation
    cy.get('input[type="email"]:invalid').should('exist')
  })

  it('Debe registrar un nuevo paciente correctamente', () => {
    const timestamp = Date.now()
    const email = `paciente${timestamp}@test.com`
    
    cy.get('input[name="nombre"]').type('Nuevo Paciente Test')
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').first().type('Test1234!')
    cy.get('input[type="password"]').eq(1).type('Test1234!')
    cy.get('select[name="rol"]').select('paciente')
    cy.get('button[type="submit"]').click()
    
    // Verificar que se registró y redirigió
    cy.url({ timeout: 10000 }).should('match', /login|paciente/)
  })

  it('Debe mostrar error si el email ya existe', () => {
    // Intentar registrar con email existente
    cy.get('input[name="nombre"]').type('Usuario Duplicado')
    cy.get('input[type="email"]').type(Cypress.env('PACIENTE_EMAIL'))
    cy.get('input[type="password"]').first().type('Test1234!')
    cy.get('input[type="password"]').eq(1).type('Test1234!')
    cy.get('select[name="rol"]').select('paciente')
    cy.get('button[type="submit"]').click()
    
    // Verificar mensaje de error
    cy.contains(/ya existe|registrado|duplicado/i, { timeout: 5000 }).should('be.visible')
  })

  it('Debe tener link para ir al login', () => {
    cy.contains(/iniciar sesión|login/i).should('be.visible').click()
    cy.url().should('include', '/login')
  })
})
