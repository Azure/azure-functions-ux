import { WebAppStack } from '../../models/WebAppStackModel';

export const staticSiteStack: WebAppStack = {
  displayText: 'HTML (Static Content)',
  value: 'staticsite',
  preferredOs: 'linux',
  majorVersions: [
    {
      displayText: 'HTML (Static Content)',
      value: '1',
      minorVersions: [
        {
          displayText: 'HTML (Static Content)',
          value: '1.0',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'STATICSITE|1.0',
              isHidden: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          },
        },
      ],
    },
  ],
};
