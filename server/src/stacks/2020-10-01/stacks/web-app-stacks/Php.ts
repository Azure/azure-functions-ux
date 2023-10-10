import { WebAppStack } from '../../models/WebAppStackModel';
import { getDateString } from '../date-utilities';

const getPhpStack: (useIsoDateFormat: boolean) => WebAppStack = (useIsoDateFormat: boolean) => {
  const php8Point2EOL = getDateString(new Date(2025, 11, 8), useIsoDateFormat);
  const php8Point1EOL = getDateString(new Date(2023, 10, 26), useIsoDateFormat);
  const php8Point0EOL = getDateString(new Date(2023, 10, 26), useIsoDateFormat);
  const php7Point4EOL = getDateString(new Date(2022, 10, 30), useIsoDateFormat);
  const php7Point3EOL = getDateString(new Date(2021, 11, 6), useIsoDateFormat);
  const php7Point2EOL = getDateString(new Date(2020, 10, 30), useIsoDateFormat);
  const php7Point1EOL = getDateString(new Date(2020, 1, 1), useIsoDateFormat);
  const php7Point0EOL = getDateString(new Date(2020, 1, 1), useIsoDateFormat);
  const php5Point6EOL = getDateString(new Date(2021, 1, 1), useIsoDateFormat);

  return {
    displayText: 'PHP',
    value: 'php',
    preferredOs: 'linux',
    majorVersions: [
      {
        displayText: 'PHP 8',
        value: '8',
        minorVersions: [
          {
            displayText: 'PHP 8.2',
            value: '8.2',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'PHP|8.2',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '8.2',
                },
                endOfLifeDate: php8Point2EOL,
              },
            },
          },
          {
            displayText: 'PHP 8.1',
            value: '8.1',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'PHP|8.1',
                isHidden: false,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '8.1',
                },
                endOfLifeDate: php8Point1EOL,
              },
            },
          },
          {
            displayText: 'PHP 8.0',
            value: '8.0',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'PHP|8.0',
                isHidden: false,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '8.0',
                },
                endOfLifeDate: php8Point0EOL,
              },
            },
          },
        ],
      },
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
                  isSupported: true,
                  supportedVersion: '7.4',
                  notSupportedInCreates: true,
                },
                isDeprecated: true,
                endOfLifeDate: php7Point4EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'PHP|7.4',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '7.4',
                  notSupportedInCreates: true,
                },
                isDeprecated: true,
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
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '7.3',
                  notSupportedInCreates: true,
                },
                endOfLifeDate: php7Point3EOL,
              },
              windowsRuntimeSettings: {
                runtimeVersion: '7.3',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '7.3',
                  notSupportedInCreates: true,
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
                isDeprecated: true,
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
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: true,
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
};

export const phpStackNonIsoDates: WebAppStack = getPhpStack(false);

export const phpStack: WebAppStack = getPhpStack(true);
