import { WebAppCreateStack } from '../../stack.model';

export const pythonCreateStack: WebAppCreateStack = {
  displayText: 'Python',
  value: 'Python',
  sortOrder: 2,
  versions: [
    {
      displayText: 'Python 3.8',
      value: '3.8',
      sortOrder: 0,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'PYTHON|3.8',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
          },
        },
      ],
    },
    {
      displayText: 'Python 3.7',
      value: '3.7',
      sortOrder: 1,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'PYTHON|3.7',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
          },
        },
      ],
    },
    {
      displayText: 'Python 3.6',
      value: '3.6',
      sortOrder: 2,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: false,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'PYTHON|3.6',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: '3.4',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '3.6',
          },
        },
      ],
    },
  ],
};
