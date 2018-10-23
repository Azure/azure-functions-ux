/// <reference types="Cypress" />
import { setupWindow } from '../../utilities/window';

context('Querying', () => {
  beforeEach(() => {
    cy.server()
      .fixture('resources.json')
      .as('resourcesJSON')
      .fixture('available_Stacks.json')
      .as('availableStacksJSON')
      .fixture('default/site.json')
      .as('siteJSON')
      .fixture('default/connectionstrings.json')
      .as('connectionstrings')
      .fixture('default/appsettings.json')
      .as('appsettings')
      .fixture('default/webconfig.json')
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
        url: 'https://management.azure.comresourceid/config/connectionStrings/list?api-version=2016-03-01',
        response: '@connectionstrings',
        method: 'POST',
      })
      .route({
        url: 'https://management.azure.comresourceid/config/appsettings/list?api-version=2016-03-01',
        response: '@appsettings',
        method: 'POST',
      })
      .route({
        url: '**/config/metadata/list?api-version=2016-03-01',
        response: '@metadata',
        method: 'POST',
      })
      .route('https://management.azure.comresourceid/config/web?api-version=2016-03-01', '@webconfig')
      .route('https://management.azure.comresourceid/config/slotConfigNames?api-version=2018-02-01', '@slotconfigNames')
      .route('https://management.azure.com/providers/Microsoft.Web/availableStacks?api-version=2018-02-01', '@availableStacksJSON')
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

  // The most commonly used query is 'cy.get()', you can
  // think of this like the '$' in jQuery

  it('Turning on Remote Debug should Trigger showing VS Version Dropdown', () => {
    cy.get('#remote-debugging-switch')
      .click()
      .get('#remote-debugging-version')
      .should('be.visible');
  });

  it('Remote Debugging being off should Hide VS Version Dropdown', () => {
    cy.get('#remote-debugging-version').should('not.exist');
  });
});
