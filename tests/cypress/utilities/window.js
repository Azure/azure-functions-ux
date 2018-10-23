export function setupWindow(win) {
  win.parent = {
    postMessage: message => {
      if (message.kind === 'get-startup-info') {
        win.postMessage(
          {
            kind: 'send-startup-info',
            data: {
              sessionId: 'sessionid',
              token: 'token',
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
