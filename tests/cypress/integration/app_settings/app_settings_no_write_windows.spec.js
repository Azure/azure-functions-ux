/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';
import { setupWindow } from '../../utilities/window';

context('App Settings Readonly Access', () => {
  beforeEach(() => {
    startVisit().visit(
      `/feature/subscriptions/1489df65-b065-4cc3-b5c2-4b37cc88b703/resourcegroups/test-ux-read-only/providers/microsoft.web/sites/test-ux-read-only-windows/settings?trustedAuthority=test`,
      {
        onBeforeLoad(win) {
          setupWindow(win);
          cy.spy(win.parent, 'postMessage').as('spyPostMessage');
        },
      }
    );
  });

  it('general settings should all be disabled except stack list', () => {
    cy.get('body')
      .find('.ms-Dropdown')
      .each(el => {
        expect(el[0].className).to.include('is-disabled');
      });
  });

  it('application settings and connection strings should be replaced by warning boxes', () => {
    cy.get('#app-settings-application-settings-tab')
      .click()
      .get('#app-settings-app-settings-rbac-message')
      .should('exist')
      .get('#app-settings-connection-strings-rbac-message')
      .should('exist');
  });

  it('Default documents should be visable but disabled', () => {
    cy.get('#app-settings-default-documents-tab')
      .click()
      .get('#app-settings-new-default-document-button')
      .should('be.disabled')
      .get('body')
      .find('input')
      .each(el => {
        expect(el).to.be.disabled;
      });
  });

  it('Path Mappings should be visable but disabled', () => {
    cy.get('#app-settings-path-mappings-tab')
      .click()
      .get('#app-settings-new-handler-mappings-button')
      .should('be.disabled')
      .get('#app-settings-new-virtual-app-button')
      .should('be.disabled');
  });
});
