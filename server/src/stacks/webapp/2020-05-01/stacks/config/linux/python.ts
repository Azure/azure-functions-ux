import { WebAppConfigStack } from '../../../stack.model';

export const pythonLinuxConfigStack: WebAppConfigStack = {
  id: null,
  name: 'python',
  type: 'Microsoft.Web/availableStacks?osTypeSelected=Linux',
  properties: {
    name: 'python',
    display: 'Python',
    dependency: null,
    majorVersions: [
      {
        displayVersion: '3.8',
        runtimeVersion: 'PYTHON|3.8',
        isDefault: true,
        minorVersions: [
          {
            displayVersion: '3.8',
            runtimeVersion: 'PYTHON|3.8',
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
        displayVersion: '3.7',
        runtimeVersion: 'PYTHON|3.7',
        isDefault: true,
        minorVersions: [
          {
            displayVersion: '3.7',
            runtimeVersion: 'PYTHON|3.7',
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
        runtimeVersion: 'PYTHON|3.6',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '3.6',
            runtimeVersion: 'PYTHON|3.6',
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
        displayVersion: '2.7',
        runtimeVersion: 'PYTHON|2.7',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '2.7',
            runtimeVersion: 'PYTHON|2.7',
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
