import { WebAppCreateStack } from '../../stack.model';

export const aspDotnetCreateStack: WebAppCreateStack = {
  displayText: 'ASP.NET',
  value: 'ASP.NET',
  sortOrder: 0,
  versions: [
    {
      displayText: 'ASP.NET V4.7',
      value: 'V4.7',
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
            supported: false,
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
            supported: false,
          },
        },
      ],
    },
  ],
};
