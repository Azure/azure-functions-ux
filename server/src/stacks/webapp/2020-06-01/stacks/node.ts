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
      minorVersions: [],
    },
    {
      displayText: 'Node 9',
      value: '9',
      minorVersions: [],
    },
    {
      displayText: 'Node 8',
      value: '8',
      minorVersions: [],
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
