import { FunctionAppStack } from '../../models/FunctionAppStackModel';

export const customStack: FunctionAppStack = {
  displayText: 'Custom Handler',
  value: 'custom',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'Custom Handler',
      value: 'custom',
      minorVersions: [
        {
          displayText: 'Custom Handler',
          value: 'custom',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'custom',
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: false,
              gitHubActionSettings: {
                isSupported: false,
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'custom',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
                netFrameworkVersion: 'v6.0',
              },
              supportedFunctionsExtensionVersions: [
                {
                  version: '~4',
                  isDeprecated: false,
                  isDefault: true,
                },
                {
                  version: '~3',
                  isDeprecated: true,
                  isDefault: false,
                },
                {
                  version: '~2',
                  isDeprecated: true,
                  isDefault: false,
                }
              ],
            },
            linuxRuntimeSettings: {
              runtimeVersion: '',
              isPreview: false,
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: false,
              gitHubActionSettings: {
                isSupported: false,
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'custom',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: false,
                linuxFxVersion: '',
              },
              supportedFunctionsExtensionVersions: [
                {
                  version: '~4',
                  isDeprecated: false,
                  isDefault: true,
                },
                {
                  version: '~3',
                  isDeprecated: true,
                  isDefault: false,
                },
                {
                  version: '~2',
                  isDeprecated: true,
                  isDefault: false,
                }
              ],
            },
          },
        },
      ],
    },
  ],
};
