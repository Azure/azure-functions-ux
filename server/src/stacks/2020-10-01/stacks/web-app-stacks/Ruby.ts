import { WebAppStack } from '../../models/WebAppStackModel';
import { getDateString } from '../date-utilities';

const getRubyStack: (useIsoDateFormat: boolean) => WebAppStack = (useIsoDateFormat: boolean) => {
  const ruby2Point7EOL = getDateString(new Date(2023, 2, 31), useIsoDateFormat);
  const ruby2Point6EOL = getDateString(new Date(2022, 2, 31), useIsoDateFormat);
  const ruby2Point5EOL = getDateString(new Date(2021, 2, 31), useIsoDateFormat);
  const ruby2Point4EOL = getDateString(new Date(2020, 3, 1), useIsoDateFormat);
  const ruby2Point3EOL = getDateString(new Date(2019, 2, 31), useIsoDateFormat);

  return {
    displayText: 'Ruby',
    value: 'ruby',
    preferredOs: 'linux',
    majorVersions: [
      {
        displayText: 'Ruby 2',
        value: '2',
        minorVersions: [
          {
            displayText: 'Ruby 2.7',
            value: '2.7',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'RUBY|2.7',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                endOfLifeDate: ruby2Point7EOL,
              },
            },
          },
          {
            displayText: 'Ruby 2.7.3',
            value: '2.7.3',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'RUBY|2.7.3',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                isHidden: true,
                endOfLifeDate: ruby2Point7EOL,
              },
            },
          },
          {
            displayText: 'Ruby 2.6',
            value: '2.6',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'RUBY|2.6',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                endOfLifeDate: ruby2Point6EOL,
              },
            },
          },
          {
            displayText: 'Ruby 2.6.2',
            value: '2.6.2',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'RUBY|2.6.2',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                endOfLifeDate: ruby2Point6EOL,
              },
            },
          },
          {
            displayText: 'Ruby 2.5',
            value: '2.5',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'RUBY|2.5',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                endOfLifeDate: ruby2Point5EOL,
              },
            },
          },
          {
            displayText: 'Ruby 2.5.5',
            value: '2.5.5',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'RUBY|2.5.5',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                endOfLifeDate: ruby2Point5EOL,
              },
            },
          },
          {
            displayText: 'Ruby 2.4',
            value: '2.4',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'RUBY|2.4',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                endOfLifeDate: ruby2Point4EOL,
              },
            },
          },
          {
            displayText: 'Ruby 2.4.5',
            value: '2.4.5',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'RUBY|2.4.5',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                endOfLifeDate: ruby2Point4EOL,
              },
            },
          },
          {
            displayText: 'Ruby 2.3',
            value: '2.3',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'RUBY|2.3',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                endOfLifeDate: ruby2Point3EOL,
              },
            },
          },
          {
            displayText: 'Ruby 2.3.8',
            value: '2.3.8',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'RUBY|2.3.8',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                endOfLifeDate: ruby2Point3EOL,
              },
            },
          },
          {
            displayText: 'Ruby 2.3.3',
            value: '2.3.3',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'RUBY|2.3.3',
                remoteDebuggingSupported: false,
                isDeprecated: true,
                appInsightsSettings: {
                  isSupported: false,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                endOfLifeDate: ruby2Point3EOL,
              },
            },
          },
        ],
      },
    ],
  };
};

export const rubyStackNonIsoDates: WebAppStack = getRubyStack(false);

export const rubyStack: WebAppStack = getRubyStack(true);
