import { WebAppStack, WebAppRuntimes } from './../stack.model';

export const aspDotnetStack: WebAppStack<WebAppRuntimes> = {
  displayText: 'ASP.NET',
  value: 'ASP.NET',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'ASP.NET V4',
      value: 'V4',
      minorVersions: [
        {
          displayText: 'ASP.NET V4.7',
          value: 'V4.7',
          stackSettings: {
            windowsRuntimeSettings: {
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
          stackSettings: {
            windowsRuntimeSettings: {
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
