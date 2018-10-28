/// <reference types="Cypress" />
import { setupWindow } from '../../utilities/window';

context('Querying', () => {
  beforeEach(() => {
    cy.server()
      .fixture('resources.json')
      .as('resourcesJSON')
      .fixture('available_Stacks.linux.json')
      .as('availableStacksJSON')
      .fixture('default/site.linux.json')
      .as('siteJSON')
      .fixture('default/connectionstrings.json')
      .as('connectionstrings')
      .fixture('default/appsettings.json')
      .as('appsettings')
      .fixture('default/webconfig.linux.json')
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
      .route('**/availableStacks?osTypeSelected=Linux&api-version=2018-02-01', '@availableStacksJSON')
      .as('getAvailableStacks')
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
      )
      .wait('@getAvailableStacks');
  });

  it('Should contain all settings tabs for windows app settings', () => {
    cy.get('#app-settings-general-settings-tab')
      .should('exist')
      .get('#app-settings-path-mappings-tab')
      .should('not.exist')
      .get('#app-settings-default-documents-tab')
      .should('not.exist')
      .get('#app-settings-application-settings-tab')
      .should('exist');
  });

  it('Remote Debugging Section should not exist', () => {
    cy.get('#app-settings-remote-debugging-section').should('not.exist');
  });

  it('Stack Selection should match linuxFxVersion', () => {
    cy.get('#linux-fx-version-runtime-option').should('contain', 'Tomcat 8.5 (JRE 8)');
  });

  it('Platform Options Available To Linux are Available', () => {
    cy.get('#app-settings-worker-process')
      .should('not.exist')
      .get('#app-settings-managed-pipeline-mode')
      .should('not.exist')
      .get('#app-settings-web-sockets-enabled')
      .should('not.exist')
      .get('#app-settings-ftps-state')
      .should('exist')
      .get('#app-settings-always-on')
      .should('exist')
      .get('#app-settings-clientAffinityEnabled')
      .should('exist')
      .get('#app-settings-http-enabled')
      .should('exist');
  });
});
