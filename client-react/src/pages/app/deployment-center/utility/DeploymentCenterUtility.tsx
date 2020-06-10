import { RuntimeStacks, JavaVersions, JavaContainers, StackAndVersion } from '../DeploymentCenter.types';
import { ArmObj } from '../../../../models/arm-obj';
import { SiteConfig } from '../../../../models/site/config';
import { KeyValue } from '../../../../models/portal-models';

export const setStackAndVersion = (
  isLinuxApplication: boolean,
  siteConfig?: ArmObj<SiteConfig>,
  configMetadata?: ArmObj<KeyValue<string>>,
  applicationSettings?: ArmObj<KeyValue<string>>
): StackAndVersion => {
  if (isLinuxApplication) {
    return setStackAndVersionForLinux(siteConfig);
  } else {
    return setStackAndVersionForWindows(siteConfig, configMetadata, applicationSettings);
  }
};

const setStackAndVersionForWindows = (
  siteConfig?: ArmObj<SiteConfig>,
  configMetadata?: ArmObj<KeyValue<string>>,
  applicationSettings?: ArmObj<KeyValue<string>>
): StackAndVersion => {
  let stack = '';
  let stackVersion = '';
  if (configMetadata && configMetadata['CURRENT_STACK']) {
    const metadataStack = configMetadata['CURRENT_STACK'].toLowerCase();

    // NOTE(michinoy): Java is special, so need to handle it carefully. Also in this case, use
    // the string 'java' rather than any of the constants defined as it is not related to any of the
    // defined constants.
    if (metadataStack === 'java') {
      stack = siteConfig && siteConfig.properties.javaVersion === JavaVersions.WindowsVersion8 ? RuntimeStacks.java8 : RuntimeStacks.java11;
    } else {
      stack = metadataStack;
    }
  }

  if (applicationSettings && stack === RuntimeStacks.node) {
    stackVersion = applicationSettings.properties['WEBSITE_NODE_DEFAULT_VERSION'];
  } else if (siteConfig && stack === RuntimeStacks.python) {
    stackVersion = siteConfig.properties.pythonVersion;
  } else if (siteConfig && (stack === RuntimeStacks.java8 || stack === RuntimeStacks.java11)) {
    stackVersion = `${siteConfig.properties.javaVersion}|${siteConfig.properties.javaContainer}|${
      siteConfig.properties.javaContainerVersion
    }`;
  } else if (stack === '') {
    stackVersion = '';
  }

  return { runtimeStack: stack, runtimeVersion: stackVersion };
};

const setStackAndVersionForLinux = (siteConfig?: ArmObj<SiteConfig>): StackAndVersion => {
  let stack = '';
  let stackVersion = '';

  const linuxFxVersionParts = siteConfig && siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion.split('|') : [];
  const runtimeStack = linuxFxVersionParts.length > 0 ? linuxFxVersionParts[0].toLocaleLowerCase() : '';

  // NOTE(michinoy): Java is special, so need to handle it carefully.
  if (runtimeStack === JavaContainers.JavaSE || runtimeStack === JavaContainers.Tomcat) {
    const fxVersionParts = siteConfig && !!siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion.split('-') : [];
    const fxStack = fxVersionParts.length === 2 ? fxVersionParts[1].toLocaleLowerCase() : '';
    if (fxStack === JavaVersions.LinuxVersion8 || fxStack === JavaVersions.LinuxVersion11) {
      stack = fxStack === JavaVersions.LinuxVersion8 ? RuntimeStacks.java8 : RuntimeStacks.java11;
    } else {
      stack = '';
    }
  } else {
    stack = runtimeStack;
  }

  stackVersion = siteConfig && !!siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion : '';

  return { runtimeStack: stack, runtimeVersion: stackVersion };
};
