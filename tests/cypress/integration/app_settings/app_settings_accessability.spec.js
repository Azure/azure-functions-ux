/// <reference types="Cypress" />
import { setupWindow } from '../../utilities/window';

context('Querying', () => {
  beforeEach(() => {
    cy.server()
      .fixture('resources.json')
      .as('resourcesJSON')
      .fixture('available_Stacks.windows.json')
      .as('availableStacksJSON')
      .fixture('default/site.windows.json')
      .as('siteJSON')
      .fixture('default/connectionstrings.json')
      .as('connectionstrings')
      .fixture('default/appsettings.json')
      .as('appsettings')
      .fixture('default/webconfig.windows.json')
      .as('webconfig')
      .fixture('default/metadata.json')
      .as('metadata')
      .fixture('default/slotconfignames.json')
      .as('slotconfigNames')
      .fixture('default/slots.json')
      .as('slots')
      .route('**/api/resources**', '@resourcesJSON')
      .route(
        'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif?api-version=2016-03-01',
        '@siteJSON'
      )
      .route({
        url: '**/config/connectionStrings/list?api-version=2016-03-01',
        response: '@connectionstrings',
        method: 'POST',
      })
      .route({
        url: '**/config/appsettings/list?api-version=2016-03-01',
        response: '@appsettings',
        method: 'POST',
      })
      .route({
        url: '**/config/metadata/list?api-version=2016-03-01',
        response: '@metadata',
        method: 'POST',
      })
      .route('**/config/web?api-version=2016-03-01', '@webconfig')
      .route('**/config/slotConfigNames?api-version=2018-02-01', '@slotconfigNames')
      .route('**/availableStacks?osTypeSelected=Windows&api-version=2018-02-01', '@availableStacksJSON')
      .route(
        'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif/slots?api-version=2016-03-01',
        '@slots'
      )
      .visit(
        '/feature/subscriptions/resoindfos/resourcegroups/roinwerw/providers/microsoft.web/sites/soidfnosnif/settings?trustedAuthority=test',
        {
          onBeforeLoad(win) {
            setupWindow(win);
          },
        }
      );
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
