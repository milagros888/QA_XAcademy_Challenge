// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// Comando personalizado para generar fechas futuras
Cypress.Commands.add("generarFechaFutura", (dias) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

  // El formato devuelto es YYYY-MM-DD que es el estándar que usa Shady Meadows
  const fechaFormateada = `${anio}-${mes}-${dia}`;

  return {
    paraEscribir: fechaFormateada,
    paraValidar: fechaFormateada,
  };
});
