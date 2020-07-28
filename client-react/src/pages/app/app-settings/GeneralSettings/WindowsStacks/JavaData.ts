import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ArmObj } from '../../../../../models/arm-obj';
import { SiteConfig } from '../../../../../models/site/config';
import i18next from 'i18next';
import { AppStackOs, AppStackMajorVersion } from '../../../../../models/stacks/app-stacks';
import { WebAppStack } from '../../../../../models/stacks/web-app-stacks';

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

export const getJavaMajorVersionAsDropdownOptions = (javaStack: WebAppStack, osType?: AppStackOs): IDropdownOption[] => {
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
  if (!!currentJavaMajorVersionDetails) {
    currentJavaMajorVersionDetails.minorVersions.forEach(minorVersion => {
      if (minorVersion.stackSettings.windowsRuntimeSettings) {
        options.push({
          key: minorVersion.stackSettings.windowsRuntimeSettings.runtimeVersion
            ? minorVersion.stackSettings.windowsRuntimeSettings.runtimeVersion
            : minorVersion.value,
          text: minorVersion.stackSettings.windowsRuntimeSettings.isAutoUpdate
            ? t('stackVersionAutoUpdate').format(minorVersion.displayText)
            : minorVersion.displayText,
        });
      }
    });
  }
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
        key: getJavaContainerKey(javaContainerMajorVersion),
        text: javaContainerMajorVersion.displayText,
      });
    }
  });
  return options;
};

export const getFrameworkVersionOptions = (
  javaContainers: WebAppStack,
  config: ArmObj<SiteConfig>,
  t: i18next.TFunction
): IDropdownOption[] => {
  const currentFramework =
    config.properties.javaContainer && javaContainers.majorVersions.find(x => getJavaContainerKey(x) === config.properties.javaContainer);
  const options: IDropdownOption[] = [];
  if (!!currentFramework) {
    currentFramework.minorVersions.forEach(minorVersion => {
      const containerSettings = minorVersion.stackSettings.windowsContainerSettings;
      if (containerSettings) {
        options.push({
          key: containerSettings.javaContainerVersion ? containerSettings.javaContainerVersion : minorVersion.value,
          text: containerSettings.isAutoUpdate ? t('stackVersionAutoUpdate').format(minorVersion.displayText) : minorVersion.displayText,
        });
      }
    });
  }
  return options;
};

const getJavaContainerKey = (javaContainerMajorVersion: AppStackMajorVersion<any>) => {
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
