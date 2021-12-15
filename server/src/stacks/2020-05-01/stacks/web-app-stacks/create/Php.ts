import { WebAppCreateStack } from '../../../models/WebAppStackModel';

export const phpCreateStack: WebAppCreateStack = {
  displayText: 'PHP',
  value: 'PHP',
  sortOrder: 3,
  versions: [
    {
      displayText: 'PHP 8',
      value: '8',
      sortOrder: 0,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'PHP|8.0',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '8.0',
            notSupportedInCreates: true,
          },
        },
      ],
    },
    {
      displayText: 'PHP 7.4',
      value: '7.4',
      sortOrder: 1,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'PHP|7.4',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '7.4',
            notSupportedInCreates: true,
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: '7.4',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '7.4',
            notSupportedInCreates: true,
          },
        },
      ],
    },
    {
      displayText: 'PHP 7.3',
      value: '7.3',
      sortOrder: 2,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: true,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'PHP|7.3',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '7.3',
            notSupportedInCreates: true,
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: true,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: '7.3',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '7.3',
            notSupportedInCreates: true,
          },
        },
      ],
    },
    {
      displayText: 'PHP 7.2',
      value: '7.2',
      sortOrder: 3,
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
