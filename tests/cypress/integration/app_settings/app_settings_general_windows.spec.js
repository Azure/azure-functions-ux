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
      .fixture('default/rbaccheck.allow.json')
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

  it('Should contain all settings tabs for windows app settings', () => {
    cy.get('#app-settings-general-settings-tab')
      .should('exist')
      .get('#app-settings-path-mappings-tab')
      .should('exist')
      .get('#app-settings-default-documents-tab')
      .should('exist')
      .get('#app-settings-application-settings-tab')
      .should('exist');
  });

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
      .get('#app-settings-java-major-verison-list')
      .find('button')
      .should('have.length', 2)
      .get('#app-settings-java-major-verison-list1')
      .should('contain', 'Java 8')
      .click()
      .get('#app-settings-java-minor-verison-option')
      .click()
      .get('#app-settings-java-minor-verison-list')
      .find('button')
      .should('have.length', 9)
      .get('#app-settings-java-minor-verison-list0')
      .should('contain', '1.8.0_25')
      .click()
      .get('#app-settings-java-container-runtime-option')
      .click()
      .get('#app-settings-java-container-runtime-list')
      .find('button')
      .should('have.length', 2)
      .get('#app-settings-java-container-runtime-list0')
      .should('contain', 'Tomcat')
      .click()
      .get('#app-settings-java-container-version-option')
      .click()
      .get('#app-settings-java-container-version-list')
      .find('button')
      .should('have.length', 14)
      .get('#app-settings-java-container-version-list1')
      .should('contain', '7.0.50')
      .click();
  });

  it('.NET options are filled in from available stacks api', () => {
    cy.get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list0')
      .click()
      .get('#netValidationVersion-option')
      .click()
      .get('#netValidationVersion-list')
      .find('button')
      .should('have.length', 2)
      .get('#netValidationVersion-list0')
      .should('contain', 'v4.7');
  });

  it('PHP options are filled in from available stacks api', () => {
    cy.get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list1')
      .click()
      .get('#phpVersion-option')
      .click()
      .get('#phpVersion-list')
      .find('button')
      .should('have.length', 4)
      .get('#phpVersion-list0')
      .should('contain', '5.6');
  });

  it('Python options are filled in from available stacks api', () => {
    cy.get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list2')
      .click()
      .get('#pythonVersion-option')
      .click()
      .get('#pythonVersion-list')
      .find('button')
      .should('have.length', 3)
      .get('#pythonVersion-list0')
      .should('contain', '2.7');
  });

  it('Python options are filled in from available stacks api', () => {
    cy.get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list2')
      .click()
      .get('#pythonVersion-option')
      .click()
      .get('#pythonVersion-list')
      .find('button')
      .should('have.length', 3)
      .get('#pythonVersion-list0')
      .should('contain', '2.7');
  });

  it('All Platform Options are present', () => {
    cy.get('#app-settings-worker-process')
      .should('exist')
      .get('#app-settings-managed-pipeline-mode')
      .should('exist')
      .get('#app-settings-web-sockets-enabled')
      .should('exist')
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
