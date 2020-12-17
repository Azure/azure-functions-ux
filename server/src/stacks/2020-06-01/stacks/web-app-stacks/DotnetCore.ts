import { WebAppStack } from '../../models/WebAppStackModel';

const dotnetCore3Point0EOL = new Date(2020, 3, 3).toString();
const dotnetCore2Point2EOL = new Date(2019, 12, 23).toString();
const dotnetCore2Point1EOL = new Date(20201, 8, 21).toString();
const dotnetCore2Point0EOL = new Date(2018, 10, 1).toString();
const dotnetCore1EOL = new Date(2019, 6, 27).toString();

export const dotnetCoreStack: WebAppStack = {
  displayText: '.NET Core',
  value: 'dotnetcore',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: '.NET Core 3',
      value: '3',
      minorVersions: [
        {
          displayText: '.NET Core 3.1 (LTS)',
          value: '3.1',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '3.1',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.1.301',
              },
            },
          },
        },
        {
          displayText: '.NET Core 3.0',
          value: '3.0',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '3.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.0.103',
              },
              endOfLifeDate: dotnetCore3Point0EOL,
            },
          },
        },
      ],
    },
    {
      displayText: '.NET Core 2',
      value: 'dotnetcore2',
      minorVersions: [
        {
          displayText: '.NET Core 2.2',
          value: '2.2',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '2.2',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '2.2.207',
              },
              endOfLifeDate: dotnetCore2Point2EOL,
            },
          },
        },
        {
          displayText: '.NET Core 2.1 (LTS)',
          value: '2.1',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '2.1',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '2.1.807',
              },
              endOfLifeDate: dotnetCore2Point1EOL,
            },
          },
        },
        {
          displayText: '.NET Core 2.0',
          value: '2.0',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '2.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '2.1.202',
              },
              endOfLifeDate: dotnetCore2Point0EOL,
            },
          },
        },
      ],
    },
  ],
};
