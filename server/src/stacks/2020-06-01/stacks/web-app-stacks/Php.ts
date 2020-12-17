import { WebAppStack } from '../../models/WebAppStackModel';

const php7Point3EOL = new Date(2021, 11, 28).toString();
const php7Point2EOL = new Date(2020, 11, 30).toString();
const php7Point1EOL = new Date(2020, 2, 1).toString();
const php7Point0EOL = new Date(2020, 2, 1).toString();
const php5Point6EOL = new Date(2021, 2, 1).toString();

export const phpStack: WebAppStack = {
  displayText: 'PHP',
  value: 'php',
  preferredOs: 'windows',
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
            },
          },
        },
        {
          displayText: 'PHP 7.3',
          value: '7.3',
          stackSettings: {
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
      ],
    },
  ],
};
