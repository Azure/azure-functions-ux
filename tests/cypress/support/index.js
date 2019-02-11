// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import axe from 'axe-core';

Cypress.Commands.add('injectAxe', () => {
  cy.window({ log: false }).then(window => {
    window.eval(axe.source);
  });
});

Cypress.Commands.add('checkA11y', () => {
  cy.window({ log: false })
    .then(win => {
      const axeOptions = {
        rules: {
          'page-has-heading-one': { enabled: false }, //This is not needed since we're in an iFrame and H1 is provided by the Shell
        },
      };
      return win.axe.run(win.document, axeOptions);
    })
    .then(({ violations }) => {
      if (violations.length) {
        cy.wrap(violations, { log: false }).each(v => {
          Cypress.log({
            name: 'a11y error!',
            consoleProps: () => v,
            message: `    ${v.id} on ${v.nodes.length} Node${v.nodes.length === 1 ? '' : 's'}`,
          });
        });
      }
      return cy.wrap(violations, { log: false });
    })
    .then(violations => {
      assert.equal(
        violations.length,
        0,
        `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} ${
          violations.length === 1 ? 'was' : 'were'
        } detected`
      );
    });
});
// Alternatively you can use CommonJS syntax:
// require('./commands')
