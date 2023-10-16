import { WebAppStack } from '../../models/WebAppStackModel';

const getGolangStack: (useIsoDateFormat: boolean) => WebAppStack = () => {
  return {
    displayText: 'Go',
    value: 'go',
    preferredOs: 'linux',
    majorVersions: [
      {
        displayText: 'Go 1',
        value: 'go1',
        minorVersions: [
          {
            displayText: 'Go 1.19 (Experimental)',
            value: 'go1.19',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'GO|1.19',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: true,
                },
                supportedFeatures: {
                  disableSsh: true,
                },
                isHidden: false,
                isEarlyAccess: false,
              },
            },
          },
          {
            displayText: 'Go 1.18 (Experimental)',
            value: 'go1.18',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'GO|1.18',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                supportedFeatures: {
                  disableSsh: true,
                },
                isHidden: false,
                isEarlyAccess: false,
                isDeprecated: true,
              },
            },
          },
        ],
      },
    ],
  };
};

export const golangStackWithNonIsoDates: WebAppStack = getGolangStack(false);

export const golangStack: WebAppStack = getGolangStack(true);
