/// <reference types="Cypress" />
import { setupWindow } from '../../utilities/window';

context('Querying', () => {
  beforeEach(() => {
    cy.server();
    cy.fixture('resources.json').as('resourcesJSON');
    cy.fixture('available_Stacks.json').as('availableStacksJSON');
    cy.fixture('app_settings/site.json').as('siteJSON');
    cy.fixture('app_settings/connectionstrings.json').as('connectionstrings');
    cy.fixture('app_settings/appsettings.json').as('appsettings');
    cy.fixture('app_settings/webconfig.json').as('webconfig');
    cy.fixture('app_settings/metadata.json').as('metadata');
    cy.fixture('app_settings/slotconfignames.json').as('slotconfigNames');
    cy.fixture('app_settings/slots.json').as('slots');
    cy.route('**/api/resources**', '@resourcesJSON');
    cy.route(
      'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif?api-version=2016-03-01',
      '@siteJSON'
    );
    cy.route({
      url: 'https://management.azure.comresourceid/config/connectionStrings/list?api-version=2016-03-01',
      response: '@connectionstrings',
      method: 'POST',
    });
    cy.route({
      url: 'https://management.azure.comresourceid/config/appsettings/list?api-version=2016-03-01',
      response: '@appsettings',
      method: 'POST',
    });
    cy.route({
      url: '**/config/metadata/list?api-version=2016-03-01',
      response: '@metadata',
      method: 'POST',
    });
    cy.route('https://management.azure.comresourceid/config/web?api-version=2016-03-01', '@webconfig');
    cy.route('https://management.azure.comresourceid/config/slotConfigNames?api-version=2018-02-01', '@slotconfigNames');
    cy.route('https://management.azure.com/providers/Microsoft.Web/availableStacks?api-version=2018-02-01', '@availableStacksJSON');
    cy.route(
      'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif/slots?api-version=2016-03-01',
      '@slots'
    );
    cy.visit(
      '/feature/subscriptions/resoindfos/resourcegroups/roinwerw/providers/microsoft.web/sites/soidfnosnif/settings?trustedAuthority=test',
      {
        onBeforeLoad(win) {
          setupWindow(win);
        },
      }
    );
  });

  // The most commonly used query is 'cy.get()', you can
  // think of this like the '$' in jQuery

  it('cy.get() - query DOM elements', () => {
    cy.screenshot();
    expect(true).to.be.true;
  });
});
