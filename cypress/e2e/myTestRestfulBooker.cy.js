// ============================================================================
// SUITE 1: MÓDULO DE RESERVAS
// ============================================================================

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
  // --------------------------------------------------------------------------
  // CASO DE PRUEBA: TC-RES-01
  // --------------------------------------------------------------------------
    it('TC-RES-01: completar una reserva exitosa como usuario invitado', () => {

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

        // En la ejecucion de los test hemos encontrado casos con DOM Detached 
        // Buscamos las tarjetas y las guardamos en un alias temporal. 
        // Esto obliga a Cypress a validar el nuevo estado del DOM.
        cy.get('.room-card').should('be.visible').and('have.length.at.least', 1).as('tarjetasFrescas');
        cy.get('@tarjetasFrescas')
            .first()
            .contains('a', 'Book now')
            .should('be.visible')
            .click();

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

    // --------------------------------------------------------------------------
  // CASO DE PRUEBA: TC-RES-02
  // --------------------------------------------------------------------------
  it("TC-RES-02: Verificar validaciones al enviar formulario en blanco", () => {
    // --- 1. PREPARACIÓN DEL ENTORNO ---
    cy.generarFechaFutura(365).then((fecha) => {
      cy.get("input.form-control")
        .eq(0)
        .clear()
        .type(fecha.paraEscribir)
        .blur();
    });

    cy.generarFechaFutura(375).then((fecha) => {
      cy.get("input.form-control")
        .eq(1)
        .clear()
        .type(fecha.paraEscribir)
        .blur();
    });

    cy.contains("button", "Check Availability").should("be.visible").click();
    cy.wait("@cargarHabitaciones");

    cy.get('.room-card').should('be.visible').and('have.length.at.least', 1);
    cy.get('.room-card').first().within(() => {
        cy.contains('a', 'Book now').click();
    });

    cy.get("#doReservation").should("be.visible").click();

    // --- 2. ACCIÓN: ENVIAR VACÍO ---
    cy.contains("button", "Reserve Now").should("be.visible").click();

    // --- 3. ASERCIONES ---
    cy.get(".alert.alert-danger")
      .should("be.visible")
      .within(() => {
        cy.contains("Firstname should not be blank").should("be.visible");
        cy.contains("Lastname should not be blank").should("be.visible");
        cy.contains("must not be empty").should("be.visible");
      });

    cy.contains("Booking Confirmed").should("not.exist");
  });

  // --------------------------------------------------------------------------
  // CASO DE PRUEBA: TC-RES-07
  // --------------------------------------------------------------------------
  it("TC-RES-07: Validación del cálculo total en el resumen de precio (Price Summary)", () => {
    // --- 1. PREPARACIÓN ---
    cy.wait("@cargarHabitaciones");
    cy.get(".room-card")
      .first()
      .within(() => {
        cy.contains("Book now").click();
      });
    cy.get(".rbc-calendar").should("be.visible");

    // --- 2. ACCIÓN: ARRASTRE EN EL CALENDARIO ---
    cy.contains("button", "Next").click();
    cy.wait(1000);

    cy.get(".rbc-day-bg").not(".rbc-off-range-bg").as("diasDisponibles");

    const diaInicio = 7;
    const diaFin = 13;

    cy.get("@diasDisponibles")
      .eq(diaInicio)
      .trigger("mousedown", { button: 0, force: true });
    cy.wait(200);

    for (let i = diaInicio; i <= diaFin; i++) {
      cy.get("@diasDisponibles")
        .eq(i)
        .trigger("mousemove", { button: 0, force: true });
      cy.wait(50);
    }

    cy.get("@diasDisponibles").eq(diaFin).trigger("mouseup", { force: true });
    cy.wait(1500);

    // --- 3. ASERCIONES MATEMÁTICAS ---
    cy.contains("h3", "Price Summary").should("be.visible");

    cy.contains("h3", "Price Summary")
      .parent()
      .within(() => {
        cy.contains("nights")
          .invoke("text")
          .then((texto) => {
            const numeros = texto.match(/\d+/g);
            const precioNoche = parseInt(numeros[0]);
            const cantidadNochesSeleccionadas = parseInt(numeros[1]);

            const subtotal = precioNoche * cantidadNochesSeleccionadas;
            const totalEsperado = subtotal + 25 + 15;

            cy.log(
              `Se seleccionaron ${cantidadNochesSeleccionadas} noches a £${precioNoche}. Total calculado: £${totalEsperado}`,
            );

            cy.contains("Total")
              .parent()
              .invoke("text")
              .then((textoTotal) => {
                const totalEnPantalla = parseInt(textoTotal.match(/\d+/)[0]);
                expect(totalEnPantalla).to.eq(totalEsperado);
              });
          });
      });

    cy.contains("button", "Reserve Now").should("be.visible");
  });
})

// ============================================================================
// SUITE 2: MÓDULO DE NAVEGACIÓN
// ============================================================================
describe("Navegación - Shady Meadows", () => {
  Cypress.on("uncaught:exception", (err, runnable) => {
    return false;
  });

  beforeEach(() => {
    // --- 1. PRECONDICIONES ---
    // Aquí navegamos a la raíz (sin #booking) para probar el scroll desde arriba
    cy.visit("https://automationintesting.online/");
  });

  // --------------------------------------------------------------------------
  // CASO DE PRUEBA: UX Y NAVEGACIÓN
  // --------------------------------------------------------------------------
  it('TC-NAV-09:Navegación exitosa a la sección "Booking" desde el menú principal', () => {
    cy.get(".navbar").should("be.visible");

    // --- 2. ACCIÓN: CLIC EN EL MENÚ ---
    cy.contains(".nav-link", "Booking").should("be.visible").click();

    // --- 3. ASERCIONES ---
    cy.url().should("include", "#booking");
    cy.wait(500); // Tiempo para el smooth scroll

    cy.window().its("scrollY").should("be.greaterThan", 0);

    cy.contains("h2", "Our Rooms").should("be.visible");
    cy.get(".room-card").should("be.visible").and("have.length.at.least", 1);

    cy.get("input.form-control").eq(0).should("be.visible");
    cy.get("input.form-control").eq(1).should("be.visible");
    cy.contains("button", "Check Availability").should("be.visible");
  });
});

// ============================================================================
// SUITE 3: MÓDULO DE ADMINISTRACIÓN
// ============================================================================

describe('Administración - Pruebas de Login', () => {

  it('TC-ADMIN-01: Login exitoso con credenciales válidas', () => {
    // Usamos el comando con los datos correctos
    cy.fixture('datosHotel').then((datos) => {
      cy.loginAdmin(datos.usuarioAdmin.user, datos.usuarioAdmin.password);
    });
    
    // Aserción: Validamos que entramos exitosamente (ej. buscando el botón de Logout)
    cy.contains('Logout').should('be.visible');
  });

  it('TC-ADMIN-02: Intento de login con contraseña incorrecta', () => {
    // Usamos el MISMO comando, pero con contraseña errónea
    cy.fixture('datosHotel').then((datos) => {
      cy.loginAdmin(datos.usuarioAdmin.user, '1234');
    });

    // Validamos que aparezca el mensaje de error "Invalid credentials"
    cy.get('.alert').should('be.visible').and('contain', 'Invalid credentials');
  });

  it('TC-ADMIN-03: Intento de login con campos vacíos', () => {
    // Usamos el comando con campos vacíos
    cy.loginAdmin('', '');

    // Validamos que aparezca el cartel de error
    cy.get('.alert').should('be.visible').and('contain', 'Invalid credentials');
  });
});

describe('Administración - Pruebas de gestión de habitaciones', () => {
    // beforeEach para que automáticamente logee como admin
    beforeEach(() => {
        cy.fixture('datosHotel').then((datos) => {
        cy.loginAdmin(datos.usuarioAdmin.user, datos.usuarioAdmin.password);
      });
    });

    it('TC-ADMIN-04: Creación de una nueva habitación con datos válidos', () => {
      // Llamamos al nuevo comando enviándole los datos del Excel
      cy.crearHabitacion('204', 'Suite', 'true', '200', ['WiFi', 'TV', 'Radio']);

      // Aserción: Validar que la habitación aparezca en el listado general
      cy.get('.container').should('contain', '204');
    });

    it('TC-ADMIN-05: Creación de una nueva habitación con campos obligatorios vacíos', () => {
      // Llamamos al comando pero enviando vacíos y falses para no rellenar nada
      cy.crearHabitacion('', '', '', '');

      // Aserción: Validamos el cartel de error
      cy.get('.alert').should('be.visible').and('contain', 'Failed to create room');
    });

    it('TC-ADMIN-06: Eliminar una habitación existente mediante el botón de borrado', () => {

      //Creamos una habitación exclusiva para este test
      cy.crearHabitacion('999', 'Single', 'true', '50', []);
      
      // Buscamos el contenedor que tiene el número de habitación
      cy.contains('[data-testid="roomlisting"]', '999').as('filaHabitacion');

      // Hacemos clic en el botón de borrar en esa fila
      cy.get('@filaHabitacion').find('.roomDelete').click();

      // Buscamos que ya no haya ninguna fila que contenga EXACTAMENTE el texto '999'
      // Le damos a Cypress el tiempo automático de 4 segundos para esperar a que React limpie la pantalla.
      cy.contains('[data-testid="roomlisting"]', '999').should('not.exist');
    });

    it('TC-ADMIN-07: Creación de una nueva habitación con precio en negativo', () => {
      // Reutilizamos nuestro comando pero con el precio en negativo (-50) y solo 'WiFi' en los detalles
      cy.crearHabitacion('102', 'Single', 'true', '-50', ['WiFi']);

      // Aserción: Validamos el cartel de error
      cy.get('.alert').should('be.visible').and('contain', 'must be greater than or equal to 1');
    });

    it('TC-ADMIN-09: Creación de habitaciones con nombre alfanumérico', () => {
      cy.crearHabitacion('Suite101A', 'Suite', 'true', '250', []);

      // Aserción: Validamos que la habitación alfanumérica aparezca en el listado general
      cy.get('.container').should('contain', 'Suite101A');
    });
});

describe('Administración - Pruebas de "Report" y "Mensajes"', () => {

  it('TC-ADMIN-10: Validación de recepción de mensajes y cambio de estado a leído desde la Administración', () => {

    cy.fixture('datosHotel').then((datos) => {
      const msj = datos.caso10_mensaje;
      
      // Uso el comando para enviar el mensaje desde la web pública con sus datos
      cy.enviarMensajePublico(msj.name, msj.email, msj.phone, msj.subject, msj.description);

      // Nos logueamos como admin
      cy.loginAdmin(datos.usuarioAdmin.user, datos.usuarioAdmin.password);
      
      // Validamos el contador rojo de notificaciones
      cy.contains('Messages').find('.notification, span').should('be.visible');
      // Ir a la pestaña de mensajes y buscar nuestro asunto
      cy.contains('Messages').click();
      // Hacemos clic sobre el mensaje que acabamos de enviar
      cy.contains('.message-row, div', msj.subject).click();
      // Cerramos el detalle del mensaje
      cy.contains('button', 'Close').click();
    });
  });

  it('TC-ADMIN-12: Verificar la correcta reserva por parte del cliente en el apartado "report" desde la Administración', () => {
    // IMPORTANTE: Este caso originalmente lo había hecho igual que en mi Excel, pero al haber tantas personas testeando
    // Me tiraba error porque me ocupaban la reserva. Asi que lo cambié a sólo corroborar si existe una de las reservas genéricas.

    // Iniciamos sesión directo como Admin
    cy.fixture('datosHotel').then((datos) => {

      // Nos logueamos como admin
      cy.loginAdmin(datos.usuarioAdmin.user, datos.usuarioAdmin.password);
    

      // Vamos a la pestaña Report usando el ID
      cy.get('#reportLink').click();

      // Viajamos al pasado: Hacemos clic 3 veces en el botón "Back" para ir de Junio a Marzo
      const botonBack = '.rbc-toolbar > :nth-child(1) > :nth-child(2)';
      cy.get(botonBack).click(); // Mayo
      cy.get(botonBack).click(); // Abril
      cy.get(botonBack).click(); // Marzo

      // Corroboramos que la barra superior marque correctamente el mes esperado
      cy.get('.rbc-toolbar-label')
          .should('be.visible')
          .should('have.text', datos.caso12_reporte.mesEsperado);

      // Validamos que la reserva genérica de Timothy esté pintada en la pantalla
      // Usamos el selector del bloque de evento (.rbc-event-content)
      cy.get('.rbc-event-content')
        .should('be.visible')
        .should('have.text', datos.caso12_reporte.reservaEsperada);
    });
  });
});

// ============================================================================
// SUITE 4: MÓDULO CONTACTO
// ============================================================================

describe('Módulo Contacto - Shady Meadows', () => {

    // Ignoramos los errores internos de React para evitar bloqueos
    Cypress.on('uncaught:exception', () => false);

    beforeEach(() => {
        // Interceptamos la petición POST que envía el mensaje
        cy.intercept('POST', '**/message').as('enviarMensaje');
        
        cy.visit('https://automationintesting.online/');
        cy.contains('Contact').click(); 
    });

    context('Flujos positivos y validaciones base', () => {
        
        it('TC-CONT-01: Envío exitoso del formulario con datos válidos', () => {
            cy.fixture('contacto').then((data) => {
                cy.completarFormularioContacto(data.valido);
                
                // Aseguramos que sea un botón visible antes de hacer clic
                cy.contains('button', 'Submit').should('be.visible').click();

                // Esperamos a que el servidor reciba el mensaje (Status 201 Created)
                cy.wait('@enviarMensaje').its('response.statusCode').should('eq', 200);

                // Validamos que se muestre el texto de confirmación
                cy.get('#contact h3') 
                    .should('contain.text', 'Thanks for getting in touch')
                    .and('contain.text', data.valido.name); 
            });
        });

        it('TC-CONT-02: Intento envío con formulario vacío', () => {
            cy.contains('button', 'Submit').should('be.visible').click();

            // Validamos que se muestren los mensajes de error correspondientes 
            // para cada campo obligatorio
            cy.get('.alert.alert-danger')
                .should('be.visible')
                .within(() => {
                    cy.contains('Name may not be blank').should('be.visible');
                    cy.contains('Email may not be blank').should('be.visible');
                });
        });

        it('TC-CONT-03: Validación de longitud mínima en el campo Message', () => {
            cy.fixture('contacto').then((data) => {
                cy.completarFormularioContacto(data.mensajeCorto);
                cy.contains('button', 'Submit').should('be.visible').click();

                cy.get('.alert.alert-danger')
                    .should('be.visible')
                    .and('contain.text', 'Message must be between 20 and 2000 characters.');
            }); 
        });
    });
});