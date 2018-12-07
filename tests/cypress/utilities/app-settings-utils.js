/// <reference types="Cypress" />
import { setupWindow } from './window';

export function startVisit(os = 'windows', writeAccess = 'allow') {
  return cy
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
    .as('slotconfigNames')
    .fixture('default/slots.json')
    .as('slots')
    .fixture(`default/rbaccheck.${writeAccess}.json`)
    .as('rbacAllow')
    .route('**/api/resources**', '@resourcesJSON')
    .route('**/providers/microsoft.authorization/permissions**', '@rbacAllow')
    .as('rbacCall')
    .route(
      'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif?api-version=**',
      '@siteJSON'
    )
    .route({
      url: '**/config/connectionStrings/list?api-version=**',
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
    .route('**/config/slotConfigNames?api-version=2018-02-01', '@slotconfigNames')
    .route(`**/availableStacks?osTypeSelected=${os === 'windows' ? 'Windows' : 'Linux'}&api-version=2018-02-01`, '@availableStacksJSON')
    .as('getAvailableStacks')
    .route(
      'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif/slots?api-version=**',
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
}
