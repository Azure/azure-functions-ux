import { IDropdownOption } from '@fluentui/react';
import i18next from 'i18next';

import { ArmObj } from '../../../../../models/arm-obj';
import { SiteConfig } from '../../../../../models/site/config';
import { AppStackMajorVersion } from '../../../../../models/stacks/app-stacks';
import { WebAppStack } from '../../../../../models/stacks/web-app-stacks';
import { getMinorVersionText } from '../../../../../utils/stacks-utils';

export const getJavaStack = (stacks: WebAppStack[]) => stacks.find(x => x.value === 'java');
export const getJavaContainers = (stacks: WebAppStack[]) => stacks.find(x => x.value === 'javacontainers');
export const DEFAULTJAVAMAJORVERSION = { majorVersion: '11', minorVersion: '11' };

export const getJavaMajorMinorVersion = (javaStack: WebAppStack, config: ArmObj<SiteConfig>) => {
  const { javaVersion } = config.properties;
  let versionDetails;
  javaStack.majorVersions.forEach(javaStackMajorVersion => {
    javaStackMajorVersion.minorVersions.forEach(javaStackMinorVersion => {
      const settings = javaStackMinorVersion.stackSettings.windowsRuntimeSettings;
      if (settings && javaVersion && settings.runtimeVersion === javaVersion) {
        versionDetails = {
          majorVersion: javaStackMajorVersion.value,
          minorVersion: settings.runtimeVersion,
        };
      }
    });
  });
  return versionDetails || getLatestNonPreviewJavaMajorMinorVersion(javaStack);
};

export const getJavaMinorVersionObject = (javaStack: WebAppStack, selectedJavaVersion: string) => {
  let minorVersionSettings;
  javaStack.majorVersions.forEach(javaStackMajorVersion => {
    javaStackMajorVersion.minorVersions.forEach(javaStackMinorVersion => {
      const settings = javaStackMinorVersion.stackSettings.windowsRuntimeSettings;
      if (settings && settings.runtimeVersion === selectedJavaVersion) {
        minorVersionSettings = settings;
      }
    });
  });
  return minorVersionSettings;
};

export const getJavaMajorVersionAsDropdownOptions = (javaStack: WebAppStack): IDropdownOption[] => {
  const options: IDropdownOption[] = [];
  javaStack.majorVersions.forEach(javaStackMajorVersion => {
    let windowsRuntimeCount = 0;
    javaStackMajorVersion.minorVersions.forEach(javaStackMinorVersion => {
      if (javaStackMinorVersion.stackSettings.windowsRuntimeSettings) {
        windowsRuntimeCount += 1;
      }
    });
    if (windowsRuntimeCount > 0) {
      options.push({
        key: javaStackMajorVersion.value,
        text: javaStackMajorVersion.displayText,
      });
    }
  });
  return options;
};

export const getJavaMinorVersionAsDropdownOptions = (
  currentJavaMajorVersion: string,
  javaStack: WebAppStack,
  t: i18next.TFunction
): IDropdownOption[] => {
  const currentJavaMajorVersionDetails = javaStack.majorVersions.find(x => x.value === currentJavaMajorVersion);
  const options: IDropdownOption[] = [];
  currentJavaMajorVersionDetails?.minorVersions.forEach(minorVersion => {
    if (minorVersion.stackSettings.windowsRuntimeSettings) {
      options.push({
        key: minorVersion.stackSettings.windowsRuntimeSettings.runtimeVersion
          ? minorVersion.stackSettings.windowsRuntimeSettings.runtimeVersion
          : minorVersion.value,
        text: getMinorVersionText(minorVersion.displayText, t, minorVersion.stackSettings.windowsRuntimeSettings),
        data: minorVersion,
      });
    }
  });
  return options;
};

export const getJavaContainersOptions = (javaContainers: WebAppStack): IDropdownOption[] => {
  const options: IDropdownOption[] = [];
  javaContainers.majorVersions.forEach(javaContainerMajorVersion => {
    let windowsContainerCount = 0;
    javaContainerMajorVersion.minorVersions.forEach(javaContainerMinorVersion => {
      if (javaContainerMinorVersion.stackSettings.windowsContainerSettings) {
        windowsContainerCount += 1;
      }
    });
    if (windowsContainerCount > 0) {
      options.push({
        key: javaContainerMajorVersion.value,
        text: javaContainerMajorVersion.displayText,
        data: getJavaContainerValue(javaContainerMajorVersion),
      });
    }
  });
  return options;
};

export const getFrameworkVersionOptions = (
  javaContainers: WebAppStack,
  selectedJavaContainer: string,
  t: i18next.TFunction
): IDropdownOption[] => {
  const currentFramework = javaContainers.majorVersions.find(x => x.value === selectedJavaContainer);
  const options: IDropdownOption[] = [];
  currentFramework?.minorVersions.forEach(minorVersion => {
    const containerSettings = minorVersion.stackSettings.windowsContainerSettings;
    if (containerSettings) {
      options.push({
        key: containerSettings.javaContainerVersion ? containerSettings.javaContainerVersion : minorVersion.value,
        text: getMinorVersionText(minorVersion.displayText, t, minorVersion.stackSettings.windowsContainerSettings),
        data: minorVersion,
      });
    }
  });
  return options;
};

export const getJavaContainerKey = (javaContainers: WebAppStack, config: ArmObj<SiteConfig>) => {
  for (const majorVersion of javaContainers.majorVersions) {
    for (const minorVersion of majorVersion.minorVersions) {
      const settings = minorVersion.stackSettings.windowsContainerSettings;
      if (
        !!settings &&
        settings.javaContainer === config.properties.javaContainer &&
        settings.javaContainerVersion === config.properties.javaContainerVersion
      ) {
        return majorVersion.value;
      }
    }
  }
  return '';
};

const getJavaContainerValue = (javaContainerMajorVersion: AppStackMajorVersion<any>) => {
  for (let i = 0; i < javaContainerMajorVersion.minorVersions.length; ++i) {
    if (javaContainerMajorVersion.minorVersions[i].stackSettings.windowsContainerSettings) {
      return javaContainerMajorVersion.minorVersions[i].stackSettings.windowsContainerSettings.javaContainer;
    }
  }
  return javaContainerMajorVersion.value;
};

const getLatestNonPreviewJavaMajorMinorVersion = (javaStack: WebAppStack) => {
  javaStack.majorVersions.forEach(javaStackMajorVersion => {
    javaStackMajorVersion.minorVersions.forEach(javaStackMinorVersion => {
      const settings = javaStackMinorVersion.stackSettings.windowsRuntimeSettings;
      if (settings && !settings.isPreview) {
        return {
          majorVersion: javaStackMajorVersion.value,
          minorVersion: settings.runtimeVersion,
        };
      }
    });
  });
  return DEFAULTJAVAMAJORVERSION;
};
