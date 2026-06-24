# 🚀 Challenge de Cypress Automation | XAcademy - Technology with Purpose

Bienvenido al repositorio oficial del equipo para el Trabajo Final de la Cohorte I - 2026. En este proyecto ponemos en práctica los conocimientos adquiridos de QA Automation aplicando pruebas End-to-End (E2E) sobre el sistema web real de reservas de un Bed & Breakfast: [Shady Meadows](https://automationintesting.online/).

---

## 🔗 Enlaces Importantes de Documentación

Para cumplir con los criterios de evaluación, toda nuestra documentación técnica está centralizada en los siguientes enlaces:

* 📄 **[Plan de Pruebas (Casos de Prueba)](https://docs.google.com/spreadsheets/d/1HvECogJ3xM9bXqu5aTH7l92xTlssPBjfWKN74BWISFI/edit?usp=sharing)**: Documento detallado en Drive con la redacción de escenarios positivos, negativos y de borde.
* 🐞 **[Tablero de Bugs (Trello)](https://trello.com/invite/b/6a2b29b40986c4a96b7e7842/ATTI491d39acad953056a71f3f9f80b0b8698CDBE2AE/grupo-19-challenge)**: Gestión y reporte de defectos encontrados en la aplicación.
* 🌐 **[Entorno de Pruebas](https://automationintesting.online/)**: Aplicación web testeada.
* 📋 **[Consigna del Challenge](https://drive.google.com/file/d/1Nhhz3rIxxQguuZFb5Fm_fAJPHPUruhgg/view)**: Requisitos del proyecto.

---

## 👥 Integrantes del Equipo

* Hilen Ortiz
* Milagros Escarlon
* Natacha Rodriguez
* Rocio Vera López

---

## 🎯 Escenarios Automatizados

Nuestra suite principal (`myTestRestfulBooker.cy.js`) abarca los siguientes flujos requeridos, diseñados con la premisa de que los tests puedan ejecutarse de forma 100% independiente:

1. **Reserva exitosa como usuario invitado:** Navegación, selección de fechas, llenado de formulario con datos válidos y aserción de confirmación exitosa.
2. **Validaciones del formulario de reserva:** Intentos de envío con campos vacíos y validación de la aparición de alertas de error, asegurando que no se concrete la reserva.
3. **Formulario de contacto:** Llenado y envío de mensaje de contacto con datos válidos y verificación de la notificación de éxito.

*(Adicionalmente, se incluyeron casos extra para el módulo de Administración utilizando técnicas avanzadas de testing).*

---

## 🛠️ Tecnologías y Herramientas Utilizadas

* **[Cypress](https://www.cypress.io/)**: Framework de pruebas End-to-End.
* **[JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript)**: Lenguaje de programación.
* **[Node.js](https://nodejs.org/)**: Entorno de ejecución.
* **[Visual Studio Code](https://code.visualstudio.com/)**: IDE de desarrollo.

---

## 📁 Estructura del Proyecto

El proyecto está diseñado siguiendo las buenas prácticas de Page Object Model y Data-Driven Testing:

* 📁 **`cypress/e2e/`**: Contiene el archivo principal de pruebas `myTestRestfulBooker.cy.js`.
* 📁 **`cypress/fixtures/`**: Archivos JSON estáticos para parametrizar datos (Data-Driven Testing).
* 📁 **`cypress/support/`**: Comandos personalizados (`commands.js`) para evitar la repetición de código y configuraciones globales.
* 📄 **`cypress.config.js`**: Configuración global de la herramienta.
* 📄 **`package.json`**: Dependencias y scripts de ejecución.

---

## 🚀 Cómo ejecutar las pruebas

1. Clona este repositorio en tu máquina local.
2. Abre la terminal en la raíz del proyecto y ejecuta `npm install` para instalar las dependencias.
3. Para abrir la interfaz gráfica de Cypress, ejecuta: `npx cypress open`.
4. Para correr las pruebas en modo *headless* (consola), ejecuta: `npx cypress run`.

---
**📅 Fecha Límite de Entrega:** 25/06/2026 | *Este repositorio es de acceso público.*
