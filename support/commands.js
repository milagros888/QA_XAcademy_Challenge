

//_________________________________________________________________________
//                    CUSTOM COMMAND - MÓDULO CONTACT
//_________________________________________________________________________

Cypress.Commands.add('completarFormularioContacto', (datos) => {
    cy.get('#name').type(datos.name)
    cy.get('#email').type(datos.email)
    cy.get('#phone').type(datos.phone)
    cy.get('#subject').type(datos.subject)
    cy.get('#description').type(datos.message)
})