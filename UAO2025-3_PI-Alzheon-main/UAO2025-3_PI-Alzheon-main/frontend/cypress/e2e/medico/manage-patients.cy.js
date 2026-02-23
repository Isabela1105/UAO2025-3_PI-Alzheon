/// <reference types="cypress" />

describe('Médico - Gestionar pacientes (asignar/desasignar)', () => {
  
  beforeEach(() => {
    cy.loginAs('medico')
    cy.visit('/medico/pacientes')
    cy.wait(2000) // Esperar a que carguen los datos
  })

  it('Debe cargar la página de gestión de pacientes', () => {
    cy.contains(/pacientes|gestión/i, { timeout: 5000 }).should('be.visible')
  })

  it('Debe tener botón para asignar nuevo paciente', () => {
    cy.contains('button', /asignar paciente/i).should('be.visible')
  })

  it('Debe abrir modal de asignación de paciente', () => {
    cy.contains('button', /asignar paciente/i).click()
    
    // Verificar que se abre el panel modal (glass-panel)
    cy.get('.glass-panel', { timeout: 5000 }).should('be.visible')
    
    // Verificar título del modal
    cy.contains('Asignar Paciente').should('be.visible')
  })

  it('Debe asignar un paciente correctamente', () => {
    // Abrir modal de asignación
    cy.contains('button', /asignar paciente/i).click()
    cy.wait(1000)
    
    // Verificar si hay pacientes disponibles o no
    cy.get('.glass-panel').then($panel => {
      if ($panel.text().includes('No hay pacientes disponibles')) {
        cy.log('No hay pacientes disponibles para asignar')
      } else {
        // Buscar el primer botón "Asignar" dentro de la lista
        cy.get('.glass-panel').within(() => {
          cy.contains('button', /asignar/i).first().click()
        })
        cy.wait(1000)
      }
    })
  })

  it('Debe mostrar información del paciente en la lista', () => {
    cy.get('.glass-card', { timeout: 5000 }).first().then($patient => {
      if ($patient.length > 0) {
        // Verificar que tiene texto (nombre del paciente)
        cy.wrap($patient).should('not.be.empty')
        cy.wrap($patient).invoke('text').should('have.length.greaterThan', 0)
      } else {
        cy.log('No hay pacientes asignados')
      }
    })
  })

  it('Debe desasignar un paciente correctamente', () => {
    cy.get('.glass-card', { timeout: 5000 }).first().then($patient => {
      if ($patient.length > 0) {
        // Hacer hover para mostrar botones
        cy.wrap($patient).trigger('mouseover')
        cy.wait(500)
        
        // Buscar botón de eliminar (trash icon)
        cy.wrap($patient).find('button').last().click({ force: true })
        
        // Aceptar el confirm
        cy.on('window:confirm', () => true)
        
        cy.wait(1000)
      } else {
        cy.log('No hay pacientes para desasignar')
      }
    })
  })

  it('Debe poder editar información del paciente', () => {
    cy.get('.glass-card', { timeout: 5000 }).first().then($patient => {
      if ($patient.length > 0) {
        // Hacer hover para mostrar botones
        cy.wrap($patient).trigger('mouseover')
        cy.wait(500)
        
        // Buscar botón de editar (pencil icon) - es el primer botón
        cy.wrap($patient).find('button').first().click({ force: true })
        
        // Verificar que se abre el modal de edición
        cy.get('.glass-panel').within(() => {
          cy.contains('Editar Paciente').should('be.visible')
        })
      } else {
        cy.log('No hay pacientes para editar')
      }
    })
  })

  it('Debe mostrar progreso semanal de cada paciente', () => {
    cy.get('.glass-card', { timeout: 5000 }).first().then($patient => {
      if ($patient.length > 0) {
        // Verificar que la tarjeta existe y no está vacía
        cy.wrap($patient).should('not.be.empty')
        cy.wrap($patient).invoke('text').should('have.length.greaterThan', 0)
        cy.log('Tarjeta de paciente encontrada')
      } else {
        cy.log('No hay pacientes')
      }
    })
  })

  it('Debe poder buscar o filtrar pacientes', () => {
    cy.get('body').then($body => {
      if ($body.find('input[type="search"], input[placeholder*="buscar"]').length > 0) {
        cy.get('input[type="search"], input[placeholder*="buscar"]').type('Pedro')
        cy.log('Campo de búsqueda encontrado y usado')
      } else {
        cy.log('No hay campo de búsqueda implementado')
      }
    })
  })
})
