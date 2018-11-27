/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';

context('Default Documents', () => {
  beforeEach(() => {
    startVisit('windows', 'allow')
      .get('#app-settings-default-documents-tab')
      .click();
  });

  it('Default Documents are filled from API', () => {
    for (let i = 0; i <= 8; i++) {
      cy.get(`#app-settings-document-text-${i}`).should('exist');
    }
  });

  it('Can edit a default document', () => {
    cy.get('#app-settings-document-text-0')
      .type('add')
      .should('have.value', 'Default.htmadd');
  });

  it('Validation fails if duplicate document names are used', () => {
    cy.get('#app-settings-document-text-0')
      .type('l')
      .get('#root')
      .contains('This field must be unique');
  });

  it('Can delete a default document', () => {
    cy.get('#app-settings-document-text-8')
      .should('exist')
      .get('#app-settings-document-text-2')
      .should('have.value', 'Default.asp')
      .get('#app-settings-document-delete-2')
      .click()
      .get('#app-settings-document-text-8')
      .should('not.exist')
      .get('#app-settings-document-text-2')
      .should('not.have.value', 'Default.asp');
  });
});
