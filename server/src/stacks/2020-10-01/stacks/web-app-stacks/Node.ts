import { WebAppStack } from '../../models/WebAppStackModel';

const node14EOL = new Date(2023, 4, 30).toString();
const node12EOL = new Date(2022, 4, 1).toString();
const node10EOL = new Date(2021, 4, 1).toString();
const node7EOL = new Date(2017, 6, 30).toString();
const node6EOL = new Date(2019, 4, 30).toString();
const node4EOL = new Date(2018, 4, 30).toString();

export const nodeStack: WebAppStack = {
  displayText: 'Node',
  value: 'node',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'Node 14',
      value: '14',
      minorVersions: [
        {
          displayText: 'Node 14 LTS',
          value: '14-lts',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '~14',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '14.x',
              },
              endOfLifeDate: node14EOL,
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
          value: '12-lts',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '12.13.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              endOfLifeDate: node12EOL,
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
          displayText: 'Node 10.15',
          value: '10.15',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '10.15.2',
              isDeprecated: true,
              isPreview: true,
              isHidden: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '10.x',
              },
              endOfLifeDate: node10EOL,
            },
          },
        },
        {
          displayText: 'Node 10.14',
          value: '10.14',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '10.14.1',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '10.x',
              },
              endOfLifeDate: node10EOL,
            },
          },
        },
        {
          displayText: 'Node 10.10',
          value: '10.10',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '10.0.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '10.x',
              },
              endOfLifeDate: node10EOL,
            },
          },
        },
        {
          displayText: 'Node 10.6',
          value: '10.6',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '10.6.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              endOfLifeDate: node10EOL,
            },
          },
        },
      ],
    },
    {
      displayText: 'Node 7',
      value: '7',
      minorVersions: [
        {
          displayText: 'Node 7.10',
          value: '7.10',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '7.10.1',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: node7EOL,
            },
          },
        },
      ],
    },
    {
      displayText: 'Node 6',
      value: '6',
      minorVersions: [
        {
          displayText: 'Node 6.12',
          value: '6.12',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '6.12',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: node6EOL,
            },
          },
        },
        {
          displayText: 'Node 6.9',
          value: '6.9',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '6.9.5',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
              },
              endOfLifeDate: node6EOL,
            },
          },
        },
        {
          displayText: 'Node 6.5',
          value: '6.5',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '6.5.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: node6EOL,
            },
          },
        },
      ],
    },
    {
      displayText: 'Node 4',
      value: '4',
      minorVersions: [
        {
          displayText: 'Node 4.8',
          value: '4.8',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '4.8',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: node4EOL,
            },
          },
        },
      ],
    },
  ],
};
