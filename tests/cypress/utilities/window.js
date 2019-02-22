const MsRest = require('ms-rest-azure');

export function setupWindow(win) {
  win.parent = {
    postMessage: async message => {
      if (message.kind === 'get-startup-info') {
        const tokenCall = await fetch(`https://login.microsoftonline.com/${Cypress.env().AD_DIRECTORY_ID}/oauth2/token?api-version=1.0`, {
          method: 'POST',

          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `grant_type=client_credentials&client_id=${
            Cypress.env().AD_APPLICATION_ID
          }&resource=https%3A%2F%2Fmanagement.core.windows.net%2F&client_secret=${Cypress.env().AD_APPLICATION_SECRET}`, // body data type must match "Content-Type" header
        });
        const credentials = await tokenCall.json();
        win.postMessage(
          {
            kind: 'send-startup-info',
            data: {
              sessionId: 'sessionid',
              token: credentials.access_token,
              acceptLanguage: 'en',
              effectiveLocale: 'en.en-us',
              resourceId: 'resourceid',
              theme: 'azure',
              armEndpoint: 'https://management.azure.com',
            },
          },
          win.location.origin
        );
      }
    },
  };
}
