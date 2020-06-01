import { WebAppStack } from './../stack.model';

export const nodeStack: WebAppStack = {
  displayText: 'Node',
  value: 'Node',
  sortOrder: 1,
  preferredOs: 'linux',
  majorVersions: [
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
            },
          },
        },
        {
          displayText: 'Node 10.10',
          value: '10.10',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|10.10',
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
            },
          },
        },
        {
          displayText: 'Node 10.14',
          value: '10.14',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|10.14',
              isDeprecated: true,
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
            },
          },
        },
        {
          displayText: 'Node 10.0',
          value: '10.0',
          platforms: {
            windows: {
              runtimeVersion: '10.0.0',
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
      displayText: 'Node 9',
      value: '9',
      minorVersions: [
        {
          displayText: 'Node 9.4',
          value: '9.4',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|9.4',
              isDeprecated: true,
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
      displayText: 'Node 8',
      value: '8',
      minorVersions: [
        {
          displayText: 'Node 8 LTS',
          value: '8-LTS',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|8-lts',
              isDeprecated: true,
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
        {
          displayText: 'Node 8.12',
          value: '8.12',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|8.12',
              isDeprecated: true,
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
        {
          displayText: 'Node 8.11',
          value: '8.11',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|8.11',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
            },
            windows: {
              runtimeVersion: '8.11',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          },
        },
        {
          displayText: 'Node 8.10',
          value: '8.10',
          platforms: {
            windows: {
              runtimeVersion: '8.10',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          },
        },
        {
          displayText: 'Node 8.9',
          value: '8.9',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|8.9',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
            },
            windows: {
              runtimeVersion: '8.9',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          },
        },
        {
          displayText: 'Node 8.8',
          value: '8.8',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|8.8',
              isDeprecated: true,
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
        {
          displayText: 'Node 8.5',
          value: '8.5',
          platforms: {
            windows: {
              runtimeVersion: '8.5',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          },
        },
        {
          displayText: 'Node 8.4',
          value: '8.4',
          platforms: {
            windows: {
              runtimeVersion: '8.4',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          },
        },
        {
          displayText: 'Node 8.2',
          value: '8.2',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|8.2',
              isDeprecated: true,
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
        {
          displayText: 'Node 8.1',
          value: '8.1',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|8.1',
              isDeprecated: true,
              remoteDebuggingEnabled: false,
              appInsightsSettings: {
                isEnabled: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
            },
            windows: {
              runtimeVersion: '8.1.4',
              isDeprecated: true,
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
        {
          displayText: 'Node 8.0',
          value: '8.0',
          platforms: {
            linux: {
              runtimeVersion: 'NODE|8.0',
              isDeprecated: true,
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
      displayText: 'Node 6',
      value: '6',
      minorVersions: [],
    },
    {
      displayText: 'Node 4',
      value: '4',
      minorVersions: [],
    },
  ],
};
