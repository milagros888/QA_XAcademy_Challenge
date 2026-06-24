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

// Comando para login 
Cypress.Commands.add('loginAdmin', (usuario, contrasenia) => {
  cy.visit('https://automationintesting.online/');
  cy.get(':nth-child(6) > .nav-link').click();

  // Si el campo tiene contenido, lo escribe. Si está vacío (''), no hace nada.
  if (usuario) cy.get('#username').type(usuario);
  if (contrasenia) cy.get('#password').type(contrasenia);
  
  cy.get('#doLogin').click();
});

// Comando para crear habitación
Cypress.Commands.add('crearHabitacion', (room, tipo, accesible, precio, detalles = []) => {
  // 1. Identificador de la habitación (alfanumérico)
  if (room) cy.get('[data-testid="roomName"]').type(room);

  // 2. Menú Type
  if (tipo) cy.get('#type').select(tipo);

  // 3. Menú Accessible
  if (accesible) cy.get('#accessible').select(accesible);

  // 4. Precio
  if (precio) cy.get('#roomPrice').type(precio);

  // 5. Detalles de la habitación (Busca los detalles que coincidan con los nombres de la lista)
  if (detalles && detalles.length > 0) {
    detalles.forEach((detalle) => {
      // Buscamos el texto exacto y marcamos el checkbox que tiene al lado
      cy.contains('.form-check', detalle).find('input[type="checkbox"]').check();
    });
  }
  
  // 6. Botón crear
  cy.get('#createRoom').click();
});

// Comando para el envío de mensajes
Cypress.Commands.add('enviarMensajePublico', (name, email, phone, subject, description) => {
  // Vamos a la página principal pública
  cy.visit('https://automationintesting.online/');
  
  //Click en el apartado de "Contact"
  cy.get(':nth-child(5) > .nav-link').click();

  // Completar el formulario de contacto
  cy.get('[data-testid="ContactName"]').type(name);
  cy.get('[data-testid="ContactEmail"]').type(email);
  cy.get('[data-testid="ContactPhone"]').type(phone);
  cy.get('[data-testid="ContactSubject"]').type(subject);
  cy.get('[data-testid="ContactDescription"]').type(description);

  // Hacer clic en el botón de enviar
  cy.get('.d-grid > .btn').click();
});