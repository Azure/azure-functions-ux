import { FunctionAppStack } from '../../models/FunctionAppStackModel';

export const customStack: FunctionAppStack = {
  displayText: 'Custom',
  value: 'custom',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'Custom',
      value: 'custom',
      minorVersions: [
        {
          displayText: 'Custom Handler',
          value: 'custom',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'custom',
              isPreview: true,
              isHidden: true,
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
              supportedFunctionsExtensionVersions: ['~3', '~2'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: '',
              isPreview: true,
              isHidden: true,
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
              supportedFunctionsExtensionVersions: ['~3', '~2'],
            },
          },
        },
      ],
    },
  ],
};
