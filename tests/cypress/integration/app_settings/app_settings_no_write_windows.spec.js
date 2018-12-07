/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';

context('App Settings Readonly Access', () => {
  beforeEach(() => {
    startVisit('windows', 'denyWrite');
  });

  it('general settings should all be disabled except stack list', () => {
    cy.get('body')
      .find('.ms-Dropdown')
      .each(el => {
        if (el[0].id === 'app-settings-stack-dropdown') {
          expect(el[0].className).not.to.include('is-disabled');
        } else {
          expect(el[0].className).to.include('is-disabled');
        }
      })
      .get('#ChoiceGroup28-true')
      .should('be.disabled');
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
