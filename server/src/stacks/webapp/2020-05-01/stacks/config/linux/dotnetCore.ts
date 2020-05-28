import { WebAppConfigStack } from '../../../stack.model';

export const dotnetCoreLinuxConfigStack: WebAppConfigStack = {
  id: null,
  name: 'dotnetcore',
  type: 'Microsoft.Web/availableStacks?osTypeSelected=Linux',
  properties: {
    name: 'dotnetcore',
    display: '.NET Core',
    dependency: null,
    majorVersions: [
      {
        displayVersion: '1.0',
        runtimeVersion: 'DOTNETCORE|1.0',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '1.0.14',
            runtimeVersion: 'DOTNETCORE|1.0',
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
        displayVersion: '1.1',
        runtimeVersion: 'DOTNETCORE|1.1',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '1.1.11',
            runtimeVersion: 'DOTNETCORE|1.1',
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
        displayVersion: '2.0',
        runtimeVersion: 'DOTNETCORE|2.0',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '2.0.9',
            runtimeVersion: 'DOTNETCORE|2.0',
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
        displayVersion: '2.1',
        runtimeVersion: 'DOTNETCORE|2.1',
        isDefault: true,
        minorVersions: [
          {
            displayVersion: '2.1.8',
            runtimeVersion: 'DOTNETCORE|2.1',
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
        displayVersion: '2.2',
        runtimeVersion: 'DOTNETCORE|2.2',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '2.2.2',
            runtimeVersion: 'DOTNETCORE|2.2',
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
        displayVersion: '3.0',
        runtimeVersion: 'DOTNETCORE|3.0',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: '3.0.0',
            runtimeVersion: 'DOTNETCORE|3.0',
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
        displayVersion: 'LTS',
        runtimeVersion: 'DOTNETCORE|LTS',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: 'LTS',
            runtimeVersion: 'DOTNETCORE|LTS',
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
        displayVersion: 'Latest',
        runtimeVersion: 'DOTNETCORE|Latest',
        isDefault: false,
        minorVersions: [
          {
            displayVersion: 'Latest',
            runtimeVersion: 'DOTNETCORE|LATEST',
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
