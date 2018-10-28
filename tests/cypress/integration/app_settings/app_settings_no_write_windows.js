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
      .fixture('default/rbaccheck.denyWrite.json')
      .as('rbacAllow')
      .route('**/api/resources**', '@resourcesJSON')
      .route('**/providers/microsoft.authorization/permissions**', '@rbacAllow')
      .as('rbacCall')
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
      )
      .wait('@rbacCall');
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
      .get('#remote-debugging-switch')
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
