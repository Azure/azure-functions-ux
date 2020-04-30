import { WebAppCreateStack } from '../../stack.model';

export const java11CreateStack: WebAppCreateStack = {
  displayText: 'Java 11',
  value: 'Java-11',
  sortOrder: 7,
  versions: [
    {
      displayText: 'Tomcat 8.5',
      value: 'Tomcat8.5Auto',
      sortOrder: 1,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'TOMCAT|8.5-java11',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '11',
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: '11|Tomcat|8.5',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '11',
          },
        },
      ],
    },
    {
      displayText: 'Tomcat 9.0',
      value: 'Tomcat9.0Auto',
      sortOrder: 2,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'TOMCAT|9.0-java11',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '11',
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: '11|Tomcat|9.0',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '11',
          },
        },
      ],
    },
    {
      displayText: 'Java SE',
      value: 'JavaSEAuto',
      sortOrder: 0,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'JAVA|11-java11',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '11',
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: '11|JAVA|SE',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '11',
          },
        },
      ],
    },
  ],
};
