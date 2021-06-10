import { WebAppStack } from '../../models/WebAppStackModel';

const php7Point4EOL = new Date(2022, 11, 28).toString();
const php7Point3EOL = new Date(2021, 12, 6).toString();
const php7Point2EOL = new Date(2020, 11, 30).toString();
const php7Point1EOL = new Date(2020, 2, 1).toString();
const php7Point0EOL = new Date(2020, 2, 1).toString();
const php5Point6EOL = new Date(2021, 2, 1).toString();

export const phpStack: WebAppStack = {
  displayText: 'PHP',
  value: 'php',
  preferredOs: 'linux',
  majorVersions: [
    {
      displayText: 'PHP 7',
      value: '7',
      minorVersions: [
        {
          displayText: 'PHP 7.4',
          value: '7.4',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '7.4',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: php7Point4EOL,
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'PHP|7.4',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: php7Point4EOL,
            },
          },
        },
        {
          displayText: 'PHP 7.3',
          value: '7.3',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'PHP|7.3',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: php7Point3EOL,
            },
            windowsRuntimeSettings: {
              runtimeVersion: '7.3',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: php7Point3EOL,
            },
          },
        },
        {
          displayText: 'PHP 7.2',
          value: '7.2',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'PHP|7.2',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: php7Point2EOL,
            },
            windowsRuntimeSettings: {
              runtimeVersion: '7.2',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: php7Point2EOL,
            },
          },
        },
        {
          displayText: 'PHP 7.1',
          value: '7.1',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '7.1',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: php7Point1EOL,
            },
          },
        },
        {
          displayText: '7.0',
          value: '7.0',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'PHP|7.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: php7Point0EOL,
            },
            windowsRuntimeSettings: {
              runtimeVersion: '7.0',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: php7Point0EOL,
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
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'PHP|5.6',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: php5Point6EOL,
            },
            windowsRuntimeSettings: {
              runtimeVersion: '5.6',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              endOfLifeDate: php5Point6EOL,
            },
          },
        },
      ],
    },
  ],
};
