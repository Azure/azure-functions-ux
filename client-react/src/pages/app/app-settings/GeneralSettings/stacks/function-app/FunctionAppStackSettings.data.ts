import { FunctionAppStack } from '../../../../../../models/stacks/function-app-stacks';
import { IDropdownOption } from 'office-ui-fabric-react';
import { RuntimeExtensionMajorVersions } from '../../../../../../models/functions/runtime-extension';
import { AppStackOs } from '../../../../../../models/stacks/app-stacks';
import { WorkerRuntimeLanguages } from '../../../../../../utils/CommonConstants';

export const getStackVersionDropdownOptions = (
  stack: FunctionAppStack,
  runtimeVersion: RuntimeExtensionMajorVersions,
  osType: AppStackOs
): IDropdownOption[] => {
  const stackMinorVersions: IDropdownOption[] = [];

  stack.majorVersions.forEach(stackMajorVersion => {
    stackMajorVersion.minorVersions.forEach(stackMinorVersion => {
      const settings =
        osType === AppStackOs.windows
          ? stackMinorVersion.stackSettings.windowsRuntimeSettings
          : stackMinorVersion.stackSettings.linuxRuntimeSettings;
      if (
        settings &&
        (settings.supportedFunctionsExtensionVersions.find(supportedRuntimeVersion => supportedRuntimeVersion === runtimeVersion) ||
          settings.runtimeVersion === runtimeVersion)
      ) {
        stackMinorVersions.push({ key: settings.runtimeVersion, text: stackMinorVersion.displayText, data: stackMinorVersion });
      }
    });
  });

  return stackMinorVersions;
};

export const getStackVersionConfigPropertyName = (isLinuxApp: boolean, runtimeStack?: string) => {
  if (isLinuxApp) {
    return 'linuxFxVersion';
  }

  switch (runtimeStack) {
    case WorkerRuntimeLanguages.dotnet:
      return 'netFrameworkVersion';
    case WorkerRuntimeLanguages.java:
      return 'javaVersion';
    case WorkerRuntimeLanguages.php:
      return 'phpVersion';
    case WorkerRuntimeLanguages.powershell:
      return 'powerShellVersion';
    case WorkerRuntimeLanguages.nodejs:
      return 'nodeVersion';
    default:
      return 'netFrameworkVersion';
  }
};
