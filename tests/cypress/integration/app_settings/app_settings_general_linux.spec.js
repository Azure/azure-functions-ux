/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';
import { setupWindow } from '../../utilities/window';

context('App Settings Linux Basic', () => {
  beforeEach(() => {
    startVisit().visit(
      `/feature/subscriptions/1489df65-b065-4cc3-b5c2-4b37cc88b703/resourcegroups/test-ux/providers/microsoft.web/sites/test-linux-app-ux/settings?trustedAuthority=test`,
      {
        onBeforeLoad(win) {
          setupWindow(win);
          cy.spy(win.parent, 'postMessage').as('spyPostMessage');
        },
      }
    );
  });

  it('Should contain all settings tabs for linux app settings', () => {
    cy.get('#app-settings-general-settings-tab')
      .should('exist')
      .get('#app-settings-path-mappings-tab')
      .should('exist')
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
      .get('#app-settings-always-on-label')
      .should('exist')
      .get('#app-settings-clientAffinityEnabled-label')
      .should('exist')
      .get('#app-settings-http-enabled-label')
      .should('exist');
  });
});
