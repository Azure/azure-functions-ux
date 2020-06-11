import { WebAppConfigStack } from '../../../stack.model';

export const phpLinuxConfigStack: WebAppConfigStack = {
  id: null,
  name: 'php',
  type: 'Microsoft.Web/availableStacks?osTypeSelected=Linux',
  properties: {
    name: 'php',
    display: 'PHP',
    dependency: null,
    majorVersions: [
      {
        displayVersion: '5.6',
        runtimeVersion: 'PHP|5.6',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '5.6-apache',
            runtimeVersion: 'PHP|5.6',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
          {
            displayVersion: '5.6-apache-xdebug',
            runtimeVersion: 'PHP|5.6',
            isDefault: false,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: false,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
      {
        displayVersion: '7.0',
        runtimeVersion: 'PHP|7.0',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '7.0-apache',
            runtimeVersion: 'PHP|7.0',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
          {
            displayVersion: '7.0-apache-xdebug',
            runtimeVersion: 'PHP|7.0',
            isDefault: false,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: false,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
      {
        displayVersion: '7.2',
        runtimeVersion: 'PHP|7.2',
        isDefault: true,
        minorVersions: [
          {
            displayVersion: '7.2-apache',
            runtimeVersion: 'PHP|7.2',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
          {
            displayVersion: '7.2-apache-xdebug',
            runtimeVersion: 'PHP|7.2',
            isDefault: false,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: false,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
      {
        displayVersion: '7.3',
        runtimeVersion: 'PHP|7.3',
        isDefault: true,
        minorVersions: [
          {
            displayVersion: '7.3-apache',
            runtimeVersion: 'PHP|7.3',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
          {
            displayVersion: '7.3-apache-xdebug',
            runtimeVersion: 'PHP|7.3',
            isDefault: false,
            isRemoteDebuggingEnabled: false,
          },
          {
            displayVersion: '7.3-apache',
            runtimeVersion: 'PHP|7.3',
            isDefault: false,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: false,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
    ],
    frameworks: [],
    isDeprecated: null,
  },
};
