import { WebAppStack } from './../stack.model';

export const rubyWebAppStack: WebAppStack = {
  displayText: 'Ruby',
  value: 'Ruby',
  sortOrder: 5,
  majorVersions: [
    {
      displayText: 'Ruby 2.6',
      value: '2.6',
      sortOrder: 0,
      minorVersions: [
        {
          displayText: 'Ruby 2.6.2',
          value: '2.6.2',
          sortOrder: 0,
          platforms: [
            {
              os: 'linux',
              runtimeVersion: 'RUBY|2.6.2',
              sortOrder: 0,
              remoteDebuggingEnabled: false,
              viewModifiers: {
                isPreview: false,
                isDeprecated: false,
                isHidden: false,
              },
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          ],
        },
      ],
    },
    {
      displayText: 'Ruby 2.5',
      value: '2.5',
      sortOrder: 1,
      minorVersions: [
        {
          displayText: 'Ruby 2.5.5',
          value: '2.5.5',
          sortOrder: 0,
          platforms: [
            {
              os: 'linux',
              runtimeVersion: 'RUBY|2.5.5',
              sortOrder: 0,
              remoteDebuggingEnabled: false,
              viewModifiers: {
                isPreview: false,
                isDeprecated: false,
                isHidden: false,
              },
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          ],
        },
      ],
    },
    {
      displayText: 'Ruby 2.4',
      value: '2.4',
      sortOrder: 2,
      minorVersions: [
        {
          displayText: 'Ruby 2.4.5',
          value: '2.4.5',
          sortOrder: 0,
          platforms: [
            {
              os: 'linux',
              runtimeVersion: 'RUBY|2.4.5',
              sortOrder: 0,
              remoteDebuggingEnabled: false,
              viewModifiers: {
                isPreview: false,
                isDeprecated: true,
                isHidden: false,
              },
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          ],
        },
      ],
    },
    {
      displayText: 'Ruby 2.3',
      value: '2.3',
      sortOrder: 3,
      minorVersions: [
        {
          displayText: 'Ruby 2.3.8',
          value: '2.3.8',
          sortOrder: 0,
          platforms: [
            {
              os: 'linux',
              runtimeVersion: 'RUBY|2.3.8',
              sortOrder: 0,
              remoteDebuggingEnabled: false,
              viewModifiers: {
                isPreview: false,
                isDeprecated: true,
                isHidden: false,
              },
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          ],
        },
        {
          displayText: 'Ruby 2.3.3',
          value: '2.3.3',
          sortOrder: 1,
          platforms: [
            {
              os: 'linux',
              runtimeVersion: 'RUBY|2.3.3',
              sortOrder: 0,
              remoteDebuggingEnabled: false,
              viewModifiers: {
                isPreview: false,
                isDeprecated: true,
                isHidden: false,
              },
              appInsightsSettings: {
                isEnabled: false,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
            },
          ],
        },
      ],
    },
  ],
};
