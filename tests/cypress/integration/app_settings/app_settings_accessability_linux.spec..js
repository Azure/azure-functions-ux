/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';
import { setupWindow } from '../../utilities/window';

context('Windows App Settings Accessability', () => {
  beforeEach(() => {
    startVisit().visit(
      `/feature/subscriptions/1489df65-b065-4cc3-b5c2-4b37cc88b703/resourcegroups/test-ux/providers/microsoft.web/sites/test-linux-app-ux/settings?trustedAuthority=test`,
      {
        onBeforeLoad(win) {
          setupWindow(win);
          cy.spy(win.parent, 'postMessage').as('spyPostMessage');
        },
      }
    );
  });

  it('General Settings Accessability', function() {
    cy.get('#app-settings-application-settings-tab')
      .window()
      .then(win => {
        var window = win;
        var axe = require('axe-core');
        window.eval(axe.source);
        return window.axe.run();
      })
      .then(results => {
        console.log(results);
        expect(results.violations.filter(x => x.id !== 'page-has-heading-one').length).to.equal(0);
      });
  });

  it('Application Settings Accessability', function() {
    cy.get('#app-settings-application-settings-tab')
      .click()
      .window()
      .then(win => {
        var window = win;
        var axe = require('axe-core');
        window.eval(axe.source);
        return window.axe.run();
      })
      .then(results => {
        console.log(results);
        expect(results.violations.filter(x => x.id !== 'page-has-heading-one').length).to.equal(0);
      });
  });

  it('Path Mappings Accessability', function() {
    cy.get('#app-settings-path-mappings-tab')
      .click()
      .window()
      .then(win => {
        var window = win;
        var axe = require('axe-core');
        window.eval(axe.source);
        return window.axe.run();
      })
      .then(results => {
        console.log(results);
        expect(results.violations.filter(x => x.id !== 'page-has-heading-one').length).to.equal(0);
      });
  });
});
