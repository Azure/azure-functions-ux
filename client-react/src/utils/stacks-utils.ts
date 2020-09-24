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

export const getMinorVersionText = (text: string, t: i18next.TFunction, settings?: WebAppRuntimeSettings) => {
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
    if (settings.isPreview) {
      return t('stackVersionPreview').format(text);
    }
  }
  return text;
};

export const isStackVersionDeprecated = (settings: WebAppRuntimeSettings) => {
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
    let filteredMajorVersions: AppStackMajorVersion<WebAppRuntimes & JavaContainersInterface>[] = [];
    for (const majorVersion of stack.majorVersions) {
      let filteredMinorVersions: AppStackMinorVersion<WebAppRuntimes & JavaContainersInterface>[] = [];
      for (const minorVersion of majorVersion.minorVersions) {
        minorVersion.stackSettings.linuxRuntimeSettings = getFilteredWebStackSettings(
          stack.value,
          ignoreStackName,
          ignoreStackVersion,
          minorVersion.stackSettings.linuxRuntimeSettings
        );

        minorVersion.stackSettings.windowsRuntimeSettings = getFilteredWebStackSettings(
          stack.value,
          ignoreStackName,
          ignoreStackVersion,
          minorVersion.stackSettings.windowsRuntimeSettings
        );

        minorVersion.stackSettings.linuxContainerSettings = getFilteredLinuxJavaContainerSettings(
          stack.value,
          ignoreStackName,
          ignoreStackVersion,
          minorVersion.stackSettings.linuxContainerSettings
        );

        minorVersion.stackSettings.windowsContainerSettings = getFilteredWindowsJavaContainerSettings(
          stack.value,
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
      if (filteredMinorVersions.length > 0) {
        majorVersion.minorVersions = filteredMinorVersions;
        filteredMajorVersions.push(majorVersion);
      }
    }
    if (filteredMajorVersions.length > 0) {
      stack.majorVersions = filteredMajorVersions;
      filteredStacks.push(stack);
    }
  }
  return filteredStacks;
};

export const getFilteredWebStackSettings = (
  stackName: string,
  ignoreStackName: string,
  ignoreStackVersion: string,
  settings?: WebAppRuntimeSettings
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

export const getFilteredLinuxJavaContainerSettings = (
  stackName: string,
  ignoreStackName: string,
  ignoreStackVersion: string,
  settings?: LinuxJavaContainerSettings
) => {
  if (!!settings) {
    if (
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
};

export const RuntimeStacks = {
  aspnet: 'asp.net',
  node: 'node',
  python: 'python',
  dotnetcore: 'dotnetcore',
  java8: 'java-8',
  java11: 'java-11',
};
