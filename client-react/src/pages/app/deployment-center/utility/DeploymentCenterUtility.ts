import { RuntimeStackSetting, AuthorizationResult } from '../DeploymentCenter.types';
import { ArmObj } from '../../../../models/arm-obj';
import { SiteConfig } from '../../../../models/site/config';
import { KeyValue } from '../../../../models/portal-models';
import { RuntimeStacks, JavaContainers } from '../../../../utils/stacks-utils';
import { IDeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { ArmSiteDescriptor } from '../../../../utils/resourceDescriptors';
import { PublishingCredentials } from '../../../../models/site/publish';

export const getLogId = (component: string, event: string): string => {
  return `${component}/${event}`;
};

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
  } else if (stack === RuntimeStacks.java) {
    const javaVersion = siteConfig.properties.javaVersion.replace('1.8', '8.0');
    return javaVersion === '11' ? '11.0' : javaVersion;
  } else {
    return '';
  }
};

const getRuntimeStackForWindows = (configMetadata: ArmObj<KeyValue<string>>) => {
  if (configMetadata.properties['CURRENT_STACK']) {
    const metadataStack = configMetadata.properties['CURRENT_STACK'].toLowerCase();

    // NOTE(michinoy): Java is special, so need to handle it carefully. Also in this case, use
    // the string 'java' rather than any of the constants defined as it is not related to any of the
    // defined constants.
    if (metadataStack === 'dotnet') {
      return RuntimeStacks.aspdotnet;
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

  stackData.runtimeStack = getRuntimeStackForWindows(configMetadata);
  stackData.runtimeVersion = getRuntimeStackVersionForWindows(stackData.runtimeStack, siteConfig, applicationSettings);

  return stackData;
};

const getRuntimeStackVersionForLinux = (siteConfig: ArmObj<SiteConfig>) => {
  // NOTE(stpelleg): Java is special, so need to handle it carefully.
  if (!siteConfig.properties.linuxFxVersion) {
    return '';
  }
  const linuxFxVersionParts = siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion.split('|') : [];
  const runtimeStack = linuxFxVersionParts.length > 0 ? linuxFxVersionParts[0].toLocaleLowerCase() : '';

  if (runtimeStack === JavaContainers.JavaSE || runtimeStack === JavaContainers.Tomcat || runtimeStack === JavaContainers.JBoss) {
    const fxVersionParts = !!siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion.split('-') : [];
    return fxVersionParts.length === 2 ? fxVersionParts[1].toLocaleLowerCase() : '';
  }

  return siteConfig.properties.linuxFxVersion;
};

const getRuntimeStackForLinux = (siteConfig: ArmObj<SiteConfig>) => {
  const linuxFxVersionParts = siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion.split('|') : [];
  const runtimeStack = linuxFxVersionParts.length > 0 ? linuxFxVersionParts[0].toLocaleLowerCase() : '';

  // NOTE(michinoy): Java is special, so need to handle it carefully.
  if (runtimeStack === JavaContainers.JavaSE || runtimeStack === JavaContainers.Tomcat || runtimeStack === JavaContainers.JBoss) {
    return RuntimeStacks.java;
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

export const authorizeWithProvider = (
  providerAuthUrl: string,
  startingAuth: () => void,
  completingAuthCallback: (authResult: AuthorizationResult) => void
) => {
  const oauthWindow = window.open(providerAuthUrl, 'appservice-deploymentcenter-provider-auth', 'width=800, height=600');

  const authWindowsPromise = new Promise<AuthorizationResult>(resolve => {
    startingAuth();

    // Check for authorization status every 100 ms.
    const timerId = setInterval(() => {
      if (oauthWindow && oauthWindow.document && oauthWindow.document.URL && oauthWindow.document.URL.indexOf(`/callback`) !== -1) {
        resolve({
          timerId,
          redirectUrl: oauthWindow.document.URL,
        });
      } else if (oauthWindow && oauthWindow.closed) {
        resolve({
          timerId,
        });
      }
    }, 100);

    // If no activity after 60 seconds, turn off the timer and close the auth window.
    setTimeout(() => {
      resolve({
        timerId,
      });
    }, 60000);
  });

  authWindowsPromise.then(authorizationResult => {
    clearInterval(authorizationResult.timerId);
    oauthWindow && oauthWindow.close();

    completingAuthCallback(authorizationResult);
  });
};

export const getGitCloneUri = (deploymentCenterPublishingContext: IDeploymentCenterPublishingContext): string | undefined => {
  if (
    deploymentCenterPublishingContext.publishingCredentials &&
    deploymentCenterPublishingContext.publishingCredentials.properties &&
    deploymentCenterPublishingContext.publishingCredentials.name
  ) {
    const scmUriParts = deploymentCenterPublishingContext.publishingCredentials.properties.scmUri.split('@');
    const siteName = deploymentCenterPublishingContext.publishingCredentials.name;

    if (scmUriParts.length >= 2) {
      return `https://${scmUriParts[1]}:443/${siteName}.git`;
    }
  }
  return undefined;
};

export const getAppDockerWebhookUrl = (publishingCredentialsArmObj: ArmObj<PublishingCredentials>) => {
  if (publishingCredentialsArmObj.properties.scmUri) {
    return `${publishingCredentialsArmObj.properties.scmUri}/docker/hook`;
  }

  return '';
};

export const getAcrWebhookName = (siteDescriptor: ArmSiteDescriptor) => {
  // NOTE(michinoy): The name has to follow a certain pattern expected by the ACR webhook API contract
  // https://docs.microsoft.com/en-us/rest/api/containerregistry/webhooks/update
  // Requirements - only alpha numeric characters, length between 5 - 50 characters.
  const acrWebhookNameRegex = /[^a-zA-Z0-9]/g;
  const acrWebhookNameMaxLength = 50;

  let resourceName = siteDescriptor.site.replace(acrWebhookNameRegex, '');

  if (siteDescriptor.slot) {
    resourceName += siteDescriptor.slot.replace(acrWebhookNameRegex, '');
  }

  return `webapp${resourceName}`.substring(0, acrWebhookNameMaxLength);
};
