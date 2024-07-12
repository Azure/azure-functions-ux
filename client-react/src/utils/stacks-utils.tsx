import {
  WebAppStack,
  WebAppRuntimeSettings,
  LinuxJavaContainerSettings,
  WindowsJavaContainerSettings,
  WebAppRuntimes,
  JavaContainers as JavaContainersInterface,
} from '../models/stacks/web-app-stacks';
import { IDropdownOption, MessageBarType } from '@fluentui/react';
import { AppStackMajorVersion, AppStackMinorVersion, AppStackOs } from '../models/stacks/app-stacks';
import { FunctionAppStack } from '../models/stacks/function-app-stacks';
import i18next from 'i18next';
import LogService from './LogService';
import { LogCategories } from './LogCategories';
import { getDateAfterXSeconds } from './DateUtilities';
import { Links } from './FwLinks';
import CustomBanner from '../components/CustomBanner/CustomBanner';
import { AppSettingsFormValues } from '../pages/app/app-settings/AppSettings.types';
import { CommonConstants, WorkerRuntimeLanguages } from './CommonConstants';
import { findFormAppSettingIndex } from '../pages/app/app-settings/AppSettingsFormData';
import { filterDeprecatedFunctionAppStack } from '../pages/app/app-settings/GeneralSettings/stacks/function-app/FunctionAppStackSettings.data';
import { Site } from '../models/site/site';
import { ArmObj } from '../models/arm-obj';
import Url from './url';
import { isFlexConsumption } from './arm-utils';

const ENDOFLIFEMAXSECONDS = 15780000; // 6 months
export const NETFRAMEWORKVERSION5 = 5;

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
  if (settings) {
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

// NOTE(krmitta): Make sure this is in sync with what we show for Creates on ibiza
export const isStackVersionEndOfLife = (endOfLifeDate?: string): boolean => {
  try {
    return !!endOfLifeDate && Date.parse(endOfLifeDate) <= Date.parse(getDateAfterXSeconds(ENDOFLIFEMAXSECONDS).toString());
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
  if (settings) {
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
  if (settings) {
    if (
      !!ignoreStackVersion &&
      stackName.toLowerCase() === ignoreStackName.toLowerCase() &&
      (!settings.java21Runtime ||
        ignoreStackVersion.toLowerCase() === settings.java21Runtime.toLowerCase() ||
        !settings.java17Runtime ||
        ignoreStackVersion.toLowerCase() === settings.java17Runtime.toLowerCase() ||
        !settings.java11Runtime ||
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
  if (settings) {
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

export const getEarlyStackMessageParameters = (isEarlyStackMessageVisible: boolean, t: i18next.TFunction) => {
  return {
    infoBubbleMessage: isEarlyStackMessageVisible ? t('earlyAccessStackMessage') : undefined,
    learnMoreLink: isEarlyStackMessageVisible ? Links.earlyAccessStackLearnMore : undefined,
  };
};

// NOTE(krmitta): Make sure this is in sync with what we show for Creates on ibiza
export const checkAndGetStackEOLOrDeprecatedBanner = (t: i18next.TFunction, stackVersion: string, eolDate?: string | null) => {
  if (eolDate === undefined) {
    return <></>;
  }
  if (stackVersion.includes('wordpress')) {
    return (
      <CustomBanner
        type={MessageBarType.warning}
        id={'eol-stack-banner'}
        message={
          eolDate
            ? t('endOfLifeStackMessage').format(CommonConstants.WordPressStackDisplayTextMapping[stackVersion.toLocaleLowerCase()], new Date(eolDate).toLocaleDateString())
            : t('deprecatedStackMessage').format(CommonConstants.WordPressStackDisplayTextMapping[stackVersion.toLocaleLowerCase()])
        }
        learnMoreLink={Links.endOfLifeStackLink}
      />
    );
  }
  return (
    <CustomBanner
      type={MessageBarType.warning}
      id={'eol-stack-banner'}
      message={
        eolDate
          ? t('endOfLifeStackMessage').format(stackVersion, new Date(eolDate).toLocaleDateString())
          : t('deprecatedStackMessage').format(stackVersion)
      }
      learnMoreLink={Links.endOfLifeStackLink}
    />
  );
};

export const isJBossStack = (stackVersion: string) => !!stackVersion && stackVersion.toLowerCase().includes(JavaVersions.JBoss);

// NOTE(krmitta): The banner should only be shown when the new selected stack version is JBoss, and the current stack is different
export const isJBossWarningBannerShown = (newVersion: string, oldVersion: string) => isJBossStack(newVersion) && !isJBossStack(oldVersion);

export const isJBossClusteringShown = (version: string, site?: ArmObj<Site>) => {
  if (Url.getFeatureValue(CommonConstants.FeatureFlags.showJBossClustering) !== 'true') {
    return false;
  }

  if (version && site) {
    return isJBossStack(version) && !!site.properties.virtualNetworkSubnetId;
  }

  return false;
};

export const getStackVersionConfigPropertyName = (isLinuxApp: boolean, runtimeStack?: string) => {
  if (isLinuxApp) {
    return 'linuxFxVersion';
  }

  switch (runtimeStack) {
    case WorkerRuntimeLanguages.dotnet:
    case WorkerRuntimeLanguages.dotnetIsolated:
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

export const isWindowsNodeApp = (isLinux: boolean, stack?: string) =>
  !isLinux && !!stack && stack.toLocaleLowerCase() === WorkerRuntimeLanguages.nodejs;

export const getFunctionAppStackVersion = (
  values: AppSettingsFormValues,
  isLinux: boolean,
  site: ArmObj<Site> | undefined,
  stack?: string
) => {
  // NOTE(krmitta): For Windows node app only we get the version from app-setting instead of config, thus this special case.
  if (isWindowsNodeApp(isLinux, stack)) {
    const index = findFormAppSettingIndex([...values.appSettings], CommonConstants.AppSettingNames.websiteNodeDefaultVersion);
    if (index !== -1) {
      return values.appSettings[index].value;
    } else {
      return undefined;
    }
  } else {
    if (!!site && isFlexConsumption(site)) {
      return (
        `${site.properties.functionAppConfig?.runtime?.name}|${site.properties.functionAppConfig?.runtime?.version}`.toLowerCase() ||
        undefined
      );
    }
    const stackVersionProperty = getStackVersionConfigPropertyName(isLinux, stack);
    const stackVersion = values.config && values.config.properties && values.config.properties[stackVersionProperty];
    return stackVersion ?? undefined;
  }
};

export const filterFunctionAppStack = (
  supportedStacks: FunctionAppStack[],
  values: AppSettingsFormValues,
  isLinux: boolean,
  stack: string,
  site: ArmObj<Site> | undefined
) => {
  const version = getFunctionAppStackVersion(values, isLinux, site, stack);
  return filterDeprecatedFunctionAppStack(supportedStacks, stack, version || '');
};

export const getFunctionAppStackObject = (supportedStacks: FunctionAppStack[], isLinux: boolean, stack?: string) => {
  if (stack) {
    for (const supportedStack of supportedStacks) {
      for (const majorVersion of supportedStack.majorVersions) {
        for (const minorVersion of majorVersion.minorVersions) {
          const settings = isLinux ? minorVersion.stackSettings.linuxRuntimeSettings : minorVersion.stackSettings.windowsRuntimeSettings;
          if (!!settings && settings.appSettingsDictionary.FUNCTIONS_WORKER_RUNTIME === stack) {
            return supportedStack;
          }
        }
      }
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
  JBoss: 'jboss',
};

export const JavaContainers = {
  JavaSE: 'java',
  Tomcat: 'tomcat',
  JBoss: 'jbosseap',
};

export const RuntimeStacks = {
  java: 'java',
  node: 'node',
  python: 'python',
  dotnetcore: 'dotnetcore',
  java8: 'java-8',
  java11: 'java-11',
  php: 'php',
  powershell: 'powershell',
  dotnet: 'dotnet',
  dotnetIsolated: 'dotnet-isolated',
};

export const defaultDotnetCoreMajorVersion = {
  displayText: '.NET Core (3.1, 2.1)',
  value: '.NET Core',
  minorVersions: [
    {
      displayText: '.NET Core (3.1, 2.1)',
      value: '.NET Core',
      stackSettings: {
        windowsRuntimeSettings: {
          runtimeVersion: RuntimeStacks.dotnetcore,
          remoteDebuggingSupported: false,
          appInsightsSettings: {
            isSupported: false,
          },
          gitHubActionSettings: {
            isSupported: false,
          },
        },
      },
    },
  ],
};
