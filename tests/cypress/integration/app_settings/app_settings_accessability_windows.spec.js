/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';
import { setupWindow } from '../../utilities/window';

context('Windows App Settings Accessability', () => {
  beforeEach(() => {
    startVisit()
      .visit(
        `/feature/subscriptions/1489df65-b065-4cc3-b5c2-4b37cc88b703/resourcegroups/test-ux/providers/microsoft.web/sites/test-windows-app-ux/settings?trustedAuthority=test`,
        {
          onBeforeLoad(win) {
            setupWindow(win);
            cy.spy(win.parent, 'postMessage').as('spyPostMessage');
          },
        }
      )
      .injectAxe();
  });

  it('General Settings Accessability', function() {
    cy.get('#app-settings-application-settings-tab').checkA11y();
  });

  it('Application Settings Accessability', function() {
    cy.get('#app-settings-application-settings-tab')
      .click()
      .checkA11y();
  });

  it('Path Mappings Accessability', function() {
    cy.get('#app-settings-path-mappings-tab')
      .click()
      .checkA11y();
  });

  it('Default Documents Accessability', function() {
    cy.get('#app-settings-default-documents-tab')
      .click()
      .window()
      .checkA11y();
  });
});
