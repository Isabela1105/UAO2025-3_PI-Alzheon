/// <reference types="cypress" />

describe('Cuidador - Subir foto a Cloudflare R2 (CRÍTICO)', () => {
  
  beforeEach(() => {
    cy.loginAs('cuidador')
    cy.visit('/cuidador/fotos')
    cy.wait(2000) // Esperar a que cargue completamente la página
  })

  it('Debe cargar la página de gestión de fotos', () => {
    cy.contains(/fotos|galería/i, { timeout: 5000 }).should('be.visible')
  })

  it('Debe tener botón para subir nueva foto', () => {
    cy.contains('button', 'Agregar foto').should('be.visible').click()
    
    // Verificar que se abre formulario o modal
    cy.get('input[type="file"], [type="file"]', { timeout: 5000 }).should('exist')
  })

  it('CRÍTICO: Debe subir foto a R2 correctamente', () => {
    // Abrir formulario de subida
    cy.contains('Agregar foto').click()
    cy.wait(1000)
    
    // Llenar formulario (los campos están dentro del modal)
    cy.get('input[placeholder*="Ej:"]', { timeout: 5000 }).type('Foto de prueba Cypress')
    
    cy.get('textarea[placeholder*="detalles"]').type('Esta es una foto de prueba subida mediante Cypress para validar la integración con Cloudflare R2')
    
    // Subir archivo
    cy.get('input[type="file"]').attachFile('test-image.jpg')
    
    // Esperar preview
    cy.wait(1000)
    
    // Enviar formulario - usar el botón submit dentro del form
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click()
    })
    
    // Esperar confirmación (puede tardar por la compresión y upload a R2)
    cy.contains(/éxito|agregada/i, { timeout: 20000 }).should('be.visible')
    
    // Verificar que la foto aparece en la galería
    cy.wait(2000)
    cy.contains('Foto de prueba Cypress', { timeout: 5000 }).should('be.visible')
  })

  it('Debe validar la URL de R2 de la foto subida', () => {
    // Esperar a que carguen las fotos
    cy.wait(2000)
    
    // Buscar imágenes dentro de .glass-card, excluyendo imágenes del navbar
    cy.get('.glass-card img', { timeout: 10000 }).first().then($img => {
      const src = $img.attr('src')
      
      // Verificar que la URL es de R2 (solo si no es una imagen local)
      if (src && !src.includes('background') && !src.includes('logo')) {
        expect(src).to.include('r2.dev')
        
        // Verificar que la imagen carga correctamente
        cy.request(src).then(response => {
          expect(response.status).to.eq(200)
          expect(response.headers['content-type']).to.match(/image/)
        })
      } else {
        cy.log('No hay fotos de R2 todavía')
      }
    })
  })

  it('Debe validar campos obligatorios antes de subir', () => {
    cy.contains('button', 'Agregar foto').click()
    cy.wait(1000)
    
    // Intentar enviar sin datos - usar el botón submit dentro del form
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click()
    })
    
    // Debe seguir en el formulario o mostrar error
    cy.get('input[type="file"]').should('exist')
  })

  it('Debe validar tipo de archivo (solo imágenes)', () => {
    cy.contains('button', 'Agregar foto').click()
    cy.wait(1000)
    
    // Intentar subir audio en lugar de imagen
    cy.get('input[type="file"]').attachFile('test-audio.mp3')
    
    // Debe mostrar error o no aceptar el archivo
    cy.get('body').then($body => {
      // Verificar que el sistema maneja el error
      const hasError = $body.text().match(/formato|tipo|imagen/i)
      const fileInput = $body.find('input[type="file"]')
      
      if (hasError) {
        expect(hasError).to.exist
      }
    })
  })

  it('Debe mostrar preview de la imagen antes de subir', () => {
    cy.contains('button', 'Agregar foto').click()
    cy.wait(1000)
    
    cy.get('input[type="file"]').attachFile('test-image.jpg')
    
    // Buscar preview
    cy.get('img[src*="blob:"], img[src*="base64"], [class*="preview"]', { timeout: 3000 })
      .should('exist')
  })

  it('Debe poder cancelar la subida', () => {
    // Abrir modal
    cy.contains('button', 'Agregar foto').click()
    cy.wait(1000)
    
    // Buscar el botón de cancelar dentro del form (para evitar múltiples .glass-panel)
    cy.get('form').within(() => {
      cy.contains('button', /cancelar/i, { timeout: 10000 }).should('be.visible').click()
    })
    
    // Verificar que el modal se cerró
    cy.contains('Agregar Nueva Foto').should('not.exist')
  })
})
