import { WebAppStack } from '../../models/WebAppStackModel';

const ruby2Point4EOL = new Date(2020, 4, 1).toString();
const ruby2Point3EOL = new Date(2019, 3, 31).toString();

export const rubyStack: WebAppStack = {
  displayText: 'Ruby',
  value: 'ruby',
  preferredOs: 'linux',
  majorVersions: [
    {
      displayText: 'Ruby 2',
      value: '2',
      minorVersions: [
        {
          displayText: 'Ruby 2.6',
          value: '2.6',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'RUBY|2.6',
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
          displayText: 'Ruby 2.6.2',
          value: '2.6.2',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'RUBY|2.6.2',
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
          displayText: 'Ruby 2.5',
          value: '2.5',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'RUBY|2.5',
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
          displayText: 'Ruby 2.5.5',
          value: '2.5.5',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'RUBY|2.5.5',
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
