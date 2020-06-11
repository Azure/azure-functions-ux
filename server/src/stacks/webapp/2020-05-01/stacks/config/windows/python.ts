import { WebAppConfigStack } from '../../../stack.model';

export const pythonWindowsConfigStack: WebAppConfigStack = {
  id: null,
  name: 'python',
  type: 'Microsoft.Web/availableStacks?osTypeSelected=Windows',
  properties: {
    name: 'python',
    display: 'Python',
    dependency: null,
    majorVersions: [
      {
        displayVersion: '2.7',
        runtimeVersion: '2.7',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '2.7',
            runtimeVersion: '2.7.3',
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
        displayVersion: '3.6',
        runtimeVersion: '3.4',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '3.6',
            runtimeVersion: '3.4.0',
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
