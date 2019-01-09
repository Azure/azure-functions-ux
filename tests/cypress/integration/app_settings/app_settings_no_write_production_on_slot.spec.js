/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';
import { setupWindow } from '../../utilities/window';
context('App Settings Readonly Access', () => {
  beforeEach(() => {
    startVisit('windows', 'denyWrite', true)
      .fixture('default/site.windows.slot.json')
      .as('slotFetch')
      .fixture(`default/rbaccheck.allow.json`)
      .as('rbacAllowed')
      .route(
        'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif/slots/slot/providers/microsoft.authorization/permissions?api-version=2015-07-01',
        '@rbacAllowed'
      )
      .as('rbacCall2')
      .route({
        url:
          'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif/slots/slot?api-version=**',
        response: '@slotFetch',
        method: 'GET',
      })
      .route({
        url: '**/config/connectionstrings/list?api-version=**',
        response: '@connectionstrings',
        method: 'POST',
      })
      .route({
        url: '**/config/appsettings/list?api-version=**',
        response: '@appsettings',
        method: 'POST',
      })
      .route({
        url: '**/config/metadata/list?api-version=**',
        response: '@metadata',
        method: 'POST',
      })
      .route('**/config/web?api-version=**', '@webconfig')
      .route('**/config/slotconfignames?api-version=2018-02-01', '@slotconfignames')
      .route(
        `https://management.azure.com/providers/Microsoft.Web/availableStacks?osTypeSelected=Windows&api-version=2018-02-01`,
        '@availableStacksJSON'
      )
      .as('getAvailableStacks')
      .route(
        'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif/slots?api-version=**',
        '@slots'
      )
      .visit(
        '/feature/subscriptions/resoindfos/resourcegroups/roinwerw/providers/microsoft.web/sites/soidfnosnif/slots/slot/settings?trustedAuthority=test',
        {
          onBeforeLoad(win) {
            setupWindow(win);
            cy.spy(win.parent, 'postMessage').as('spyPostMessage');
          },
        }
      )
      .wait('@rbacCall');
  });

  it('Autoswap should be disabled', () => {
    cy.get('[data-cy=auto-swap-disabled-message]').should('exist');
    cy.get('[data-cy=auto-swap-control-set]').should('not.exist');
  });

  it('Slot Settings should be blocked in application settings', () => {
    cy.get('#app-settings-application-settings-tab')
      .click()
      .get('#app-settings-application-settings-edit-1')
      .click()
      .get('#app-settings-edit-sticky')
      .should('be.disabled')
      .get('[data-cy=app-setting-slot-setting-no-permission-message')
      .should('exist');
  });
  it('Slot Settings should be blocked in connection strings', () => {
    cy.get('#app-settings-application-settings-tab')
      .click()
      .get('#app-settings-connection-strings-edit-0')
      .click()
      .get('#connection-strings-form-sticky')
      .should('be.disabled')
      .get('[data-cy=connection-string-slot-setting-no-permission-message')
      .should('exist');
  });
});
