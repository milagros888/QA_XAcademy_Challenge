describe("Reservas - Shady Meadows - Validaciones", () => {
  // ============================================================================
  // CONFIGURACIÓN GLOBAL DE LAS PRUEBAS
  // ============================================================================

  // Cypress detiene las pruebas si la página web tiene errores internos de código.
  // Con esto le decimos: "Si la página lanza un error (como el error #418 de React),
  // ignóralo y continúa con la prueba". Así evitamos falsos positivos.
  Cypress.on("uncaught:exception", (err, runnable) => {
    return false;
  });

  // El bloque 'beforeEach' se ejecuta automáticamente ANTES de cada 'it' (caso de prueba).
  beforeEach(() => {
    // Le avisamos a Cypress que vigile la comunicación con la base de datos de habitaciones.
    // Le ponemos el apodo "@cargarHabitaciones" para usarlo más adelante.
    cy.intercept("GET", "**/api/room").as("cargarHabitaciones");

    // Abrimos la página web directamente en la sección de reservas.
    cy.visit("https://automationintesting.online/#booking");
  });

  // ============================================================================
  // CASO DE PRUEBA 02: VALIDACIÓN DE CAMPOS OBLIGATORIOS
  // ============================================================================
  it("TC-RES-02: Verificar validaciones al enviar formulario en blanco", () => {
    // --- 1. PREPARACIÓN DEL ENTORNO ---
    // Objetivo: Desplegar el formulario de reserva. Para eso, necesitamos buscar fechas disponibles.

    // Generamos una fecha a 1 año en el futuro (para garantizar que haya lugar).
    // Escribimos esta fecha en el primer campo del calendario (check-in).
    cy.generarFechaFutura(365).then((fecha) => {
      cy.get("input.form-control")
        .eq(0) // Selecciona el primer input
        .clear()
        .type(fecha.paraEscribir)
        .blur(); // Simula que el usuario hace clic fuera del campo
    });

    // Generamos la fecha de salida (check-out) sumando 10 días más a la fecha anterior.
    cy.generarFechaFutura(375).then((fecha) => {
      cy.get("input.form-control")
        .eq(1) // Selecciona el segundo input
        .clear()
        .type(fecha.paraEscribir)
        .blur();
    });

    // Hacemos clic en el botón para buscar qué habitaciones están libres en esas fechas.
    cy.contains("button", "Check Availability").should("be.visible").click();

    // ¡Pausa inteligente! Le pedimos a Cypress que espere hasta que el servidor
    // termine de cargar las habitaciones antes de intentar hacer clic en una.
    cy.wait("@cargarHabitaciones");

    // Buscamos todas las tarjetas de habitaciones en pantalla, nos aseguramos de que
    // haya al menos una disponible, tomamos la primera de la lista y le damos a "Book now".
    cy.get(".room-card").should("be.visible").and("have.length.at.least", 1);
    cy.get(".room-card")
      .first()
      .contains("a", "Book now")
      .should("be.visible")
      .click();

    // Confirmamos la intención de reserva para que se abra el formulario de datos personales.
    cy.get("#doReservation").should("be.visible").click();

    // --- 2. ACCIÓN PRINCIPAL DEL TEST ---
    // El objetivo es probar qué pasa si el usuario no llena nada.
    // Hacemos clic directamente en "Reservar" dejando todo en blanco.
    cy.contains("button", "Reserve Now").should("be.visible").click();

    // --- 3. VERIFICACIÓN DE RESULTADOS ESPERADOS (ASERCIONES) ---
    // Buscamos el recuadro rojo de errores en la pantalla.
    // Usamos '.within()' para decirle a Cypress: "Busca los siguientes textos ESTRICTAMENTE
    // dentro de ese recuadro rojo, ignora el resto de la página".
    cy.get(".alert.alert-danger")
      .should("be.visible")
      .within(() => {
        cy.contains("Firstname should not be blank").should("be.visible");
        cy.contains("Lastname should not be blank").should("be.visible");
        // Este es el error real que arroja el sistema para los campos de Email y Teléfono.
        cy.contains("must not be empty").should("be.visible");
      });

    // --- 4. VERIFICACIÓN DE SEGURIDAD ---
    // Nos aseguramos de que la reserva NO se haya creado. Buscamos el cartel de éxito
    // y confirmamos que NO existe en la página.
    cy.contains("Booking Confirmed").should("not.exist");
  });

  // ============================================================================
  // CASO DE PRUEBA 07: CÁLCULO MATEMÁTICO DEL PRECIO TOTAL
  // ============================================================================
  it("TC-RES-07: Validación del cálculo total en el resumen de precio (Price Summary)", () => {
    // --- 0. PREPARACIÓN INICIAL ---
    // Visitamos la página y esperamos a que el sistema cargue los datos de las habitaciones.
    cy.intercept("GET", "**/api/room").as("cargarHabitaciones");
    cy.visit("https://automationintesting.online/#booking");
    cy.wait("@cargarHabitaciones");

    // --- 1. ABRIR EL CALENDARIO DE RESERVAS ---
    // Seleccionamos la primera habitación de la lista para desplegar su calendario.
    cy.get(".room-card")
      .should("be.visible")
      .first()
      .within(() => {
        cy.contains("Book now").click();
      });

    // Verificamos visualmente que el calendario se haya abierto.
    cy.get(".rbc-calendar").should("be.visible");

    // --- 2. SIMULAR SELECCIÓN DE DÍAS (ARRASTRE CON EL RATÓN) ---

    // Hacemos clic en el botón "Next" del calendario para ir al mes siguiente.
    // Esto asegura que siempre seleccionemos fechas en el futuro y la página no falle.
    cy.contains("button", "Next").click();
    cy.wait(1000); // Pausa de 1 segundo para dejar que el calendario dibuje el nuevo mes.

    // Seleccionamos los fondos de las celdas del calendario, ignorando los días
    // grises que pertenecen al mes anterior o siguiente (clase 'rbc-off-range-bg').
    cy.get(".rbc-day-bg").not(".rbc-off-range-bg").as("diasDisponibles");

    // SIMULACIÓN DE ARRASTRE (DRAG & DROP)
    // Paso A: Presionamos el clic izquierdo del ratón (mousedown) sobre el día 11 del mes.
    cy.get("@diasDisponibles")
      .eq(10) // El índice 10 equivale al 11avo día disponible.
      .trigger("mousedown", { which: 1, force: true });

    // Pausa vital: El código de React necesita medio segundo para registrar el clic inicial.
    cy.wait(500);

    // Paso B: Sin soltar el clic, movemos el ratón (mousemove) hasta el día 17 del mes.
    // Esto crea una selección continua de 6 noches.
    cy.get("@diasDisponibles").eq(16).trigger("mousemove", { force: true });

    // Pausa vital: Le damos tiempo al calendario para dibujar la franja azul de selección.
    cy.wait(500);

    // Paso C: Soltamos el clic izquierdo del ratón (mouseup) para finalizar la selección.
    cy.get("@diasDisponibles").eq(16).trigger("mouseup", { force: true });

    // --- 3. ASERCIONES DINÁMICAS (VALIDACIÓN DE MATEMÁTICA) ---
    // En lugar de escribir precios fijos que pueden cambiar y hacer fallar el test,
    // hacemos que Cypress lea los números de la pantalla y haga la cuenta por su cuenta.

    cy.contains("h3", "Price Summary").should("be.visible");

    // Entramos al cuadro donde está el desglose de precios.
    cy.contains("h3", "Price Summary")
      .parent()
      .within(() => {
        // 1. Buscamos la línea que detalla las noches (ejemplo: "150 x 6 nights") y extraemos su texto.
        cy.contains("nights")
          .invoke("text")
          .then((texto) => {
            // 2. Extraer datos con Expresiones Regulares (Regex)
            // '/\d+/g' busca y agrupa TODOS los números dentro del texto, ignorando letras o símbolos (como £).
            const numeros = texto.match(/\d+/g);
            const precioNoche = parseInt(numeros[0]); // El primer número es el precio (ej. 150)
            const cantidadNoches = parseInt(numeros[1]); // El segundo número son los días (ej. 6)

            // 3. Cypress calcula cómo DEBERÍA ser el resultado correcto
            const subtotal = precioNoche * cantidadNoches;
            const totalEsperado = subtotal + 25 + 15; // Sumamos cargos fijos: Limpieza(25) y Servicio(15)

            // Imprimimos el cálculo en la consola para ayudar al QA a debuguear si algo sale mal.
            cy.log(
              `Cálculo interno: ${precioNoche} * ${cantidadNoches} + 40 = ${totalEsperado}`,
            );

            // 4. Validación final
            // Buscamos la línea del "Total", extraemos su número y verificamos que
            // sea exactamente igual al total que calculamos en el paso anterior.
            cy.contains("Total")
              .parent()
              .invoke("text")
              .then((textoTotal) => {
                const totalEnPantalla = parseInt(textoTotal.match(/\d+/)[0]);
                expect(totalEnPantalla).to.eq(totalEsperado); // Aserción matemática real
              });
          });
      });
  });
});
