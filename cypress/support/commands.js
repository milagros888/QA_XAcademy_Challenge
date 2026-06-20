// Comando para generar una fecha futura
Cypress.Commands.add('generarFechaFutura', (diasAAdicionar) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + diasAAdicionar);
    
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    
    return cy.wrap({
        paraEscribir: `${dia}/${mes}/${anio}`,   // Para el formulario
        paraValidar: `${anio}-${mes}-${dia}`     // Para el cartel de éxito final
    });
});

// Comando para completar el formulario
Cypress.Commands.add('completarFormularioReserva', (fixtureName) => {
    cy.fixture(fixtureName).then((usuario) => {
        cy.get('input[name="firstname"]').should('be.visible').type(usuario.firstname);
        cy.get('input[name="lastname"]').type(usuario.lastname);
        cy.get('input[name="email"]').type(usuario.email);
        cy.get('input[name="phone"]').type(usuario.phone);
    });
});