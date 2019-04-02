/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';
import { setupWindow } from '../../utilities/window';

context('App Settings Application Settings and Connection Strings with windows', () => {
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
      .get('#app-settings-application-settings-tab')
      .click();
  });
  it('Application Setting Values start off Hidden', () => {
    cy.get('#app-settings-application-settings-value-0').should('not.contain', '1');
  });

  it('Application Settings coming from API and showing', () => {
    cy.get('#app-settings-application-settings-show-hide')
      .click()
      .get('#app-settings-application-settings-name-0')
      .contains('MSDEPLOY_RENAME_LOCKED_FILES')
      .get('#app-settings-application-settings-value-0')
      .contains('1')
      .get('#app-settings-application-settings-sticky-0')
      .should('not.exist')
      .get('#app-settings-application-settings-name-1')
      .contains('TEST_NAME')
      .get('#app-settings-application-settings-value-1')
      .contains('TEST_VALUE')
      .get('#app-settings-application-settings-sticky-1')
      .should('not.exist');
  });

  it('Application Settings can be edited', () => {
    cy.get('#app-settings-application-settings-show-hide')
      .click()
      .get('#app-settings-application-settings-edit-1')
      .click()
      .get('#app-settings-edit-name')
      .type('_NEW')
      .get('#app-settings-edit-value')
      .type('_NEW')
      .get('#app-settings-edit-sticky')
      .click({ force: true })
      .get('#app-settings-edit-footer-save')
      .click()
      .get('#app-settings-application-settings-name-1')
      .contains('TEST_NAME_NEW')
      .get('#app-settings-application-settings-value-1')
      .contains('TEST_VALUE_NEW')
      .get('#app-settings-application-settings-sticky-1')
      .should('exist');
  });

  it('Application settings can be added', () => {
    cy.get('#app-settings-application-settings-show-hide')
      .click()
      .get('#app-settings-application-settings-add')
      .click()
      .get('#app-settings-edit-name')
      .type('ADDED_NAME')
      .get('#app-settings-edit-value')
      .type('ADDED_VALUE')
      .get('#app-settings-edit-footer-save')
      .click()
      .get('#app-settings-application-settings-name-0')
      .contains('ADDED_NAME')
      .get('#app-settings-application-settings-value-0')
      .contains('ADDED_VALUE');
  });

  it('Application settings can not be added if validation fails', () => {
    cy.get('#app-settings-application-settings-add')
      .click()
      .get('#app-settings-edit-name')
      .type('TEST_NAME')
      .get('#app-settings-edit-value')
      .type('ADDED_VALUE')
      .get('#app-settings-edit-footer-save')
      .should('be.disabled');
  });

  it('Connection String Values start off Hidden', () => {
    cy.get('#app-settings-connection-strings-value-0').should('not.contain', 'TEST_CONNECTION_VALUE');
  });

  it('Connection Strings coming from API and showing', () => {
    cy.get('#app-settings-connection-strings-show-hide')
      .click()
      .get('#app-settings-connection-strings-name-0')
      .contains('TEST_CONNECTION')
      .get('#app-settings-connection-strings-value-0')
      .contains('TEST_CONNECTION_VALUE')
      .get('#app-settings-connection-strings-sticky-0')
      .should('not.exist')
      .get('#app-settings-connection-strings-type-0')
      .contains('SQLServer');
  });

  it('Connection Strings can be edited', () => {
    cy.get('#app-settings-connection-strings-show-hide')
      .click()
      .get('#app-settings-connection-strings-edit-0')
      .click()
      .get('#connection-strings-form-name')
      .type('_NEW')
      .get('#connection-strings-form-value')
      .type('_NEW')
      .get('#connection-strings-form-type')
      .click()
      .get('#connection-strings-form-type-list0')
      .click()
      .get('#connection-strings-form-sticky')
      .click({ force: true })
      .get('#connection-string-edit-footer-save')
      .click()
      .get('#app-settings-connection-strings-name-0')
      .contains('TEST_CONNECTION_NEW')
      .get('#app-settings-connection-strings-value-0')
      .contains('TEST_CONNECTION_VALUE_NEW')
      .get('#app-settings-connection-strings-sticky-0')
      .should('exist')
      .get('#app-settings-connection-strings-type-0')
      .contains('MySQL');
  });

  it('Connection Strings can be added', () => {
    cy.get('#app-settings-connection-strings-show-hide')
      .click()
      .get('#app-settings-connection-strings-add')
      .click()
      .get('#connection-strings-form-name')
      .type('_NEWNAME')
      .get('#connection-strings-form-value')
      .type('_NEWVALUE')
      .get('#connection-strings-form-type')
      .click()
      .get('#connection-strings-form-type-list0')
      .click()
      .get('#connection-strings-form-sticky')
      .click({ force: true })
      .get('#connection-string-edit-footer-save')
      .click()
      .get('#app-settings-connection-strings-name-0')
      .contains('_NEWNAME')
      .get('#app-settings-connection-strings-value-0')
      .contains('_NEWVALUE')
      .get('#app-settings-connection-strings-sticky-0')
      .should('exist')
      .get('#app-settings-connection-strings-type-0')
      .contains('MySQL');
  });

  it('Connection Strings can not be added if validation fails', () => {
    cy.get('#app-settings-connection-strings-add')
      .click()
      .get('#connection-strings-form-name')
      .type('TEST_CONNECTION')
      .get('#connection-strings-form-value')
      .type('ADDED_VALUE')
      .get('#connection-string-edit-footer-save')
      .should('be.disabled');
  });
});
