import { WebAppStack } from './../stack.model';

// EOL source: https://docs.microsoft.com/en-us/java/azure/jdk/?view=azure-java-stable#supported-java-versions-and-update-schedule
const java7EOL = new Date(2023, 7);
const java8EOL = new Date(2025, 3);
const java11EOL = new Date(2026, 9);

export const javaStack: WebAppStack = {
  displayText: 'Java',
  value: 'Java',
  sortOrder: 6,
  preferredOs: 'linux',
  majorVersions: [
    {
      displayText: 'Java 11',
      value: '11',
      minorVersions: [
        {
          displayText: 'Java 11 (Auto-Update)',
          value: '11.0',
          platforms: {
            linux: {
              runtimeVersion: undefined,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              projectedEndOfLifeDate: java11EOL,
            },
            windows: {
              runtimeVersion: '11',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              projectedEndOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.5 (Azul)',
          value: '11.0.5 (Azul)',
          platforms: {
            linux: {
              runtimeVersion: undefined,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              projectedEndOfLifeDate: java11EOL,
            },
            windows: {
              runtimeVersion: '11.0.5_ZULU',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              projectedEndOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.3 (Azul)',
          value: '11.0.3 (Azul)',
          platforms: {
            windows: {
              runtimeVersion: '11.0.3_ZULU',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              projectedEndOfLifeDate: java11EOL,
            },
          },
        },
        {
          displayText: 'Java 11.0.2 (Azul)',
          value: '11.0.2 (Azul)',
          platforms: {
            windows: {
              runtimeVersion: '11.0.2_ZULU',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              projectedEndOfLifeDate: java11EOL,
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
          displayText: 'Java 8 (Auto-Update)',
          value: '1.8.0',
          platforms: {
            linux: {
              runtimeVersion: undefined,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              projectedEndOfLifeDate: java8EOL,
            },
            windows: {
              runtimeVersion: '1.8',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              projectedEndOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_232 (Azul)',
          value: '1.8.0_232 (Azul)',
          platforms: {
            linux: {
              runtimeVersion: undefined,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              projectedEndOfLifeDate: java8EOL,
            },
            windows: {
              runtimeVersion: '1.8.0_232_ZULU',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              projectedEndOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_212 (Azul)',
          value: '1.8.0_212 (Azul)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_212_ZULU',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              projectedEndOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_202 (Azul)',
          value: '1.8.0_202 (Azul)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_202_ZULU',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              projectedEndOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_202 (Oracle)',
          value: '1.8.0_202 (Oracle)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_202',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
            },
          },
        },
        {
          displayText: 'Java 1.8.0_181 (Azul)',
          value: '1.8.0_181 (Azul)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_181_ZULU',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              projectedEndOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_181 (Oracle)',
          value: '1.8.0_181 (Oracle)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_181',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
            },
          },
        },
        {
          displayText: 'Java 1.8.0_172 (Azul)',
          value: '1.8.0_172 (Azul)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_172_ZULU',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              projectedEndOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_172 (Oracle)',
          value: '1.8.0_172 (Oracle)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_172',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
            },
          },
        },
        {
          displayText: 'Java 1.8.0_144 (Azul)',
          value: '1.8.0_144 (Azul)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_144', // NOTE (allisonm): Azul 8 runtimes versions here and lower omit the suffix: _ZULU
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              projectedEndOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_111 (Oracle)',
          value: '1.8.0_111 (Oracle)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_111',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
            },
          },
        },
        {
          displayText: 'Java 1.8.0_102 (Azul)',
          value: '1.8.0_102 (Azul)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_102',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              projectedEndOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_92 (Azul)',
          value: '1.8.0_92 (Azul)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_92',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              projectedEndOfLifeDate: java8EOL,
            },
          },
        },
        {
          displayText: 'Java 1.8.0_73 (Oracle)',
          value: '1.8.0_73 (Oracle)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_73',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
            },
          },
        },
        {
          displayText: 'Java 1.8.0_60 (Oracle)',
          value: '1.8.0_60 (Oracle)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_60',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
            },
          },
        },
        {
          displayText: 'Java 1.8.0_25 (Oracle)',
          value: '1.8.0_25 (Oracle)',
          platforms: {
            windows: {
              runtimeVersion: '1.8.0_65',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
            },
          },
        },
      ],
    },
    {
      displayText: 'Java 7',
      value: '7',
      minorVersions: [
        {
          displayText: 'Java 1.7.0 (Auto-Update)',
          value: '1.7.0',
          platforms: {
            windows: {
              runtimeVersion: '1.7',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              projectedEndOfLifeDate: java7EOL,
            },
          },
        },
        {
          displayText: 'Java 1.7.0_222 (Azul)',
          value: '1.7.0_222 (Azul)',
          platforms: {
            windows: {
              runtimeVersion: '1.7.0_222_ZULU',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              projectedEndOfLifeDate: java7EOL,
            },
          },
        },
        {
          displayText: 'Java 1.7.0_191 (Azul)',
          value: '1.7.0_191  (Azul)',
          platforms: {
            windows: {
              runtimeVersion: '1.7.0_191_ZULU',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              projectedEndOfLifeDate: java7EOL,
            },
          },
        },
        {
          displayText: 'Java 1.7.0_80 (Oracle)',
          value: '1.7.0_80 (Oracle)',
          platforms: {
            windows: {
              runtimeVersion: '1.7.0_80',
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
          displayText: 'Java 1.7.0_71 (Oracle)',
          value: '1.7.0_71 (Oracle)',
          platforms: {
            windows: {
              runtimeVersion: '1.7.0_71',
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
          displayText: 'Java 1.7.0_51 (Oracle)',
          value: '1.7.0_51 (Oracle)',
          platforms: {
            windows: {
              runtimeVersion: '1.7.0_51',
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
