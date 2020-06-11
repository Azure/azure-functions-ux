import { WebAppConfigStack } from '../../../stack.model';

export const java8LinuxConfigStack: WebAppConfigStack = {
  id: null,
  name: 'java8',
  type: 'Microsoft.Web/availableStacks?osTypeSelected=Linux',
  properties: {
    name: 'java8',
    display: 'Java 8',
    dependency: null,
    majorVersions: [
      {
        displayVersion: 'Tomcat 8.5',
        runtimeVersion: 'TOMCAT|8.5-jre8',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '8.5 (Auto-Update)',
            runtimeVersion: 'TOMCAT|8.5-jre8',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
          {
            displayVersion: '8.5.41',
            runtimeVersion: 'TOMCAT|8.5.41-java8',
            isDefault: false,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: true,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
      {
        displayVersion: 'Tomcat 9.0',
        runtimeVersion: 'TOMCAT|9.0-jre8',
        isDefault: true,
        minorVersions: [
          {
            displayVersion: '9.0 (Auto-Update)',
            runtimeVersion: 'TOMCAT|9.0-jre8',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
          {
            displayVersion: '9.0.20',
            runtimeVersion: 'TOMCAT|9.0.20-java8',
            isDefault: false,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: true,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
      {
        displayVersion: 'Java SE 8',
        runtimeVersion: 'JAVA|8-jre8',
        isDefault: true,
        minorVersions: [
          {
            displayVersion: '8 (Auto-Update)',
            runtimeVersion: 'JAVA|8-jre8',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
          {
            displayVersion: '8u232',
            runtimeVersion: 'JAVA|8u232',
            isDefault: false,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: true,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
      {
        displayVersion: 'WildFly 14 - Preview',
        runtimeVersion: 'WILDFLY|14-jre8',
        isDefault: true,
        minorVersions: [
          {
            displayVersion: '14 (Auto-Update)',
            runtimeVersion: 'WILDFLY|14-jre8',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
          {
            displayVersion: '14.0.1',
            runtimeVersion: 'WILDFLY|14.0.1-java8',
            isDefault: false,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: true,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
    ],
    frameworks: [],
    isDeprecated: null,
  },
};
