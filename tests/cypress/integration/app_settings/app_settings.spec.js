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

  it('default stack selection is .Net', () => {
    cy.get('#app-settings-stack-dropdown-option')
      .should('contain', '.NET')
      .should('not.contain', 'Python');
  });

  it('.NET stack should show .NET version dropdown', () => {
    cy.get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list0')
      .click()
      .get('#netValidationVersion-option')
      .should('exist');
  });

  it('PHP stack should show PHP version dropdown', () => {
    cy.get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list1')
      .click()
      .get('#phpVersion-option')
      .should('exist');
  });

  it('Python stack should show Python Versions', () => {
    cy.get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list2')
      .click()
      .get('#pythonVersion-option')
      .should('exist');
  });

  it('Java stack should show Java Versions, Containers and Container Versions', () => {
    cy.get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list3')
      .click()
      .get('#app-settings-java-major-verison')
      .should('exist')
      .get('#app-settings-java-minor-verison')
      .should('exist')
      .get('#app-settings-java-container-runtime')
      .should('exist')
      .get('#app-settings-java-container-version')
      .should('exist');
  });

  it('Java options are filled in from available stacks api', () => {
    cy.get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list3')
      .click()
      .get('#app-settings-java-major-verison-option')
      .click()
      .get('#app-settings-java-major-verison-list1')
      .should('contain', 'Java 8')
      .click()
      .get('#app-settings-java-minor-verison-option')
      .click()
      .get('#app-settings-java-minor-verison-list0')
      .should('contain', '1.8.0_25')
      .click()
      .get('#app-settings-java-container-runtime-option')
      .click()
      .get('#app-settings-java-container-runtime-list0')
      .should('contain', 'Tomcat')
      .click()
      .get('#app-settings-java-container-version-option')
      .click()
      .get('#app-settings-java-container-version-list1')
      .should('contain', '7.0.50')
      .click();
  });
});
