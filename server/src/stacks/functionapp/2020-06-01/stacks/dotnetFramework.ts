import { FunctionAppStack } from '../stack.model';

export const dotnetFrameworkStack: FunctionAppStack = {
  displayText: '.NET Framework',
  value: 'dotnetFramework',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: '.NET Framework 4',
      value: '2',
      minorVersions: [
        {
          displayText: '.NET Framework 4.7',
          value: '4.7',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '4.7',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              appSettingsDictionary: {},
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
              },
              supportedFunctionsExtensionVersions: ['~1'],
            },
          },
        },
      ],
    },
  ],
};
