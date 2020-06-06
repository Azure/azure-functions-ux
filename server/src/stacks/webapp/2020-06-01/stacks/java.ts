import { WebAppStack } from './../stack.model';

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
          displayText: 'Java 11.0.3 (Azul)',
          value: '11.0.3 (Azul)',
          platforms: {
            linux: {
              runtimeVersion: 'java11',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
            },
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
            },
          },
        },
        {
          displayText: 'Java 11.0.2 (Azul)',
          value: '11.0.2 (Azul)',
          platforms: {
            linux: {
              runtimeVersion: 'java11',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
            },
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
          displayText: 'Java 1.8.0_212 (Azul)',
          value: '1.8.0_212 (Azul)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_202 (Azul)',
          value: '1.8.0_202 (Azul)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_202 (Oracle)',
          value: '1.8.0_202 (Oracle)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_181 (Azul)',
          value: '1.8.0_181 (Azul)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_181 (Oracle)',
          value: '1.8.0_181 (Oracle)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_172 (Azul)',
          value: '1.8.0_172 (Azul)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_172 (Oracle)',
          value: '1.8.0_172 (Oracle)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_144 (Azul)',
          value: '1.8.0_144 (Azul)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_111 (Oracle)',
          value: '1.8.0_111 (Oracle)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_102 (Azul)',
          value: '1.8.0_102 (Azul)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_92 (Azul)',
          value: '1.8.0_92 (Azul)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_73 (Oracle)',
          value: '1.8.0_73 (Oracle)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_60 (Oracle)',
          value: '1.8.0_60 (Oracle)',
          platforms: {},
        },
        {
          displayText: 'Java 1.8.0_25 (Oracle)',
          value: '1.8.0_25 (Oracle)',
          platforms: {},
        },
      ],
    },
    {
      displayText: 'Java 7',
      value: '7',
      minorVersions: [
        {
          displayText: 'Java 1.7.0_222 (Azul)',
          value: '1.7.0_222  (Azul)',
          platforms: {},
        },
        {
          displayText: 'Java 1.7.0_191 (Azul)',
          value: '1.7.0_191  (Azul)',
          platforms: {},
        },
        {
          displayText: 'Java 1.7.0_80 (Oracle)',
          value: '1.7.0_80 (Oracle)',
          platforms: {},
        },
        {
          displayText: 'Java 1.7.0_71 (Oracle)',
          value: '1.7.0_71 (Oracle)',
          platforms: {},
        },
        {
          displayText: 'Java 1.7.0_51 (Oracle)',
          value: '1.7.0_51 (Oracle)',
          platforms: {},
        },
      ],
    },
  ],
};
