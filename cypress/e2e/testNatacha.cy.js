describe('Reservas - Shady Meadows', () => {

    // Manejo de excepciones no capturadas para evitar que las pruebas fallen debido 
    // a errores inesperados en la aplicación    
    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
     });

    beforeEach(() => {
        // Como prevención de flaky tests, se opta por interceptar la solicitud GET 
        // a la API de habitaciones para que Cypress espere a que el servidor responda 
        // antes de intentar hacer clic.

        cy.intercept('GET', '**/api/room').as('cargarHabitaciones');

        cy.visit('https://automationintesting.online/#booking')
    })

    it('completar una reserva exitosa como usuario invitado', () => {

        // Con el objetivo de que el test sea más robusto y menos propenso a 
        // fallos debido a la fecha o que tenga reservas recientes, se opta por generar 
        // dinámicamente las fechas de check-in y check-out en lugar de usar fechas fijas.
        let checkinEsperado;
        let checkoutEsperado;

        // Se generan las fechas de check-in y check-out dinámicamente
        cy.generarFechaFutura(365).then((fecha) => {
            checkinEsperado = fecha.paraValidar;
            cy.get('input.form-control').eq(0).clear().type(fecha.paraEscribir).blur();
        });

        cy.generarFechaFutura(375).then((fecha) => {
            checkoutEsperado = fecha.paraValidar;
            cy.get('input.form-control').eq(1).clear().type(fecha.paraEscribir).blur();
        }); 

        cy.contains('button', 'Check Availability').should('be.visible').click();

        // Se espera a que la solicitud de habitaciones se complete antes de continuar con la prueba
        cy.wait('@cargarHabitaciones');

        // Se asegura de que al menos una habitación esté disponible antes de intentar reservar
        cy.get('.room-card').should('be.visible').and('have.length.at.least', 1);
        cy.get('.room-card').first().contains('a', 'Book now').should('be.visible').click();

        cy.get('#doReservation').should('be.visible').click();

        // Se completa el formulario de reserva con los datos del usuario invitado
        cy.completarFormularioReserva('usuarioInvitado');

        cy.contains('button', 'Reserve Now').should('be.visible').click();

        // Aserciones finales para verificar que la reserva se haya completado correctamente
        cy.contains('Booking Confirmed', { timeout: 15000 }).should('be.visible');
        
        cy.then(() => {
            const fechasCombinadas = `${checkinEsperado} - ${checkoutEsperado}`;
            cy.contains('strong', fechasCombinadas).should('be.visible');
        });
    });
})