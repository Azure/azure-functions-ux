import { RuntimeStackSetting } from '../DeploymentCenter.types';
import { ArmObj } from '../../../../models/arm-obj';
import { SiteConfig } from '../../../../models/site/config';
import { KeyValue } from '../../../../models/portal-models';
import { RuntimeStacks, JavaContainers, JavaVersions } from '../../../../utils/stacks-utils';

export const getRuntimeStackSetting = (
  isLinuxApplication: boolean,
  siteConfig: ArmObj<SiteConfig>,
  configMetadata: ArmObj<KeyValue<string>>,
  applicationSettings: ArmObj<KeyValue<string>>
): RuntimeStackSetting => {
  if (isLinuxApplication) {
    return getRuntimeStackSettingForLinux(siteConfig);
  } else {
    return getRuntimeStackSettingForWindows(siteConfig, configMetadata, applicationSettings);
  }
};

const getRuntimeStackVersionForWindows = (stack: string, siteConfig: ArmObj<SiteConfig>, applicationSettings: ArmObj<KeyValue<string>>) => {
  if (stack === RuntimeStacks.node) {
    return applicationSettings.properties['WEBSITE_NODE_DEFAULT_VERSION'];
  } else if (stack === RuntimeStacks.python) {
    return siteConfig.properties.pythonVersion;
  } else if (stack === RuntimeStacks.java8 || stack === RuntimeStacks.java11) {
    return `${siteConfig.properties.javaVersion}|${siteConfig.properties.javaContainer}|${siteConfig.properties.javaContainerVersion}`;
  } else {
    return '';
  }
};

const getRuntimeStackForWindows = (siteConfig: ArmObj<SiteConfig>, configMetadata: ArmObj<KeyValue<string>>) => {
  if (configMetadata['CURRENT_STACK']) {
    const metadataStack = configMetadata['CURRENT_STACK'].toLowerCase();

    // NOTE(michinoy): Java is special, so need to handle it carefully. Also in this case, use
    // the string 'java' rather than any of the constants defined as it is not related to any of the
    // defined constants.
    if (metadataStack === 'java') {
      return siteConfig.properties.javaVersion === JavaVersions.WindowsVersion8 ? RuntimeStacks.java8 : RuntimeStacks.java11;
    } else {
      return metadataStack;
    }
  } else {
    return '';
  }
};

const getRuntimeStackSettingForWindows = (
  siteConfig: ArmObj<SiteConfig>,
  configMetadata: ArmObj<KeyValue<string>>,
  applicationSettings: ArmObj<KeyValue<string>>
): RuntimeStackSetting => {
  const stackData = { runtimeStack: '', runtimeVersion: '' };

  stackData.runtimeStack = getRuntimeStackForWindows(siteConfig, configMetadata);
  stackData.runtimeVersion = getRuntimeStackVersionForWindows(stackData.runtimeStack, siteConfig, applicationSettings);

  return stackData;
};

const getRuntimeStackVersionForLinux = (siteConfig: ArmObj<SiteConfig>) => {
  return !!siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion : '';
};

const getRuntimeStackForLinux = (siteConfig: ArmObj<SiteConfig>) => {
  const linuxFxVersionParts = siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion.split('|') : [];
  const runtimeStack = linuxFxVersionParts.length > 0 ? linuxFxVersionParts[0].toLocaleLowerCase() : '';

  // NOTE(michinoy): Java is special, so need to handle it carefully.
  if (runtimeStack === JavaContainers.JavaSE || runtimeStack === JavaContainers.Tomcat) {
    const fxVersionParts = !!siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion.split('-') : [];
    const fxStack = fxVersionParts.length === 2 ? fxVersionParts[1].toLocaleLowerCase() : '';
    if (fxStack === JavaVersions.LinuxVersion8 || fxStack === JavaVersions.LinuxVersion11) {
      return fxStack === JavaVersions.LinuxVersion8 ? RuntimeStacks.java8 : RuntimeStacks.java11;
    } else {
      return '';
    }
  } else {
    return runtimeStack;
  }
};

const getRuntimeStackSettingForLinux = (siteConfig: ArmObj<SiteConfig>): RuntimeStackSetting => {
  const stackData = { runtimeStack: '', runtimeVersion: '' };

  stackData.runtimeStack = getRuntimeStackForLinux(siteConfig);
  stackData.runtimeVersion = getRuntimeStackVersionForLinux(siteConfig);

  return stackData;
};

export const getArmToken = () => {
  return window.appsvc && window.appsvc.env.armToken ? `bearer ${window.appsvc.env.armToken}` : '';
};

export const getWorkflowFileName = (branch: string, siteName: string, slotName?: string): string => {
  const normalizedBranchName = branch.split('/').join('-');
  return slotName ? `${normalizedBranchName}_${siteName}(${slotName}).yml` : `${normalizedBranchName}_${siteName}.yml`;
};

export const getWorkflowFilePath = (branch: string, siteName: string, slotName?: string): string => {
  return `.github/workflows/${getWorkflowFileName(branch, siteName, slotName)}`;
};
