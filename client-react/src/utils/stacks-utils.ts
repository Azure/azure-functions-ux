import {
  WebAppStack,
  WebAppRuntimeSettings,
  LinuxJavaContainerSettings,
  WindowsJavaContainerSettings,
  WebAppRuntimes,
  JavaContainers as JavaContainersInterface,
} from '../models/stacks/web-app-stacks';
import { IDropdownOption } from 'office-ui-fabric-react';
import { AppStackMajorVersion, AppStackMinorVersion, AppStackOs } from '../models/stacks/app-stacks';
import { FunctionAppStack } from '../models/stacks/function-app-stacks';
import i18next from 'i18next';
import LogService from './LogService';
import { LogCategories } from './LogCategories';
import { getDateAfterXSeconds } from './DateUtilities';

const ENDOFLIFEMAXSECONDS = 5184000; // 60 days

export const getStacksSummaryForDropdown = (
  stack: WebAppStack | FunctionAppStack,
  osType: AppStackOs,
  t: i18next.TFunction
): IDropdownOption[] => {
  const options: IDropdownOption[] = [];
  stack.majorVersions.forEach(stackMajorVersion => {
    stackMajorVersion.minorVersions.forEach(stackMinorVersion => {
      const settings =
        osType === AppStackOs.linux
          ? stackMinorVersion.stackSettings.linuxRuntimeSettings
          : stackMinorVersion.stackSettings.windowsRuntimeSettings;
      if (settings) {
        options.push({
          key: settings.runtimeVersion,
          text: getMinorVersionText(stackMinorVersion.displayText, t, settings),
          data: stackMinorVersion,
        });
      }
    });
  });
  return options;
};

export const getMinorVersionText = (
  text: string,
  t: i18next.TFunction,
  settings?: WebAppRuntimeSettings | WindowsJavaContainerSettings | LinuxJavaContainerSettings
) => {
  if (!!settings) {
    if (settings.isAutoUpdate) {
      return t('stackVersionAutoUpdate').format(text);
    }
    if (isStackVersionDeprecated(settings)) {
      return t('stackVersionDeprecated').format(text);
    }
    if (isStackVersionEndOfLife(settings.endOfLifeDate)) {
      return t('endOfLifeTagTemplate').format(text);
    }
    if (settings.isEarlyAccess) {
      return t('earlyAccessTemplate').format(text);
    }
    if (settings.isPreview) {
      return t('stackVersionPreview').format(text);
    }
  }
  return text;
};

export const isStackVersionDeprecated = (settings: WebAppRuntimeSettings | WindowsJavaContainerSettings | LinuxJavaContainerSettings) => {
  return settings.isDeprecated || (!!settings.endOfLifeDate && Date.parse(settings.endOfLifeDate) < Date.now());
};

export const isStackVersionEndOfLife = (endOfLifeDate?: string): boolean => {
  try {
    return !!endOfLifeDate && Date.parse(endOfLifeDate) <= getDateAfterXSeconds(ENDOFLIFEMAXSECONDS).getSeconds();
  } catch (err) {
    LogService.error(LogCategories.appSettings, 'StackSettings', err);
    return false;
  }
};

// Filter all the deprecated stack except the specific version passed as the parameter
export const filterDeprecatedWebAppStack = (stacks: WebAppStack[], ignoreStackName: string, ignoreStackVersion: string) => {
  const filteredStacks: WebAppStack[] = [];
  for (const stack of stacks) {
    const filteredMajorVersions: AppStackMajorVersion<WebAppRuntimes & JavaContainersInterface>[] = filterDeprecatedWebAppStackMajorVersion(
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

export const filterDeprecatedWebAppStackMajorVersion = (
  majorVersions: AppStackMajorVersion<WebAppRuntimes & JavaContainersInterface>[],
  stackName: string,
  ignoreStackName: string,
  ignoreStackVersion: string
) => {
  const filteredMajorVersions: AppStackMajorVersion<WebAppRuntimes & JavaContainersInterface>[] = [];
  for (const majorVersion of majorVersions) {
    const filteredMinorVersions: AppStackMinorVersion<WebAppRuntimes & JavaContainersInterface>[] = filterDeprecatedWebAppStackMinorVersion(
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

export const filterDeprecatedWebAppStackMinorVersion = (
  minorVersions: AppStackMinorVersion<WebAppRuntimes & JavaContainersInterface>[],
  stackName: string,
  ignoreStackName: string,
  ignoreStackVersion: string
) => {
  const filteredMinorVersions: AppStackMinorVersion<WebAppRuntimes & JavaContainersInterface>[] = [];
  for (const minorVersion of minorVersions) {
    minorVersion.stackSettings.linuxRuntimeSettings = getFilteredWebStackSettings(
      stackName,
      ignoreStackName,
      ignoreStackVersion,
      minorVersion.stackSettings.linuxRuntimeSettings
    );

    minorVersion.stackSettings.windowsRuntimeSettings = getFilteredWebStackSettings(
      stackName,
      ignoreStackName,
      ignoreStackVersion,
      minorVersion.stackSettings.windowsRuntimeSettings
    );

    minorVersion.stackSettings.linuxContainerSettings = getFilteredLinuxJavaContainerSettings(
      stackName,
      ignoreStackName,
      ignoreStackVersion,
      minorVersion.stackSettings.linuxContainerSettings
    );

    minorVersion.stackSettings.windowsContainerSettings = getFilteredWindowsJavaContainerSettings(
      stackName,
      ignoreStackName,
      ignoreStackVersion,
      minorVersion.stackSettings.windowsContainerSettings
    );

    if (
      minorVersion.stackSettings.linuxRuntimeSettings ||
      minorVersion.stackSettings.windowsRuntimeSettings ||
      minorVersion.stackSettings.linuxContainerSettings ||
      minorVersion.stackSettings.windowsContainerSettings
    ) {
      filteredMinorVersions.push(minorVersion);
    }
  }
  return filteredMinorVersions;
};

export const getFilteredWebStackSettings = (
  stackName: string,
  ignoreStackName: string,
  ignoreStackVersion: string,
  settings?: WebAppRuntimeSettings
) => {
  if (!!settings) {
    if (
      !!ignoreStackVersion &&
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

export const getFilteredLinuxJavaContainerSettings = (
  stackName: string,
  ignoreStackName: string,
  ignoreStackVersion: string,
  settings?: LinuxJavaContainerSettings
) => {
  if (!!settings) {
    if (
      !!ignoreStackVersion &&
      stackName.toLowerCase() === ignoreStackName.toLowerCase() &&
      (!settings.java11Runtime ||
        ignoreStackVersion.toLowerCase() === settings.java11Runtime.toLowerCase() ||
        !settings.java8Runtime ||
        ignoreStackVersion.toLowerCase() === settings.java8Runtime.toLowerCase())
    ) {
      return settings;
    } else {
      return settings.isDeprecated ? undefined : settings;
    }
  } else {
    return undefined;
  }
};

export const getFilteredWindowsJavaContainerSettings = (
  stackName: string,
  ignoreStackName: string,
  ignoreStackVersion: string,
  settings?: WindowsJavaContainerSettings
) => {
  if (!!settings) {
    if (
      !!ignoreStackVersion &&
      stackName.toLowerCase() === ignoreStackName.toLowerCase() &&
      ignoreStackVersion.toLowerCase() === settings.javaContainerVersion.toLowerCase()
    ) {
      return settings;
    } else {
      return settings.isDeprecated ? undefined : settings;
    }
  } else {
    return undefined;
  }
};

export const JavaVersions = {
  WindowsVersion8: '1.8',
  WindowsVersion11: '11',
  LinuxVersion8: 'jre8',
  LinuxVersion11: 'java11',
};

export const JavaContainers = {
  JavaSE: 'java',
  Tomcat: 'tomcat',
  JBoss: 'jbosseap',
};

export const RuntimeStacks = {
  java: 'java',
  aspnet: 'asp.net',
  node: 'node',
  python: 'python',
  dotnetcore: 'dotnetcore',
  java8: 'java-8',
  java11: 'java-11',
  php: 'php',
  dotnet: 'dotnet',
};
