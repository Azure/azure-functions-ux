import { WebAppStack } from './../stack.model';

export const pythonStack: WebAppStack = {
  displayText: 'Python',
  value: 'Python',
  sortOrder: 2,
  preferredOs: 'linux',
  majorVersions: [
    {
      displayText: 'Python 3',
      value: '3',
      minorVersions: [
        {
          displayText: 'Python 3.8',
          value: '3.8',
          platforms: {
            linux: {
              runtimeVersion: 'PYTHON|3.8',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
            },
          },
        },
        {
          displayText: 'Python 3.7',
          value: '3.7',
          platforms: {
            linux: {
              runtimeVersion: 'PYTHON|3.7',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
            },
          },
        },
        {
          displayText: 'Python 3.6',
          value: '3.6',
          platforms: {
            linux: {
              runtimeVersion: 'PYTHON|3.6',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
            },
            windows: {
              runtimeVersion: '3.4.0',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.6',
              },
            },
          },
        },
      ],
    },
    {
      displayText: 'Python 2',
      value: '2',
      minorVersions: [
        {
          displayText: 'Python 2.7',
          value: '2.7',
          platforms: {
            linux: {
              runtimeVersion: 'PYTHON|2.7',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
            },
            windows: {
              runtimeVersion: '2.7.3',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
            },
          },
        },
      ],
    },
  ],
};
