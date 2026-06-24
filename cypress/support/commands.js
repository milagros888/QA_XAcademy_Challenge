// Ignoramos los errores internos de la página web para que nos deje testear el admin
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

// Comando para login 
Cypress.Commands.add('loginAdmin', (usuario, contrasenia) => {
  // 1. Entramos primero al Home para que cargue todo bien
  cy.visit('https://automationintesting.online/');
  
  // 2. Buscamos el botón de Admin y le hacemos clic
  cy.get(':nth-child(6) > .nav-link').click();

  // 3. Escribimos las credenciales que recibimos por parámetros
  cy.get('#username').type(usuario);
  cy.get('#password').type(contrasenia);
  
  // 4. Hacemos clic en el botón de ingresar
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