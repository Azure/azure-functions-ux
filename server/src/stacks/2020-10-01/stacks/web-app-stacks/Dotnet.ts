import { WebAppStack } from '../../models/WebAppStackModel';

const dotnetCore3Point0EOL = new Date(2020, 3, 3).toString();
const dotnetCore2Point2EOL = new Date(2019, 12, 23).toString();
const dotnetCore2Point1EOL = new Date(2021, 7, 21).toString();
const dotnetCore2Point0EOL = new Date(2018, 10, 1).toString();
const dotnetCore1EOL = new Date(2019, 6, 27).toString();

export const dotnetStack: WebAppStack = {
  displayText: '.NET',
  value: 'dotnet',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: '.NET 6',
      value: 'dotnet6',
      minorVersions: [
        {
          displayText: '.NET 6',
          value: '6',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v6.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '6.0.x',
              },
              isEarlyAccess: true,
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|6.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '6.0.x',
              },
              isEarlyAccess: true,
            },
          },
        },
      ],
    },
    {
      displayText: '.NET 5',
      value: 'dotnet5',
      minorVersions: [
        {
          displayText: '.NET 5',
          value: '5',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v5.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '5.0.x',
              },
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|5.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '5.0.x',
              },
            },
          },
        },
      ],
    },
    {
      displayText: '.NET Core 3',
      value: 'dotnetcore3',
      minorVersions: [
        {
          displayText: '.NET Core 3.1 (LTS)',
          value: '3.1',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '3.1',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.1.301',
              },
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|3.1',
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
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|3.0',
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
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|2.2',
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
              isDeprecated: true,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '2.1.807',
              },
              endOfLifeDate: dotnetCore2Point1EOL,
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|2.1',
              remoteDebuggingSupported: false,
              isDeprecated: true,
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
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|2.0',
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
    {
      displayText: '.NET Core 1',
      value: 'dotnetcore1',
      minorVersions: [
        {
          displayText: '.NET Core 1.1',
          value: '1.1',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.1',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '1.1.14',
              },
              endOfLifeDate: dotnetCore1EOL,
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|1.1',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '1.1.14',
              },
              endOfLifeDate: dotnetCore1EOL,
            },
          },
        },
        {
          displayText: '.NET Core 1.0',
          value: '1.0',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '1.1.14',
              },
              endOfLifeDate: dotnetCore1EOL,
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|1.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '1.1.14',
              },
              endOfLifeDate: dotnetCore1EOL,
            },
          },
        },
      ],
    },
    {
      displayText: 'ASP.NET V4',
      value: 'aspdotnetv4',
      minorVersions: [
        {
          displayText: 'ASP.NET V4.8',
          value: 'v4.8',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v4.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.1',
              },
            },
          },
        },
      ],
    },
    {
      displayText: 'ASP.NET V3',
      value: 'aspdotnetv3',
      minorVersions: [
        {
          displayText: 'ASP.NET V3.5',
          value: 'v3.5',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v2.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '2.1',
              },
            },
          },
        },
      ],
    },
  ],
};
