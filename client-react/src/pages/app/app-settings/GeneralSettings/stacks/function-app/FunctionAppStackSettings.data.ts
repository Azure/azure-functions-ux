import { FunctionAppRuntimes, FunctionAppRuntimeSettings, FunctionAppStack } from '../../../../../../models/stacks/function-app-stacks';
import { IDropdownOption } from 'office-ui-fabric-react';
import { RuntimeExtensionMajorVersions } from '../../../../../../models/functions/runtime-extension';
import { AppStackMajorVersion, AppStackMinorVersion, AppStackOs } from '../../../../../../models/stacks/app-stacks';
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

// Filter all the deprecated stack except the specific version passed as the parameter
export const filterDeprecatedFunctionAppStack = (stacks: FunctionAppStack[], ignoreStackName: string, ignoreStackVersion: string) => {
  const filteredStacks: FunctionAppStack[] = [];
  for (const stack of stacks) {
    const filteredMajorVersions: AppStackMajorVersion<FunctionAppRuntimes>[] = filterDeprecatedFunctionAppStackMajorVersion(
      stack.majorVersions,
      stack.value,
      ignoreStackName,
      ignoreStackVersion
    );
    if (filteredMajorVersions.length > 0) {
      stack.majorVersions = filteredMajorVersions;
      filteredStacks.push(stack);
    }
  }
  return filteredStacks;
};

export const filterDeprecatedFunctionAppStackMajorVersion = (
  majorVersions: AppStackMajorVersion<FunctionAppRuntimes>[],
  stackName: string,
  ignoreStackName: string,
  ignoreStackVersion: string
) => {
  const filteredMajorVersions: AppStackMajorVersion<FunctionAppRuntimes>[] = [];
  for (const majorVersion of majorVersions) {
    const filteredMinorVersions: AppStackMinorVersion<FunctionAppRuntimes>[] = filterDeprecatedFunctionAppStackMinorVersion(
      majorVersion.minorVersions,
      stackName,
      ignoreStackName,
      ignoreStackVersion
    );
    if (filteredMinorVersions.length > 0) {
      majorVersion.minorVersions = filteredMinorVersions;
      filteredMajorVersions.push(majorVersion);
    }
  }
  return filteredMajorVersions;
};

export const filterDeprecatedFunctionAppStackMinorVersion = (
  minorVersions: AppStackMinorVersion<FunctionAppRuntimes>[],
  stackName: string,
  ignoreStackName: string,
  ignoreStackVersion: string
) => {
  const filteredMinorVersions: AppStackMinorVersion<FunctionAppRuntimes>[] = [];
  for (const minorVersion of minorVersions) {
    minorVersion.stackSettings.linuxRuntimeSettings = getFilteredFunctionStackSettings(
      stackName,
      ignoreStackName,
      ignoreStackVersion,
      minorVersion.stackSettings.linuxRuntimeSettings
    );

    minorVersion.stackSettings.windowsRuntimeSettings = getFilteredFunctionStackSettings(
      stackName,
      ignoreStackName,
      ignoreStackVersion,
      minorVersion.stackSettings.windowsRuntimeSettings
    );

    if (minorVersion.stackSettings.linuxRuntimeSettings || minorVersion.stackSettings.windowsRuntimeSettings) {
      filteredMinorVersions.push(minorVersion);
    }
  }
  return filteredMinorVersions;
};

export const getFilteredFunctionStackSettings = (
  stackName: string,
  ignoreStackName: string,
  ignoreStackVersion: string,
  settings?: FunctionAppRuntimeSettings
) => {
  if (!!settings) {
    if (
      stackName.toLowerCase() === ignoreStackName.toLowerCase() &&
      ignoreStackVersion.toLowerCase() === settings.runtimeVersion.toLowerCase()
    ) {
      return settings;
    } else {
      return settings.isDeprecated ? undefined : settings;
    }
  } else {
    return undefined;
  }
};
