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
export const filterDeprecatedFunctionAppStack = (
  stacks: FunctionAppStack[],
  alwaysIncludedStackName: string,
  alwaysIncludedStackVersion: string
) => {
  const filteredStacks: FunctionAppStack[] = [];
  for (const stack of stacks) {
    const filteredMajorVersions: AppStackMajorVersion<FunctionAppRuntimes>[] = filterDeprecatedFunctionAppStackMajorVersion(
      stack.majorVersions,
      stack.value,
      alwaysIncludedStackName,
      alwaysIncludedStackVersion
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
  alwaysIncludedStackName: string,
  alwaysIncludedStackVersion: string
) => {
  const filteredMajorVersions: AppStackMajorVersion<FunctionAppRuntimes>[] = [];
  for (const majorVersion of majorVersions) {
    const filteredMinorVersions: AppStackMinorVersion<FunctionAppRuntimes>[] = filterDeprecatedFunctionAppStackMinorVersion(
      majorVersion.minorVersions,
      stackName,
      alwaysIncludedStackName,
      alwaysIncludedStackVersion
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
  alwaysIncludedStackName: string,
  alwaysIncludedStackVersion: string
) => {
  const filteredMinorVersions: AppStackMinorVersion<FunctionAppRuntimes>[] = [];
  for (const minorVersion of minorVersions) {
    minorVersion.stackSettings.linuxRuntimeSettings = getFilteredFunctionStackSettings(
      stackName,
      alwaysIncludedStackName,
      alwaysIncludedStackVersion,
      minorVersion.stackSettings.linuxRuntimeSettings
    );

    minorVersion.stackSettings.windowsRuntimeSettings = getFilteredFunctionStackSettings(
      stackName,
      alwaysIncludedStackName,
      alwaysIncludedStackVersion,
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
  alwaysIncludedStackName: string,
  alwaysIncludedStackVersion: string,
  settings?: FunctionAppRuntimeSettings
) => {
  if (!!settings) {
    if (
      stackName.toLowerCase() === alwaysIncludedStackName.toLowerCase() &&
      alwaysIncludedStackVersion.toLowerCase() === settings.runtimeVersion.toLowerCase()
    ) {
      return settings;
    } else {
      return settings.isDeprecated ? undefined : settings;
    }
  } else {
    return undefined;
  }
};
