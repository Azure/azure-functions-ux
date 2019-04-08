/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';
import { setupWindow } from '../../utilities/window';

context('App Settings General Settings Windows', () => {
  beforeEach(() => {
    startVisit().visit(
      `/feature/subscriptions/1489df65-b065-4cc3-b5c2-4b37cc88b703/resourcegroups/test-ux/providers/microsoft.web/sites/test-windows-app-ux/settings?trustedAuthority=test`,
      {
        onBeforeLoad(win) {
          setupWindow(win);
          cy.spy(win.parent, 'postMessage').as('spyPostMessage');
        },
      }
    );
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

  it('Remote Debugging being off should Hide VS Version Dropdown', () => {
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#remote-debugging-version-label')
      .should('not.exist');
  });

  it('default stack selection is .Net', () => {
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-stack-dropdown-option')
      .should('contain', '.NET')
      .should('not.contain', 'Python');
  });

  it('.NET stack should show .NET version dropdown', () => {
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list0')
      .click()
      .get('#netValidationVersion-option')
      .should('exist');
  });

  it('PHP stack should show PHP version dropdown', () => {
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list1')
      .click()
      .get('#phpVersion-option')
      .should('exist');
  });

  it('Python stack should show Python Versions', () => {
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list2')
      .click()
      .get('#pythonVersion-option')
      .should('exist');
  });

  it('Java stack should show Java Versions, Containers', () => {
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list3')
      .click()
      .get('#app-settings-java-major-verison')
      .should('exist')
      .get('#app-settings-java-minor-verison')
      .should('exist')
      .get('#app-settings-java-container-runtime')
      .should('exist');
  });

  it('Java container version should show when a Java Container is selected', () => {
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list3')
      .click()
      .get('#app-settings-java-container-runtime-option')
      .click()
      .get('#app-settings-java-container-runtime-list0')
      .click()
      .get('#app-settings-java-container-version')
      .should('exist');
  });

  xit('Java options are filled in from available stacks api', () => {
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-stack-dropdown-option')
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
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-stack-dropdown-option')
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
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-stack-dropdown-option')
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
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-stack-dropdown-option')
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
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-stack-dropdown-option')
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
    cy.get('#app-settings-general-settings-tab')
      .click()
      .get('#app-settings-worker-process')
      .should('exist')
      .get('#app-settings-managed-pipeline-mode')
      .should('exist')
      .get('#app-settings-web-sockets-enabled-label')
      .should('exist')
      .get('#app-settings-ftps-state')
      .should('exist')
      .get('#app-settings-always-on-label')
      .should('exist')
      .get('#app-settings-clientAffinityEnabled-label')
      .should('exist')
      .get('#app-settings-http-enabled-label')
      .should('exist');
  });
});
