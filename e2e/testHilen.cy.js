//_________________________________________________________________________
//                         MÓDULO CONTACT
//_________________________________________________________________________
//Para que corra sin errores:

Cypress.on('uncaught:exception', (err, runnable) => {
    return false
})
describe('Módulo Contacto', () => {

    beforeEach(() => {
        cy.visit('https://automationintesting.online/')
        cy.contains('Contact').click()
    })

    it('TC-CONT-01 - Envío exitoso del formulario con datos válidos', () => {

        cy.fixture('contacto').then((data) => {

            cy.completarFormularioContacto(data.valido)

            cy.contains('Submit').click()

            cy.get('#contact h3')
            .should('contain.text', 'Thanks for getting in touch')
            .and('contain.text', data.valido.name) 
        })
    })

    it('TC-CONT-02 - Intento envio con formulario vacio', () => {

        cy.contains('Submit').click()

        cy.contains('Name may not be blank')
            .should('be.visible')

        cy.contains('Email may not be blank')
            .should('be.visible')
    })

    it('TC-CONT-03 - Validación de longitud mínima en el campo Message', () => {
    
    cy.fixture('contacto').then((data) => {

        cy.completarFormularioContacto(data.mensajeCorto)

        cy.contains('Submit').click()

        cy.contains('Message must be between 20 and 2000 characters.')
            .should('be.visible')
    }) 
    })

//_________________________________________________________________________
//                          BUGS-CONTACT
// ________________________________________________________________________

    it('TC-CONT-04 - Ingreso de caracteres numéricos en el campo Name', () => {

    cy.fixture('contacto').then((data) => {

        cy.completarFormularioContacto(data.nombreNum)

        cy.contains('Submit').click()

        cy.contains('Name is invalid')
        .should('be.visible') 
    })

    })

    it('TC-CONT-05 - Ingreso incompleto en el Campo Email', () => {

    cy.fixture('contacto').then((data) => {

        cy.completarFormularioContacto(data.emailInvalido)

        cy.contains('Submit').click()

        cy.contains('Please enter a valid email address')
        .should('be.visible')
        })

    })

    it('TC-CONT-06 - Ingreso de un solo carácter en el campo Name', () => {

    cy.fixture('contacto').then((data) => {

        cy.completarFormularioContacto(data.nameUnCaracter)

        cy.contains('Submit').click()

        cy.contains('Name must be between 3 and 30 characters')
        .should('be.visible')
    })

    })

    it('TC-CONT-07 - Ingreso de caracteres especiales en el campo Phone', () => {

    cy.fixture('contacto').then((data) => {

        cy.completarFormularioContacto(data.phoneEspecial)

        cy.contains('Submit').click()

        cy.contains('Phone number is invalid')
        .should('be.visible')
    })

    })

})