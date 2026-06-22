// ============================================================================
// SUITE 1: MÓDULO DE RESERVAS
// ============================================================================
describe("Reservas - Shady Meadows", () => {
  // Manejo de excepciones globales para evitar fallos por errores de React
  Cypress.on("uncaught:exception", (err, runnable) => {
    return false;
  });

  beforeEach(() => {
    // Interceptamos la API para evitar flaky tests por tiempos de carga
    cy.intercept("GET", "**/api/room").as("cargarHabitaciones");

    // Para las pruebas de reserva, vamos directo a la sección #booking
    cy.visit("https://automationintesting.online/#booking");
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

    cy.get(".room-card").should("be.visible").and("have.length.at.least", 1);
    cy.get(".room-card")
      .first()
      .contains("a", "Book now")
      .should("be.visible")
      .click();
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
});

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
