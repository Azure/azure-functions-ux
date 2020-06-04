import { WebAppStack } from './../stack.model';

export const aspDotnetStack: WebAppStack = {
  displayText: 'ASP.NET',
  value: 'ASP.NET',
  sortOrder: 0,
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'ASP.NET V4',
      value: 'V4',
      minorVersions: [
        {
          displayText: 'ASP.NET V4.7',
          value: 'V4.7',
          platforms: {
            windows: {
              runtimeVersion: 'v4.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          },
        },
      ],
    },
    {
      displayText: 'ASP.NET V3',
      value: 'V3',
      minorVersions: [
        {
          displayText: 'ASP.NET V3.5',
          value: 'V3.5',
          platforms: {
            windows: {
              runtimeVersion: 'v2.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
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
