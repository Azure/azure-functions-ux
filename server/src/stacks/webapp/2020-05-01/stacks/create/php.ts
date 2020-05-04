import { WebAppCreateStack } from '../../stack.model';

export const phpCreateStack: WebAppCreateStack = {
  displayText: 'PHP',
  value: 'PHP',
  sortOrder: 3,
  versions: [
    {
      displayText: 'PHP 7.3',
      value: '7.3',
      sortOrder: 0,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'PHP|7.3',
          sortOrder: 0,
          githubActionSettings: {
            supported: false,
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: '7.3',
          sortOrder: 1,
          githubActionSettings: {
            supported: false,
          },
        },
      ],
    },
    {
      displayText: 'PHP 7.2',
      value: '7.2',
      sortOrder: 1,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'PHP|7.2',
          sortOrder: 0,
          githubActionSettings: {
            supported: false,
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: '7.2',
          sortOrder: 1,
          githubActionSettings: {
            supported: false,
          },
        },
      ],
    },
  ],
};
