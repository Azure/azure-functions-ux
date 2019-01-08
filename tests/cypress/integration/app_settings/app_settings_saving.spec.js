/// <reference types="Cypress" />
import { startVisit } from '../../utilities/app-settings-utils';

context('App Settings Save/Notification', () => {
  beforeEach(() => {
    startVisit('windows', 'allow').wait('@getAvailableStacks');
  });

  it('Correct API calls are made when saved and it starts/stops notification with success', () => {
    cy.route({
      url:
        'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif?api-version=**',
      response: '@siteJSON',
      method: 'PUT',
    })
      .as('putSite')
      .route({ url: '**/config/web?api-version=**', response: '@webconfig', method: 'PUT' })
      .as('putConfig')
      .route({ url: '**/config/slotconfignames?api-version=2018-02-01', response: '@slotconfignames', method: 'PUT' })
      .as('putSlotNames')
      .get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list1')
      .click()
      .get('#command-button-save')
      .click()
      .wait('@putSite')
      .should(xhr => {
        expect(xhr.request.body.properties.siteConfig.metadata[0].value).to.equal('php');
      })
      .get('#app-settings-stack-dropdown-option')
      .should('contain', 'PHP')
      .wait(1)
      .get('@spyPostMessage')
      .then(x => {
        const setNotificationArgs = x.args.filter(x => x[0].kind === 'set-notification');
        expect(setNotificationArgs.length).to.equal(2);
        const startData = JSON.parse(setNotificationArgs[0][0].data);
        expect(startData.state).to.equal('start');
        const stopData = JSON.parse(setNotificationArgs[1][0].data);
        expect(stopData.state).to.equal('success');
      });
  });

  it('Correct API calls are made when saved and it starts/stops notification with failure', () => {
    cy.route({
      url:
        'https://management.azure.com/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif?api-version=**',
      response: '',
      status: 503,
      method: 'PUT',
    })
      .as('putSite')
      .route({ url: '**/config/web?api-version=**', response: '@webconfig', method: 'PUT' })
      .as('putConfig')
      .route({ url: '**/config/slotconfignames?api-version=2018-02-01', response: '@slotconfignames', method: 'PUT' })
      .as('putSlotNames')
      .get('#app-settings-stack-dropdown-option')
      .click()
      .get('#app-settings-stack-dropdown-list1')
      .click()
      .get('#command-button-save')
      .click()
      .wait(1)
      .get('@spyPostMessage')
      .then(x => {
        const setNotificationArgs = x.args.filter(x => x[0].kind === 'set-notification');
        expect(setNotificationArgs.length).to.equal(2);
        const startData = JSON.parse(setNotificationArgs[0][0].data);
        expect(startData.state).to.equal('start');
        const stopData = JSON.parse(setNotificationArgs[1][0].data);
        expect(stopData.state).to.equal('fail');
      });
  });
});
