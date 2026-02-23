/// <reference types="cypress" />

describe('Auth - Login con todos los roles', () => {
  
  beforeEach(() => {
    cy.visit('/login')
  })

  it('Debe cargar la página de login correctamente', () => {
    cy.contains('Ingresar').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('Debe mostrar error con credenciales inválidas', () => {
    cy.get('input[type="email"]').type('noexiste@test.com')
    cy.get('input[type="password"]').type('WrongPassword123')
    cy.get('button[type="submit"]').click()
    
    cy.contains(/credenciales|incorrecta|error/i, { timeout: 5000 }).should('be.visible')
  })

  it('LOGIN PACIENTE - Debe iniciar sesión y redirigir al dashboard', () => {
    cy.get('input[type="email"]').type(Cypress.env('PACIENTE_EMAIL'))
    cy.get('input[type="password"]').type(Cypress.env('PACIENTE_PASSWORD'))
    cy.get('button[type="submit"]').click()
    
    // Verificar redirección
    cy.url({ timeout: 10000 }).should('include', '/paciente')
    
    // Verificar que está en el dashboard del paciente
    cy.contains('Mis Fotos', { timeout: 5000 }).should('be.visible')
    
    // Verificar cookie de autenticación
    cy.getCookie('token').should('exist')
  })

  it('LOGIN CUIDADOR - Debe iniciar sesión y redirigir al dashboard', () => {
    cy.get('input[type="email"]').type(Cypress.env('CUIDADOR_EMAIL'))
    cy.get('input[type="password"]').type(Cypress.env('CUIDADOR_PASSWORD'))
    cy.get('button[type="submit"]').click()
    
    // Verificar redirección
    cy.url({ timeout: 10000 }).should('include', '/cuidador')
    
    // Verificar que está en el dashboard del cuidador
    cy.contains(/fotos|paciente/i, { timeout: 5000 }).should('be.visible')
    
    // Verificar cookie de autenticación
    cy.getCookie('token').should('exist')
  })

  it('LOGIN MÉDICO - Debe iniciar sesión y redirigir al dashboard', () => {
    cy.get('input[type="email"]').type(Cypress.env('MEDICO_EMAIL'))
    cy.get('input[type="password"]').type(Cypress.env('MEDICO_PASSWORD'))
    cy.get('button[type="submit"]').click()
    
    // Verificar redirección
    cy.url({ timeout: 10000 }).should('include', '/medico')
    
    // Verificar que está en el dashboard del médico
    cy.contains(/pacientes|médico/i, { timeout: 5000 }).should('be.visible')
    
    // Verificar cookie de autenticación
    cy.getCookie('token').should('exist')
  })

  it('Debe validar campos vacíos', () => {
    cy.get('button[type="submit"]').click()
    
    // HTML5 validation o error custom
    cy.get('input[type="email"]:invalid').should('exist')
  })

  it('Debe validar formato de email', () => {
    cy.get('input[type="email"]').type('emailinvalido')
    cy.get('input[type="password"]').type('Test1234!')
    cy.get('button[type="submit"]').click()
    
    // HTML5 validation
    cy.get('input[type="email"]:invalid').should('exist')
  })
})
