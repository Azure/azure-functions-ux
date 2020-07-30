import { FunctionAppStack } from '../stack.model';

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
          displayText: 'Custom',
          value: 'custom',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'custom',
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: false,
              gitHubActionSettings: {
                isSupported: false
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
              runtimeVersion: null,
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
                use32BitWorkerProcess: false
              },
              supportedFunctionsExtensionVersions: ['~3', '~2'],
            },
          },
        },
      ],
    }
  ],
};
