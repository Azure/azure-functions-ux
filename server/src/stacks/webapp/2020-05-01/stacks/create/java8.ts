import { WebAppCreateStack } from '../../stack.model';

export const java8CreateStack: WebAppCreateStack = {
  displayText: 'Java 8',
  value: 'Java-8',
  sortOrder: 6,
  versions: [
    {
      displayText: 'Tomcat 8.5',
      value: 'Tomcat8.5Auto',
      sortOrder: 3,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'TOMCAT|8.5-jre8',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '8',
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: '1.8|Tomcat|8.5',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '8',
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
          runtimeVersion: 'TOMCAT|9.0-jre8',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '8',
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: '1.8|Tomcat|9.0',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '8',
          },
        },
      ],
    },
    {
      displayText: 'JBoss EAP 7.2 (Preview)',
      value: 'jbosseap7.2',
      sortOrder: 1,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: true,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'JBOSSEAP|7.2-java8',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '8',
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
          runtimeVersion: 'JAVA|8-jre8',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '8',
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: '1.8|JAVA|8',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '8',
          },
        },
      ],
    },
  ],
};
