import { RuntimeStackSetting, AuthorizationResult } from '../DeploymentCenter.types';
import { ArmObj } from '../../../../models/arm-obj';
import { SiteConfig } from '../../../../models/site/config';
import { KeyValue } from '../../../../models/portal-models';
import { RuntimeStacks, JavaContainers } from '../../../../utils/stacks-utils';
import { IDeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { ArmSiteDescriptor } from '../../../../utils/resourceDescriptors';
import { PublishingCredentials } from '../../../../models/site/publish';
import { LogLevel, TelemetryInfo } from '../../../../models/telemetry';
import { LogCategories } from '../../../../utils/LogCategories';

export const getLogId = (component: string, event: string): string => {
  return `${component}/${event}`;
};

export const getRuntimeStackSetting = (
  isLinuxApp: boolean,
  isFunctionApp: boolean,
  siteConfig: ArmObj<SiteConfig>,
  configMetadata: ArmObj<KeyValue<string>>,
  applicationSettings: ArmObj<KeyValue<string>>
): RuntimeStackSetting => {
  return isLinuxApp
    ? getRuntimeStackSettingForLinux(isFunctionApp, siteConfig)
    : getRuntimeStackSettingForWindows(isFunctionApp, siteConfig, configMetadata, applicationSettings);
};

export const getTelemetryInfo = (
  logLevel: LogLevel,
  action: string,
  actionModifier: string,
  data?: KeyValue<string | undefined>
): TelemetryInfo => {
  const identifiers = window.appsvc
    ? {
        resourceId: window.appsvc.resourceId,
        version: window.appsvc.version,
        sessionId: window.appsvc.sessionId,
        feature: window.appsvc.feature,
      }
    : {};

  const dataContent = data ? data : {};

  return {
    action,
    actionModifier,
    logLevel,
    resourceId: identifiers.resourceId ? identifiers.resourceId : '',
    data: {
      category: LogCategories.deploymentCenter,
      ...dataContent,
      ...identifiers,
    },
  };
};

const getRuntimeStackVersionForWindows = (
  stack: string,
  configMetadata: ArmObj<KeyValue<string>>,
  siteConfig: ArmObj<SiteConfig>,
  applicationSettings: ArmObj<KeyValue<string>>
) => {
  const metadataStack = configMetadata.properties['CURRENT_STACK'] && configMetadata.properties['CURRENT_STACK'].toLocaleLowerCase();

  if (stack === RuntimeStacks.node) {
    return applicationSettings.properties['WEBSITE_NODE_DEFAULT_VERSION'];
  } else if (stack === RuntimeStacks.python) {
    return siteConfig.properties.pythonVersion;
  } else if (stack === RuntimeStacks.java) {
    const javaVersion = siteConfig.properties.javaVersion.replace('1.8', '8.0');
    return javaVersion === '11' ? '11.0' : javaVersion;
  } else if (stack === RuntimeStacks.powershell) {
    return siteConfig.properties.powerShellVersion || '';
  } else if (stack === RuntimeStacks.dotnet && metadataStack !== 'dotnetcore') {
    // NOTE(michinoy): This could be either .NET 5 or ASP .NET V*
    return siteConfig.properties.netFrameworkVersion;
  } else if (metadataStack === 'dotnetcore') {
    // NOTE(michinoy): Due to the entire .NET dropdown now containing all .NET versions (.NET, ASP.NET, and .NETCORE)
    // combined with the fact there is no storage of .NET CORE version, we now return an assumed value of the latest
    // .NET Core
    return '3.1';
  } else {
    return '';
  }
};

const getWebAppRuntimeStackForWindows = (configMetadata: ArmObj<KeyValue<string>>) => {
  if (configMetadata.properties['CURRENT_STACK']) {
    const metadataStack = configMetadata.properties['CURRENT_STACK'].toLocaleLowerCase();

    return metadataStack === 'dotnet' || metadataStack === 'dotnetcore' ? RuntimeStacks.dotnet : metadataStack;
  }

  return '';
};

const getFunctionAppRuntimeStackForWindows = (applicationSettings: ArmObj<KeyValue<string>>) => {
  const runtime =
    applicationSettings &&
    applicationSettings.properties &&
    applicationSettings.properties['FUNCTIONS_WORKER_RUNTIME'] &&
    applicationSettings.properties['FUNCTIONS_WORKER_RUNTIME'].toLocaleLowerCase();

  return !!runtime ? runtime : '';
};

const getRuntimeStackSettingForWindows = (
  isFunctionApp: boolean,
  siteConfig: ArmObj<SiteConfig>,
  configMetadata: ArmObj<KeyValue<string>>,
  applicationSettings: ArmObj<KeyValue<string>>
): RuntimeStackSetting => {
  const stackData = { runtimeStack: '', runtimeVersion: '' };

  stackData.runtimeStack = isFunctionApp
    ? getFunctionAppRuntimeStackForWindows(applicationSettings)
    : getWebAppRuntimeStackForWindows(configMetadata);

  stackData.runtimeVersion = getRuntimeStackVersionForWindows(stackData.runtimeStack, configMetadata, siteConfig, applicationSettings);

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

const getWebAppRuntimeStackForLinux = (siteConfig: ArmObj<SiteConfig>) => {
  const linuxFxVersionParts = siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion.split('|') : [];
  const runtimeStack = linuxFxVersionParts.length > 0 ? linuxFxVersionParts[0].toLocaleLowerCase() : '';

  // NOTE(michinoy): Java is special, so need to handle it carefully.
  if (runtimeStack === JavaContainers.JavaSE || runtimeStack === JavaContainers.Tomcat || runtimeStack === JavaContainers.JBoss) {
    return RuntimeStacks.java;
  } else {
    return runtimeStack === 'dotnetcore' || runtimeStack === 'dotnet' ? RuntimeStacks.dotnet : runtimeStack;
  }
};

const getFunctionAppRuntimeStackForLinux = (siteConfig: ArmObj<SiteConfig>) => {
  const linuxFxVersionParts = siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion.split('|') : [];
  const runtimeStack = linuxFxVersionParts.length > 0 ? linuxFxVersionParts[0].toLocaleLowerCase() : '';

  return runtimeStack === 'dotnetcore' || runtimeStack === 'dotnet' ? RuntimeStacks.dotnet : runtimeStack;
};

const getRuntimeStackSettingForLinux = (isFunctionApp: boolean, siteConfig: ArmObj<SiteConfig>): RuntimeStackSetting => {
  const stackData = { runtimeStack: '', runtimeVersion: '' };

  stackData.runtimeStack = isFunctionApp ? getFunctionAppRuntimeStackForLinux(siteConfig) : getWebAppRuntimeStackForLinux(siteConfig);

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

export const getSourceControlsWorkflowFileName = (branch: string, siteName: string, slotName?: string): string => {
  const normalizedBranchName = branch.split('/').join('-');
  return slotName ? `${normalizedBranchName}-${siteName}(${slotName}).yml` : `${normalizedBranchName}-${siteName}.yml`;
};

export const getSourceControlsWorkflowFilePath = (branch: string, siteName: string, slotName?: string): string => {
  return `.github/workflows/${getSourceControlsWorkflowFileName(branch, siteName, slotName)}`;
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

export const extractConfigFromFile = (input): Promise<string> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader && reader.result ? reader.result.toString() : '');
    };
    reader.readAsText(input.files[0]);
  });
};
