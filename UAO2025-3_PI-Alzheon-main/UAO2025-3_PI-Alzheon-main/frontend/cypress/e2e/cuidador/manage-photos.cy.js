/// <reference types="cypress" />

describe('Cuidador - Gestión de fotos', () => {
  
  beforeEach(() => {
    cy.loginAs('cuidador')
    cy.visit('/cuidador/fotos')
    cy.wait(2000)
  })

  it('Debe cargar la página correctamente', () => {
    cy.contains(/gestión de fotos|fotografías/i).should('be.visible')
    cy.contains('Agregar foto').should('be.visible')
  })

  it('Debe mostrar fotos en grid si existen', () => {
    cy.get('body').then($body => {
      if ($body.find('.glass-card.group').length > 0) {
        cy.get('.glass-card.group').should('have.length.at.least', 1)
        cy.get('[class*="grid"]').should('exist')
      } else {
        cy.log('No hay fotos todavía')
      }
    })
  })

  it('Debe mostrar botones de editar/eliminar al hacer hover', () => {
    cy.get('body').then($body => {
      // Buscar específicamente cards que contengan imágenes (las fotos)
      const photoCards = $body.find('.glass-card.group')
      
      if (photoCards.length > 0) {
        cy.get('.glass-card.group').first().as('photoCard')
        cy.get('@photoCard').trigger('mouseover')
        cy.wait(500)
        
        // Los botones están en un div con opacity-0 group-hover:opacity-100
        cy.get('@photoCard').find('button').should('have.length', 2)
      } else {
        cy.log('No hay fotos para probar hover')
      }
    })
  })

  it('Debe abrir modal de editar al hacer clic en el botón de lápiz', () => {
    cy.get('body').then($body => {
      const photoCards = $body.find('.glass-card.group')
      
      if (photoCards.length > 0) {
        cy.get('.glass-card.group').first().as('photoCard')
        cy.get('@photoCard').trigger('mouseover')
        cy.wait(500)
        
        // Click en el primer botón (editar)
        cy.get('@photoCard').find('button').first().click({ force: true })
        
        // Verificar que abre el modal
        cy.contains('Editar Foto').should('be.visible')
        cy.contains('Título de la foto').should('be.visible')
      } else {
        cy.log('No hay fotos para editar')
      }
    })
  })

  it('Debe poder cancelar la edición', () => {
    cy.get('body').then($body => {
      const photoCards = $body.find('.glass-card.group')
      
      if (photoCards.length > 0) {
        cy.get('.glass-card.group').first().as('photoCard')
        cy.get('@photoCard').trigger('mouseover')
        cy.wait(500)
        cy.get('@photoCard').find('button').first().click({ force: true })
        
        // Cancelar
        cy.contains('button', 'Cancelar').click()
        
        // Modal debe cerrarse
        cy.contains('Editar Foto').should('not.exist')
      } else {
        cy.log('No hay fotos para probar cancelación de edición')
      }
    })
  })

  it('Debe abrir modal de confirmación al eliminar', () => {
    cy.get('body').then($body => {
      const photoCards = $body.find('.glass-card.group')
      
      if (photoCards.length > 0) {
        cy.get('.glass-card.group').first().as('photoCard')
        cy.get('@photoCard').trigger('mouseover')
        cy.wait(500)
        
        // Click en el segundo botón (eliminar)
        cy.get('@photoCard').find('button').eq(1).click({ force: true })
        
        // Verificar modal de confirmación
        cy.contains(/¿eliminar foto?/i).should('be.visible')
        cy.contains(/no se puede deshacer/i).should('be.visible')
      } else {
        cy.log('No hay fotos para eliminar')
      }
    })
  })

  it('Debe poder cancelar la eliminación', () => {
    cy.get('body').then($body => {
      const photoCards = $body.find('.glass-card.group')
      
      if (photoCards.length > 0) {
        const initialCount = photoCards.length
        
        cy.get('.glass-card.group').first().as('photoCard')
        cy.get('@photoCard').trigger('mouseover')
        cy.wait(500)
        cy.get('@photoCard').find('button').eq(1).click({ force: true })
        
        // Cancelar
        cy.contains('button', 'Cancelar').click()
        
        // Modal debe cerrarse y mantener la misma cantidad
        cy.contains(/¿eliminar foto?/i).should('not.exist')
        cy.get('.glass-card.group').should('have.length', initialCount)
      } else {
        cy.log('No hay fotos para probar cancelación')
      }
    })
  })

  it('Debe tener botón para agregar nuevas fotos', () => {
    cy.contains('button', 'Agregar foto').should('be.visible').click()
    
    // Verificar que abre el modal
    cy.contains('Agregar Nueva Foto').should('be.visible')
  })
})
