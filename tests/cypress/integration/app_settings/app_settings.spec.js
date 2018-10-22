/// <reference types="Cypress" />

context('Querying', () => {
    beforeEach(() => {
      cy.server();
      cy.fixture('resources.json').as('exampleJSON');
      cy.fixture('site.json').as('siteJSON');
      cy.route('**/api/resources**', '@exampleJSON');
      cy.route('/subscriptions/resoindfos/resourcegroups/roinwerw/providers/Microsoft.Web/sites/soidfnosnif?', )
      cy.visit('/feature/subscriptions/resoindfos/resourcegroups/roinwerw/providers/microsoft.web/sites/soidfnosnif/settings?trustedAuthority=test', {
        onBeforeLoad(win) {
            win.parent = { 
                postMessage: (message) => {
                    if(message.kind === 'get-startup-info'){
                    win.postMessage({
                        kind: 'send-startup-info',
                        data: {
                            "sessionId": "sessionid",
                            "token": "token",
                            "acceptLanguage": "en",
                            "effectiveLocale": "en.en-us",
                            "resourceId": "resourceid",
                            "theme": "azure",
                            "armEndpoint": "https://management.azure.com",
                          }
                    }, win.location.origin);
                }
                }
            }
          }
    });
      

      
    })
  
    // The most commonly used query is 'cy.get()', you can
    // think of this like the '$' in jQuery
  
    it('cy.get() - query DOM elements', () => {
        expect(true).to.be.true;
    })
});