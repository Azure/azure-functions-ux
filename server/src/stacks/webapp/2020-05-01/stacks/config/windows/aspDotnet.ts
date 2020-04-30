import { WebAppConfigStack } from '../../../stack.model';

export const aspDotnetWindowsConfigStack: WebAppConfigStack = {
  id: null,
  name: 'aspnet',
  type: 'Microsoft.Web/availableStacks?osTypeSelected=Windows',
  properties: {
    name: 'aspnet',
    display: 'ASP.NET',
    dependency: null,
    majorVersions: [
      {
        displayVersion: 'V4.7',
        runtimeVersion: 'v4.0',
        isDefault: true,
        minorVersions: [],
        applicationInsights: true,
        isPreview: false,
        isDeprecated: false,
        isHidden: false,
      },
      {
        displayVersion: 'V3.5',
        runtimeVersion: 'v2.0',
        isDefault: false,
        minorVersions: [],
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
