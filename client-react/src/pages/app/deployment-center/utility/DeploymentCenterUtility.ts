import { StackAndVersion } from '../DeploymentCenter.types';
import { ArmObj } from '../../../../models/arm-obj';
import { SiteConfig } from '../../../../models/site/config';
import { KeyValue } from '../../../../models/portal-models';
import { RuntimeStacks, JavaContainers, JavaVersions } from '../../../../utils/stacks-utils';

export const getStackAndVersion = (
  isLinuxApplication: boolean,
  siteConfig: ArmObj<SiteConfig>,
  configMetadata: ArmObj<KeyValue<string>>,
  applicationSettings: ArmObj<KeyValue<string>>
): StackAndVersion => {
  if (isLinuxApplication) {
    return getStackAndVersionForLinux(siteConfig);
  } else {
    return getStackAndVersionForWindows(siteConfig, configMetadata, applicationSettings);
  }
};

const getStackVersionForWindows = (stack: string, siteConfig: ArmObj<SiteConfig>, applicationSettings: ArmObj<KeyValue<string>>) => {
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

const getStackForWindows = (siteConfig: ArmObj<SiteConfig>, configMetadata: ArmObj<KeyValue<string>>) => {
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
  }
  return '';
};

const getStackAndVersionForWindows = (
  siteConfig: ArmObj<SiteConfig>,
  configMetadata: ArmObj<KeyValue<string>>,
  applicationSettings: ArmObj<KeyValue<string>>
): StackAndVersion => {
  const stackData = { runtimeStack: '', runtimeVersion: '' };

  stackData.runtimeStack = getStackForWindows(siteConfig, configMetadata);
  stackData.runtimeVersion = getStackVersionForWindows(stackData.runtimeStack, siteConfig, applicationSettings);

  return stackData;
};

const getStackVersionForLinux = (siteConfig: ArmObj<SiteConfig>) => {
  return !!siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion : '';
};

const getStackForLinux = (siteConfig: ArmObj<SiteConfig>) => {
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

const getStackAndVersionForLinux = (siteConfig: ArmObj<SiteConfig>): StackAndVersion => {
  const stackData = { runtimeStack: '', runtimeVersion: '' };

  stackData.runtimeStack = getStackForLinux(siteConfig);
  stackData.runtimeVersion = getStackVersionForLinux(siteConfig);

  return stackData;
};
