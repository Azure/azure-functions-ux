import { WebAppStack } from './../stack.model';

export const rubyWebAppStack: WebAppStack = {
  displayText: 'Ruby',
  value: 'Ruby',
  sortOrder: 5,
  preferredOs: 'linux',
  majorVersions: [
    {
      displayText: 'Ruby 2.6',
      value: '2.6',
      minorVersions: [
        {
          displayText: 'Ruby 2.6.X',
          value: '2.6.X',
          platforms: {
            linux: {
              runtimeVersion: 'RUBY|2.6',
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
          },
        },
        {
          displayText: 'Ruby 2.6.2',
          value: '2.6.2',
          platforms: {
            linux: {
              runtimeVersion: 'RUBY|2.6.2',
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
          },
        },
      ],
    },
    {
      displayText: 'Ruby 2.5',
      value: '2.5',
      minorVersions: [
        {
          displayText: 'Ruby 2.5.X',
          value: '2.5.X',
          platforms: {
            linux: {
              runtimeVersion: 'RUBY|2.5',
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
          },
        },
        {
          displayText: 'Ruby 2.5.5',
          value: '2.5.5',
          platforms: {
            linux: {
              runtimeVersion: 'RUBY|2.5.5',
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
          },
        },
      ],
    },
    {
      displayText: 'Ruby 2.4',
      value: '2.4',
      minorVersions: [
        {
          displayText: 'Ruby 2.4.X',
          value: '2.4.X',
          platforms: {
            linux: {
              runtimeVersion: 'RUBY|2.4',
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
          },
        },
        {
          displayText: 'Ruby 2.4.5',
          value: '2.4.5',
          platforms: {
            linux: {
              runtimeVersion: 'RUBY|2.4.5',
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
          },
        },
      ],
    },
    {
      displayText: 'Ruby 2.3',
      value: '2.3',
      minorVersions: [
        {
          displayText: 'Ruby 2.3.X',
          value: '2.3.X',
          platforms: {
            linux: {
              runtimeVersion: 'RUBY|2.3',
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
          },
        },
        {
          displayText: 'Ruby 2.3.8',
          value: '2.3.8',
          platforms: {
            linux: {
              runtimeVersion: 'RUBY|2.3.8',
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
          },
        },
        {
          displayText: 'Ruby 2.3.3',
          value: '2.3.3',
          platforms: {
            linux: {
              runtimeVersion: 'RUBY|2.3.3',
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
          },
        },
      ],
    },
  ],
};
