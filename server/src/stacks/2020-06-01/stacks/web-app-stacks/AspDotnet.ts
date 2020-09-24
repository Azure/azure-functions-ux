import { WebAppStack } from '../../models/WebAppStackModel';

export const aspDotnetStack: WebAppStack = {
  displayText: 'ASP.NET',
  value: 'aspnet',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'ASP.NET V4',
      value: 'v4',
      minorVersions: [
        {
          displayText: 'ASP.NET V4.7',
          value: 'v4.7',
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
