import { WebAppConfigStack } from '../../../stack.model';

export const java11LinuxConfigStack: WebAppConfigStack = {
  id: null,
  name: 'java11',
  type: 'Microsoft.Web/availableStacks?osTypeSelected=Linux',
  properties: {
    name: 'java11',
    display: 'Java 11',
    dependency: null,
    majorVersions: [
      {
        displayVersion: 'Tomcat 8.5',
        runtimeVersion: 'TOMCAT|8.5-java11',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '8.5',
            runtimeVersion: 'TOMCAT|8.5-java11',
            isDefault: true,
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
        runtimeVersion: 'TOMCAT|9.0-java11',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '9.0',
            runtimeVersion: 'TOMCAT|9.0-java11',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: true,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
      {
        displayVersion: 'Java SE',
        runtimeVersion: 'JAVA|11-java11',
        isDefault: true,
        minorVersions: [
          {
            displayVersion: '11',
            runtimeVersion: 'JAVA|11-java11',
            isDefault: true,
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
