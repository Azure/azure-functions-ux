import { WebAppStack } from './../stack.model';

const php7Point2EOL = new Date(2020, 11, 30);
const php7Point3EOL = new Date(2021, 11, 28);

export const phpStack: WebAppStack = {
  displayText: 'PHP',
  value: 'PHP',
  sortOrder: 3,
  preferredOs: 'linux',
  majorVersions: [
    {
      displayText: 'PHP 7',
      value: '7',
      minorVersions: [
        {
          displayText: 'PHP 7.3',
          value: '7.3',
          platforms: {
            linux: {
              runtimeVersion: 'PHP|7.3',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              projectedEndOfLifeDate: php7Point3EOL,
            },
            windows: {
              runtimeVersion: '7.3',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              projectedEndOfLifeDate: php7Point3EOL,
            },
          },
        },
        {
          displayText: 'PHP 7.2',
          value: '7.2',
          platforms: {
            linux: {
              runtimeVersion: 'PHP|7.2',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              projectedEndOfLifeDate: php7Point2EOL,
            },
            windows: {
              runtimeVersion: '7.2',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              projectedEndOfLifeDate: php7Point2EOL,
            },
          },
        },
        {
          displayText: 'PHP 7.1',
          value: '7.1',
          platforms: {
            windows: {
              runtimeVersion: '7.1',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          },
        },
        {
          displayText: '7.0',
          value: '7.0',
          platforms: {
            linux: {
              runtimeVersion: 'PHP|7.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
            windows: {
              runtimeVersion: '7.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
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
      displayText: 'PHP 5',
      value: '5',
      minorVersions: [
        {
          displayText: 'PHP 5.6',
          value: '5.6',
          platforms: {
            linux: {
              runtimeVersion: 'PHP|5.6',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
            windows: {
              runtimeVersion: '5.6',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
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
