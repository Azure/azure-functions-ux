import { WebAppCreateStack } from '../../../models/WebAppStackModel';

export const aspDotnetCreateStack: WebAppCreateStack = {
  displayText: '.NET',
  value: 'ASP.NET',
  sortOrder: 0,
  versions: [
    {
      displayText: '.NET 5',
      value: '5',
      sortOrder: 0,
      supportedPlatforms: [
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'v5.0',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '5.0.x',
          },
        },
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'DOTNETCORE|5.0',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '5.0.x',
          },
        },
      ],
    },
    {
      displayText: 'ASP.NET V4.8',
      value: 'V4.8',
      sortOrder: 0,
      supportedPlatforms: [
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'v4.0',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '3.1',
          },
        },
      ],
    },
    {
      displayText: 'ASP.NET V3.5',
      value: 'V3.5',
      sortOrder: 1,
      supportedPlatforms: [
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'v2.0',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '2.1',
          },
        },
      ],
    },
  ],
};
