// Acá están mis testeos para sumar al myTestRestful...

// Milagros - Casos Admin
// Título del caso de pruebas
describe('Administración - Pruebas de Login', () => {

  it('Caso 1: Login exitoso con credenciales válidas', () => {
    // Usamos el comando con los datos correctos
    cy.loginAdmin('admin', 'password');

    // Aserción: Validamos que entramos exitosamente (ej. buscando el botón de Logout)
    cy.contains('Logout').should('be.visible');
  });

  it('Caso 2: Intento de login con contraseña incorrecta', () => {
    // Usamos el MISMO comando, pero con contraseña errónea
    cy.loginAdmin('admin', '1234');

    // Validamos que aparezca el mensaje de error "Invalid credentials"
    cy.get('.alert').should('be.visible').and('contain', 'Invalid credentials');
  });

  it('Caso 3: Intento de login con campos vacíos', () => {
    // Hice el flujo manual para no andar modificando el command de login que hice
    cy.visit('https://automationintesting.online/');
    cy.contains('Admin panel').click(); 
    
    cy.get('#doLogin').click();

    // Validamos que aparezca el cartel de error
    cy.get('.alert').should('be.visible').and('contain', 'Invalid credentials');
  });
});

describe('Administración - Pruebas de gestión de habitaciones', () => {
    // beforeEach para que automáticamente logee como admin
    beforeEach(() => {
      cy.loginAdmin('admin', 'password');
    });

    it('Caso 4: Creación de una nueva habitación con datos válidos', () => {
      // Llamamos al nuevo comando enviándole los datos del Excel
      cy.crearHabitacion('204', 'Suite', 'true', '200', true, true);

      // Aserción: Validar que la habitación aparezca en el listado general
      cy.get('.container').should('contain', '204');
    });

    it('Caso 5: Creación de una nueva habitación con campos obligatorios vacíos', () => {
      // Llamamos al comando pero enviando vacíos y falses para no rellenar nada
      cy.crearHabitacion('', '', '', '', false, false);

      // Aserción: Validamos el cartel de error
      cy.get('.alert').should('be.visible').and('contain', 'Failed to create room');
    });

    it('Caso 6: Eliminar una habitación existente mediante el botón de borrado', () => {
      // Buscamos el contenedor que tiene el número de habitación
      cy.contains('[data-testid="roomlisting"]', '103').as('filaHabitacion');

      // Hacemos clic en el botón de borrar en esa fila
      cy.get('@filaHabitacion').find('.roomDelete').click();

      // Buscamos que ya no haya ninguna fila que contenga EXACTAMENTE el texto '103'
      // Le damos a Cypress el tiempo automático de 4 segundos para esperar a que React limpie la pantalla.
      cy.contains('[data-testid="roomlisting"]', '103').should('not.exist');
    });

    it('Caso 7: Creación de una nueva habitación con precio en negativo', () => {
      // Reutilizamos nuestro comando pero con el precio en negativo (-50) y solo 'WiFi' en los detalles
      cy.crearHabitacion('102', 'Single', 'true', '-50', ['WiFi']);

      // Aserción: Validamos el cartel de error
      cy.get('.alert').should('be.visible').and('contain', 'must be greater than or equal to 1');
    });

    it('Caso 9: Creación de habitaciones con nombre alfanumérico', () => {
      cy.crearHabitacion('Suite101A', 'Suite', 'true', '250', []);

      // Aserción: Validamos que la habitación alfanumérica aparezca en el listado general
      cy.get('.container').should('contain', 'Suite101A');
    });
});

describe('Administración - Pruebas de "Report" y "Mensajes"', () => {

  it('Caso 10: Validación de recepción de mensajes y cambio de estado a leído desde la Administración', () => {
    // Uso el comando para enviar el mensaje desde la web pública con sus datos
    cy.enviarMensajePublico(
      'Tester Automatizado', 
      'cypress-test@ejemplo.com', 
      '01123456789', 
      'Reserva Urgente 011', 
      'Hola, esto es una prueba automatizada para validar el buzón de entrada.'
    );

    // Nos logueamos como admin
    cy.loginAdmin('admin', 'password');

    // Validamos el contador rojo de notificaciones
    cy.contains('Messages').find('.notification, span').should('be.visible');

    // Ir a la pestaña de mensajes y buscar nuestro asunto
    cy.contains('Messages').click();
    
    // Hacemos clic sobre el mensaje que acabamos de enviar
    cy.contains('.message-row, div', 'Reserva Urgente 011').click();

    // Cerramos el detalle del mensaje
    cy.contains('button', 'Close').click();
  });

  it('Caso 12: Verificar la correcta reserva por parte del cliente en el apartado "report" desde la Administración', () => {
// IMPORTANTE: Este caso originalmente lo había hecho igual que en mi Excel, pero al haber tantas personas testeando
// Me tiraba error porque me ocupaban la reserva. Asi que lo cambié a sólo corroborar si existe una de las reservas genéricas.

    // Iniciamos sesión directo como Admin
    cy.loginAdmin('admin', 'password');

    // Vamos a la pestaña Report usando tu ID
    cy.get('#reportLink').click();

    // Viajamos al pasado: Hacemos clic 3 veces en el botón "Back" para ir de Junio a Marzo
    const botonBack = '.rbc-toolbar > :nth-child(1) > :nth-child(2)';
    cy.get(botonBack).click(); // Mayo
    cy.get(botonBack).click(); // Abril
    cy.get(botonBack).click(); // Marzo

    // Corroboramos que la barra superior marque correctamente el mes esperado
    cy.get('.rbc-toolbar-label')
      .should('be.visible')
      .should('have.text', 'March 2026');

    // Validamos que la reserva genérica de Timothy esté pintada en la pantalla
    // Usamos el selector del bloque de evento (.rbc-event-content)
    cy.get('.rbc-event-content')
      .should('be.visible')
      .should('have.text', 'Timothy Barrow - Room: 103');
      });
    });
