/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';

context('App Settings Application Settings and Connection Strings Windows', () => {
  beforeEach(() => {
    startVisit('windows', 'allow')
      .get('#app-settings-application-settings-tab')
      .click();
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
      .click()
      .get('#app-settings-edit-footer-save')
      .click()
      .get('#app-settings-application-settings-name-1')
      .contains('TEST_NAME_NEW')
      .get('#app-settings-application-settings-value-1')
      .contains('TEST_VALUE_NEW')
      .get('#app-settings-application-settings-sticky-1')
      .should('exist');
  });
});
