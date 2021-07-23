import { WebAppStack } from '../../models/WebAppStackModel';

// EOL source: https://docs.microsoft.com/en-us/java/azure/jdk/?view=azure-java-stable#supported-java-versions-and-update-schedule
const java11EOL = new Date(2026, 9).toString();
const java8EOL = new Date(2025, 3).toString();
const java7EOL = new Date(2023, 7).toString();

export const javaStack: WebAppStack = {
  displayText: 'Java',
  value: 'java',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'Java 11',
      value: '11',
      minorVersions: [
        {
          displayText: 'Java 11',
          value: '11.0',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '11',
              isAutoUpdate: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              endOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.6',
          value: '11.0.6',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '11.0.6',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              endOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.6',
          value: '11.0.6',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '11.0.6',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              endOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.9',
          value: '11.0.9',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '11.0.9',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              endOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.8',
          value: '11.0.8',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '11.0.8',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              endOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.7',
          value: '11.0.7',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '11.0.7',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              endOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.6',
          value: '11.0.6',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '11.0.6',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              endOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.5',
          value: '11.0.5',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '11.0.5',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              endOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.3',
          value: '11.0.3',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '11.0.3',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              endOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.2',
          value: '11.0.2',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '11.0.2',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              endOfLifeDate: java11EOL,
            },
          },
        },
      ],
    },
    {
      displayText: 'Java 8',
      value: '8',
      minorVersions: [
        {
          displayText: 'Java 8',
          value: '8.0',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8',
              isAutoUpdate: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_282',
          value: '8.0.282',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_282',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_265',
          value: '8.0.265',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_265',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_252',
          value: '8.0.252',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_252',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_242',
          value: '8.0.242',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_242',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_232',
          value: '8.0.232',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_232',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_212',
          value: '8.0.212',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_212',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_202',
          value: '8.0.202',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_202',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_181',
          value: '8.0.181',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_181',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_172',
          value: '8.0.172',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_172',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_144',
          value: '8.0.144',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_144',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_102',
          value: '8.0.102',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_102',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_92',
          value: '8.0.92',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8.0_92',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              endOfLifeDate: java8EOL,
            },
          },
        },
      ],
    },
  ],
};
