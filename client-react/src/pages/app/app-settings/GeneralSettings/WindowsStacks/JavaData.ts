import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ArmObj } from '../../../../../models/arm-obj';
import { SiteConfig } from '../../../../../models/site/config';
import i18next from 'i18next';
import { AppStackOs } from '../../../../../models/stacks/app-stacks';
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
  return javaStack.majorVersions.map(x => ({
    key: x.value,
    text: x.displayText,
  }));
};

export const getJavaMinorVersionAsDropdownOptions = (
  currentJavaMajorVersion: string,
  javaStack: WebAppStack,
  t: i18next.TFunction
): IDropdownOption[] => {
  const currentJavaMajorVersionDetails = javaStack.majorVersions.find(x => x.value === currentJavaMajorVersion);
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

export const getJavaContainersOptions = (javaContainers: WebAppStack): IDropdownOption[] =>
  javaContainers.majorVersions.map(x => {
    return {
      key: x.value,
      text: x.displayText,
    };
  });

export const getFrameworkVersionOptions = (
  javaContainers: WebAppStack,
  config: ArmObj<SiteConfig>,
  t: i18next.TFunction
): IDropdownOption[] => {
  const currentFramework =
    config.properties.javaContainer && javaContainers.majorVersions.find(x => x.value === config.properties.javaContainer.toLowerCase());
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
