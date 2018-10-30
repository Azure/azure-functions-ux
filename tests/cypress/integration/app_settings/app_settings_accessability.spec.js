/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';

context('Querying', () => {
  beforeEach(() => {
    startVisit('windows', 'allow');
  });

  it('General Settings Accessability', function() {
    cy.window()
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

  it('Default Documents Accessability', function() {
    cy.get('#app-settings-default-documents-tab')
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
