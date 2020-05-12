import { WebAppCreateStack } from '../../stack.model';

export const dotnetCoreCreateStack: WebAppCreateStack = {
  displayText: '.NET Core',
  value: 'DOTNETCORE',
  sortOrder: 4,
  versions: [
    {
      displayText: '.NET Core 3.1 (LTS)',
      value: 'DotnetCore3.1',
      sortOrder: 0,
      supportedPlatforms: [
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: '3.1',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '3.1.102',
          },
        },
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'DOTNETCORE|3.1',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '3.1.102',
          },
        },
      ],
    },
    {
      displayText: '.NET Core 2.1 (LTS)',
      value: 'DotnetCore2.1',
      sortOrder: 2,
      supportedPlatforms: [
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: '2.1',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '2.1.804',
          },
        },
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'DOTNETCORE|2.1',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '2.1.804',
          },
        },
      ],
    },
  ],
};
