/// <reference types="Cypress" />
import { setupWindow } from './window';

export function startVisit(os = 'windows', writeAccess = 'allow', baseOnly = false) {
  const baseFixtures = cy
    .server()
    .fixture('resources.json')
    .as('resourcesJSON')
    .fixture(`available_Stacks.${os}.json`)
    .as('availableStacksJSON')
    .fixture(`default/site.${os}.json`)
    .as('siteJSON')
    .fixture('default/connectionstrings.json')
    .as('connectionstrings')
    .fixture('default/appsettings.json')
    .as('appsettings')
    .fixture(`default/webconfig.${os}.json`)
    .as('webconfig')
    .fixture('default/metadata.json')
    .as('metadata')
    .fixture('default/slotconfignames.json')
    .as('slotconfignames')
    .fixture('default/slots.json')
    .as('slots')
    .fixture(`default/rbaccheck.${writeAccess}.json`)
    .as('rbacAllow')
    .route('**/api/resources**', '@resourcesJSON')
    .route(
      'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif/providers/microsoft.authorization/permissions?api-version=2015-07-01',
      '@rbacAllow'
    )
    .as('rbacCall');
  if (baseOnly) {
    return baseFixtures;
  }
  if (writeAccess == 'allow') {
    return baseFixtures
      .route({
        url:
          'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif?api-version=**',
        response: '@siteJSON',
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
      .route(`**/availableStacks?osTypeSelected=${os === 'windows' ? 'Windows' : 'Linux'}&api-version=2018-02-01`, '@availableStacksJSON')
      .as('getAvailableStacks')
      .route(
        'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif/slots?api-version=**',
        '@slots'
      )
      .visit(
        '/feature/subscriptions/resoindfos/resourcegroups/roinwerw/providers/microsoft.web/sites/soidfnosnif/settings?trustedAuthority=test&appsvc.skipbatching=true',
        {
          onBeforeLoad(win) {
            setupWindow(win);
            cy.spy(win.parent, 'postMessage').as('spyPostMessage');
          },
        }
      )
      .wait('@rbacCall');
  } else {
    return baseFixtures
      .route(
        'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif?api-version=**',
        '@siteJSON'
      )
      .route({
        url: '**/config/connectionstrings/list?api-version=**',
        response: '',
        status: 401,
        method: 'POST',
      })
      .route({
        url: '**/config/appsettings/list?api-version=**',
        response: '',
        status: 401,
        method: 'POST',
      })
      .route({
        url: '**/config/metadata/list?api-version=**',
        response: '',
        status: 401,
        method: 'POST',
      })
      .route('**/config/web?api-version=**', '@webconfig')
      .route('**/config/slotconfignames?api-version=2018-02-01', '@slotconfignames')
      .route(`**/availableStacks?osTypeSelected=${os === 'windows' ? 'Windows' : 'Linux'}&api-version=2018-02-01`, '@availableStacksJSON')
      .as('getAvailableStacks')
      .route(
        'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif/slots?api-version=**',
        '@slots'
      )
      .window()
      .then(win => {
        console.log(win);
        cy.spy(win, 'postMessage').as('spyPostMessage');
      })
      .visit(
        '/feature/subscriptions/resoindfos/resourcegroups/roinwerw/providers/microsoft.web/sites/soidfnosnif/settings?trustedAuthority=test&appsvc.skipbatching=true',
        {
          onBeforeLoad(win) {
            setupWindow(win);
          },
        }
      )

      .wait('@rbacCall')
      .wait(50); //let page render all of the way
  }
}
