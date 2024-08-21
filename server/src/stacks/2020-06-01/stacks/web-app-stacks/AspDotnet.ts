import { WebAppStack } from '../../models/WebAppStackModel';

export const aspDotnetStack: WebAppStack = {
  displayText: '.NET',
  value: 'aspnet',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: '.NET 7',
      value: '7',
      minorVersions: [
        {
          displayText: '.NET 7',
          value: '7',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v7.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '7.0.x',
              },
              isHidden: true,
              isEarlyAccess: true,
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|7.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '7.0.x',
              },
              isHidden: true,
              isEarlyAccess: true,
            },
          },
        },
      ],
    },
    {
      displayText: '.NET 6',
      value: '6',
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
                notSupportedInCreates: true,
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
                notSupportedInCreates: true,
              },
              isEarlyAccess: true,
            },
          },
        },
      ],
    },
    {
      displayText: '.NET 5',
      value: '5',
      minorVersions: [
        {
          displayText: '.NET 5',
          value: '5',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v5.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '5.0.x',
              },
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|5.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
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
      displayText: 'ASP.NET V4',
      value: 'v4',
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
      value: 'v3',
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
