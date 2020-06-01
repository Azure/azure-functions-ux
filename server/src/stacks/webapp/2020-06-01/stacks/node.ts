import { WebAppStack } from './../stack.model';

const node10EOL = new Date(2021, 4, 1);
const node12EOL = new Date(2022, 4, 1);

export const nodeStack: WebAppStack = {
  displayText: 'Node',
  value: 'Node',
  sortOrder: 1,
  preferredOs: 'linux',
  majorVersions: [
    {
      displayText: 'Node LTS',
      value: 'LTS',
      minorVersions: [
        {
          displayText: 'Node LTS',
          value: 'LTS',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|lts',
              isPreview: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
            },
          },
        },
      ],
    },
    {
      displayText: 'Node 12',
      value: '12',
      minorVersions: [
        {
          displayText: 'Node 12 LTS',
          value: '12-LTS',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|12-lts',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '12.x',
              },
              projectedEndOfLifeDate: node12EOL,
            },
            windows: {
              runtimeVersion: '12.13.0',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              projectedEndOfLifeDate: node12EOL,
            },
          },
        },
        {
          displayText: 'Node 12.9',
          value: '12.9',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|12.9',
              isDeprecated: true,
              remoteDebuggingEnabled: true,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '12.x',
              },
              projectedEndOfLifeDate: node12EOL,
            },
          },
        },
      ],
    },
    {
      displayText: 'Node 10',
      value: '10',
      minorVersions: [
        {
          displayText: 'Node 10 LTS',
          value: '10-LTS',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|10-lts',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '10.x',
              },
              projectedEndOfLifeDate: node10EOL,
            },
          },
        },
        {
          displayText: 'Node 10.16',
          value: '10.16',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|10.16',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              projectedEndOfLifeDate: node10EOL,
            },
          },
        },
        {
          displayText: 'Node 10.15',
          value: '10.15',
          platforms: {
            windows: {
              runtimeVersion: '10.15.2',
              isPreview: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              projectedEndOfLifeDate: node10EOL,
            },
          },
        },
        {
          displayText: 'Node 10.14',
          value: '10.14',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|10.14',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              projectedEndOfLifeDate: node10EOL,
            },
            windows: {
              runtimeVersion: '10.14.1',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              projectedEndOfLifeDate: node10EOL,
            },
          },
        },
        {
          displayText: 'Node 10.12',
          value: '10.12',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|10.12',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              projectedEndOfLifeDate: node10EOL,
            },
          },
        },
        {
          displayText: 'Node 10.10',
          value: '10.10',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|10.10',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              projectedEndOfLifeDate: node10EOL,
            },
            windows: {
              runtimeVersion: '10.0.0',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              projectedEndOfLifeDate: node10EOL,
            },
          },
        },
        {
          displayText: 'Node 10.6',
          value: '10.6',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|10.6',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              projectedEndOfLifeDate: node10EOL,
            },
            windows: {
              runtimeVersion: '10.6.0',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              projectedEndOfLifeDate: node10EOL,
            },
          },
        },
        {
          displayText: 'Node 10.1',
          value: '10.1',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|10.1',
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              projectedEndOfLifeDate: node10EOL,
            },
          },
        },
      ],
    },
  ],
};
