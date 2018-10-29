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
    .route(`**/availableStacks?osTypeSelected=${os === 'windows' ? 'Windows' : 'Linux'}&api-version=2018-02-01`, '@availableStacksJSON')
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
}
