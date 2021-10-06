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
              },
              supportedFunctionsExtensionVersions: ['~4', '~3', '~2'],
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
              supportedFunctionsExtensionVersions: ['~4', '~3', '~2'],
            },
          },
        },
      ],
    },
  ],
};
