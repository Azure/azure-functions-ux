import { FunctionAppStack } from '../../models/FunctionAppStackModel';
import { getDateString } from '../date-utilities';

const getPythonStack: (useIsoDateFormat: boolean) => FunctionAppStack = (useIsoDateFormat: boolean) => {
  const python36EOL = getDateString(new Date(2022, 8, 30), useIsoDateFormat);
  const python37EOL = getDateString(new Date(2023, 5, 30), useIsoDateFormat);
  const python38EOL = getDateString(new Date(2024, 9, 31), useIsoDateFormat);
  const python39EOL = getDateString(new Date(2025, 9, 31), useIsoDateFormat);
  const python310EOL = getDateString(new Date(2026, 9, 31), useIsoDateFormat);
  const python311EOL = getDateString(new Date(2027, 9, 31), useIsoDateFormat);

  return {
    displayText: 'Python',
    value: 'python',
    preferredOs: 'linux',
    majorVersions: [
      {
        displayText: 'Python 3',
        value: '3',
        minorVersions: [
          {
            displayText: 'Python 3.11',
            value: '3.11',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'Python|3.11',
                remoteDebuggingSupported: false,
                isPreview: true,
                isDefault: false,
                isHidden: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '3.11',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'python',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Python|3.11',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: python311EOL,
              },
            },
          },
          {
            displayText: 'Python 3.10',
            value: '3.10',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'Python|3.10',
                remoteDebuggingSupported: false,
                isPreview: false,
                isDefault: true,
                isHidden: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '3.10',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'python',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Python|3.10',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: python310EOL,
              },
            },
          },
          {
            displayText: 'Python 3.9',
            value: '3.9',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'Python|3.9',
                remoteDebuggingSupported: false,
                isPreview: false,
                isDefault: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '3.9',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'python',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Python|3.9',
                },
                supportedFunctionsExtensionVersions: ['~4', '~3'],
                endOfLifeDate: python39EOL,
              },
            },
          },
          {
            displayText: 'Python 3.8',
            value: '3.8',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'Python|3.8',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '3.8',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'python',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Python|3.8',
                },
                supportedFunctionsExtensionVersions: ['~4', '~3'],
                endOfLifeDate: python38EOL,
              },
            },
          },
          {
            displayText: 'Python 3.7',
            value: '3.7',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'Python|3.7',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '3.7',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'python',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Python|3.7',
                },
                supportedFunctionsExtensionVersions: ['~4', '~3', '~2'],
                endOfLifeDate: python37EOL,
              },
            },
          },
          {
            displayText: 'Python 3.6',
            value: '3.6',
            stackSettings: {
              linuxRuntimeSettings: {
                runtimeVersion: 'Python|3.6',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '3.6',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'python',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Python|3.6',
                },
                supportedFunctionsExtensionVersions: ['~2', '~3'],
                endOfLifeDate: python36EOL,
              },
            },
          },
        ],
      },
    ],
  };
};

export const pythonStackNonIsoDates: FunctionAppStack = getPythonStack(false);

export const pythonStack: FunctionAppStack = getPythonStack(true);
