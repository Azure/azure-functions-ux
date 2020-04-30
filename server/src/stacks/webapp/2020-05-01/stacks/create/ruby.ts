import { WebAppCreateStack } from '../../stack.model';

export const rubyCreateStack: WebAppCreateStack = {
  displayText: 'Ruby',
  value: 'Ruby',
  sortOrder: 5,
  versions: [
    {
      displayText: 'Ruby 2.6',
      value: '2.6',
      sortOrder: 0,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'RUBY|2.6',
          sortOrder: 0,
          githubActionSettings: {
            supported: false,
          },
        },
      ],
    },
    {
      displayText: 'Ruby 2.5',
      value: '2.5',
      sortOrder: 0,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'RUBY|2.5',
          sortOrder: 1,
          githubActionSettings: {
            supported: false,
          },
        },
      ],
    },
  ],
};
