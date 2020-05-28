import { WebAppConfigStack } from '../../../stack.model';

export const rubyLinuxConfigStack: WebAppConfigStack = {
  id: null,
  name: 'ruby',
  type: 'Microsoft.Web/availableStacks?osTypeSelected=Linux',
  properties: {
    name: 'ruby',
    display: 'Ruby',
    dependency: null,
    majorVersions: [
      {
        displayVersion: '2.3',
        runtimeVersion: 'RUBY|2.3',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '2.3.3',
            runtimeVersion: 'RUBY|2.3.3',
            isDefault: false,
            isRemoteDebuggingEnabled: false,
          },
          {
            displayVersion: '2.3.8',
            runtimeVersion: 'RUBY|2.3.8',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: false,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
      {
        displayVersion: '2.4',
        runtimeVersion: 'RUBY|2.4',
        isDefault: true,
        minorVersions: [
          {
            displayVersion: '2.4.5',
            runtimeVersion: 'RUBY|2.4.5',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: false,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
      {
        displayVersion: '2.5',
        runtimeVersion: 'RUBY|2.5',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '2.5.5',
            runtimeVersion: 'RUBY|2.5.5',
            isDefault: true,
            isRemoteDebuggingEnabled: false,
          },
        ],
        applicationInsights: false,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
      {
        displayVersion: '2.6',
        runtimeVersion: 'RUBY|2.6',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '2.6.2',
            runtimeVersion: 'RUBY|2.6.2',
            isDefault: true,
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
