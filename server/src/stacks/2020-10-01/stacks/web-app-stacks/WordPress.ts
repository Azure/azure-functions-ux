import { WebAppStack } from '../../models/WebAppStackModel';
import { getDateString } from '../date-utilities';

const getWordPressStack: (useIsoDateFormat: boolean) => WebAppStack = (useIsoDateFormat: boolean) => {
  const php8Point3EOL = getDateString(new Date('2026/11/23'), useIsoDateFormat);
  const php8Point2EOL = getDateString(new Date('2025/12/08'), useIsoDateFormat);
  const php8Point0EOL = getDateString(new Date('2023/11/26'), useIsoDateFormat);

  return {
    displayText: 'WordPress',
    value: 'wordpress',
    preferredOs: 'linux',
    majorVersions: [
      {
        displayText: 'PHP 8',
        value: '8',
        minorVersions: [
          {
            displayText: 'PHP 8.3',
            value: '8.3',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'WORDPRESS|8.3',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '8.3',
                },
                supportedFeatures: {
                  disableSsh: false,
                },
                endOfLifeDate: php8Point3EOL,
              },
            },
          },
          {
            displayText: 'PHP 8.2',
            value: '8.2',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'WORDPRESS|8.2',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '8.2',
                },
                supportedFeatures: {
                  disableSsh: false,
                },
                endOfLifeDate: php8Point2EOL,
              },
            },
          },
          {
            displayText: 'PHP 8.0',
            value: '8.0',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'WORDPRESS|8.0',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '8.0',
                },
                supportedFeatures: {
                  disableSsh: false,
                },
                endOfLifeDate: php8Point0EOL,
              },
            },
          },
        ],
      },
    ],
  };
};

export const wordpressStackNonIsoDates: WebAppStack = getWordPressStack(false);
export const wordpressStack: WebAppStack = getWordPressStack(true);
