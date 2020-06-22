import { FunctionAppStack } from '../stack.model';

export const dotnetCoreStack: FunctionAppStack = {
  displayText: '.NET Core',
  value: 'dotnet',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: '.Net Core 3',
      value: '3',
      minorVersions: [
        {
          displayText: '.NET Core 3.1 (LTS)',
          value: '3.1',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '2.2',
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: true,
              gitHubActionSettings: {
                isSupported: false,
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {},
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'dotnet|3.1',
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: true,
              gitHubActionSettings: {
                isSupported: false,
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                Use32BitWorkerProcess: false,
                linuxFxVersion: 'dotnet|3.1',
              },
            },
          },
        },
      ],
    },
  ],
};
