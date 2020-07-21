import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ArmObj } from '../../../../../models/arm-obj';
import { SiteConfig } from '../../../../../models/site/config';
import i18next from 'i18next';
import { AppStackOs, AvailableStackArray, AvailableStack } from '../../../../../models/stacks/app-stacks';

export const getJavaStack = (stacks: AvailableStackArray) => (stacks as any[]).find(x => x.value === 'java');
export const getJavaContainers = (stacks: AvailableStackArray) => (stacks as any[]).find(x => x.value === 'javacontainers');
export const DEFAULTJAVAMAJORVERSION = { majorVersion: '11', minorVersion: '11' };

export const getJavaMajorMinorVersion = (javaStack: AvailableStack, config: ArmObj<SiteConfig>) => {
  const { javaVersion } = config.properties;
  let versionDetails;
  javaStack.majorVersions.forEach(javaStackMajorVersion => {
    javaStackMajorVersion.minorVersions.forEach(javaStackMinorVersion => {
      const settings = javaStackMinorVersion.stackSettings.windowsRuntimeSettings;
      if (settings && javaVersion && settings.runtimeVersion === javaVersion.toLocaleLowerCase()) {
        versionDetails = {
          majorVersion: javaStackMajorVersion.value,
          minorVersion: settings.runtimeVersion,
        };
      }
    });
  });
  return versionDetails || getLatestNonPreviewJavaMajorMinorVersion(javaStack);
};

export const getJavaMinorVersionObject = (javaStack: AvailableStack, selectedJavaVersion: string) => {
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

export const getJavaMajorVersionAsDropdownOptions = (javaStack: AvailableStack, osType?: AppStackOs): IDropdownOption[] => {
  return (javaStack.majorVersions as any[]).map(x => ({
    key: x.value,
    text: x.displayText,
  }));
};

export const getJavaMinorVersionAsDropdownOptions = (
  currentJavaMajorVersion: string,
  javaStack: AvailableStack,
  t: i18next.TFunction
): IDropdownOption[] => {
  const currentJavaMajorVersionDetails = (javaStack.majorVersions as any[]).find(x => x.value === currentJavaMajorVersion);
  return (
    (!!currentJavaMajorVersionDetails &&
      currentJavaMajorVersionDetails.minorVersions.map(x => ({
        key: x.value,
        text: `${
          x.stackSettings.windowsRuntimeSettings && x.stackSettings.windowsRuntimeSettings.isAutoUpdate
            ? t('stackVersionAutoUpdate').format(x.displayText)
            : x.displayText
        }`,
      }))) ||
    []
  );
};

export const getJavaContainersOptions = (javaContainers: AvailableStack): IDropdownOption[] =>
  (javaContainers.majorVersions as any[]).map(x => {
    return {
      key: x.value,
      text: x.displayText,
    };
  });

export const getFrameworkVersionOptions = (
  javaContainers: AvailableStack,
  config: ArmObj<SiteConfig>,
  t: i18next.TFunction
): IDropdownOption[] => {
  const currentFramework =
    config.properties.javaContainer &&
    (javaContainers.majorVersions as any[]).find(x => x.value === config.properties.javaContainer.toLowerCase());
  if (currentFramework) {
    return currentFramework.minorVersions.map(x => ({
      key: x.value,
      text: `${
        x.stackSettings.windowsContainerSettings && x.stackSettings.windowsContainerSettings.isAutoUpdate
          ? t('stackVersionAutoUpdate').format(x.displayText)
          : x.displayText
      }`,
    }));
  }
  return [];
};

const getLatestNonPreviewJavaMajorMinorVersion = (javaStack: AvailableStack) => {
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
