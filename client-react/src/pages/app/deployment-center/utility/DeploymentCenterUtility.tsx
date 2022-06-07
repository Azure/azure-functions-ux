import {
  RuntimeStackSetting,
  AuthorizationResult,
  DeploymentCenterFormData,
  DeploymentCenterContainerFormData,
  ContainerRegistrySources,
  RuntimeVersionOptions,
  RuntimeVersionDisplayNames,
  RuntimeStackOptions,
  RuntimeStackDisplayNames,
  JavaContainerDisplayNames,
} from '../DeploymentCenter.types';
import { ArmObj } from '../../../../models/arm-obj';
import { ScmType, SiteConfig } from '../../../../models/site/config';
import { KeyValue } from '../../../../models/portal-models';
import { RuntimeStacks, JavaContainers } from '../../../../utils/stacks-utils';
import { IDeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { ArmSiteDescriptor } from '../../../../utils/resourceDescriptors';
import { PublishingCredentials } from '../../../../models/site/publish';
import { LogLevel, TelemetryInfo } from '../../../../models/telemetry';
import { LogCategories } from '../../../../utils/LogCategories';
import { FormikProps } from 'formik';
import { IDeploymentCenterContext } from '../DeploymentCenterContext';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { deploymentCenterDescriptionTextStyle } from '../DeploymentCenter.styles';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { Link } from '@fluentui/react';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';

export const getLogId = (component: string, event: string): string => {
  return `${component}/${event}`;
};

export const getRuntimeStackSetting = (
  isLinuxApp: boolean,
  isFunctionApp: boolean,
  isKubeApp: boolean,
  siteConfig?: ArmObj<SiteConfig>,
  configMetadata?: ArmObj<KeyValue<string>>,
  applicationSettings?: ArmObj<KeyValue<string>>
): RuntimeStackSetting => {
  if ((isLinuxApp || isKubeApp) && !!siteConfig) {
    return getRuntimeStackSettingForLinux(isFunctionApp, siteConfig);
  } else if (!isLinuxApp && !isKubeApp && !!siteConfig && !!configMetadata && !!applicationSettings) {
    return getRuntimeStackSettingForWindows(isFunctionApp, siteConfig, configMetadata, applicationSettings);
  } else {
    return { runtimeStack: '', runtimeVersion: '' };
  }
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
  const metadataStack =
    configMetadata.properties[DeploymentCenterConstants.metadataCurrentStack] &&
    configMetadata.properties[DeploymentCenterConstants.metadataCurrentStack].toLocaleLowerCase();

  if (stack === RuntimeStacks.node) {
    return applicationSettings.properties[DeploymentCenterConstants.appSettings_WEBSITE_NODE_DEFAULT_VERSION];
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
  } else if (stack === RuntimeStacks.php) {
    return siteConfig.properties.phpVersion || '';
  } else {
    return '';
  }
};

const getWebAppRuntimeStackForWindows = (configMetadata: ArmObj<KeyValue<string>>) => {
  if (configMetadata.properties[DeploymentCenterConstants.metadataCurrentStack]) {
    const metadataStack = configMetadata.properties[DeploymentCenterConstants.metadataCurrentStack].toLocaleLowerCase();

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

  return runtime ?? '';
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

const getRuntimeStackVersionForLinux = (siteConfig: ArmObj<SiteConfig>, isFunctionApp: boolean) => {
  // NOTE(stpelleg): Java is special, so need to handle it carefully.
  if (!siteConfig.properties.linuxFxVersion) {
    return '';
  }
  const linuxFxVersionParts = siteConfig.properties.linuxFxVersion ? siteConfig.properties.linuxFxVersion.split('|') : [];
  const runtimeStack = linuxFxVersionParts.length > 0 ? linuxFxVersionParts[0].toLocaleLowerCase() : '';

  if (runtimeStack === JavaContainers.JavaSE || runtimeStack === JavaContainers.Tomcat || runtimeStack === JavaContainers.JBoss) {
    let fxVersionParts: string[];
    if (isFunctionApp) {
      fxVersionParts = linuxFxVersionParts;
    } else {
      fxVersionParts = siteConfig.properties.linuxFxVersion?.split('-') ?? [];
    }
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
  return runtimeStack === 'dotnetcore' || runtimeStack === 'dotnet' || runtimeStack === 'dotnet-isolated'
    ? RuntimeStacks.dotnet
    : runtimeStack;
};

const getRuntimeStackSettingForLinux = (isFunctionApp: boolean, siteConfig: ArmObj<SiteConfig>): RuntimeStackSetting => {
  const stackData = { runtimeStack: '', runtimeVersion: '' };

  stackData.runtimeStack = isFunctionApp ? getFunctionAppRuntimeStackForLinux(siteConfig) : getWebAppRuntimeStackForLinux(siteConfig);

  stackData.runtimeVersion = getRuntimeStackVersionForLinux(siteConfig, isFunctionApp);

  return stackData;
};

export const getArmToken = () => {
  return window.appsvc && window.appsvc.env.armToken ? `bearer ${window.appsvc.env.armToken}` : '';
};

export const getArmEndpoint = () => {
  return window.appsvc && window.appsvc.env && window.appsvc.env.azureResourceManagerEndpoint;
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
      try {
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
      } catch {
        // Do nothing
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
    return `${publishingCredentialsArmObj.properties.scmUri}/api/registry/webhook`;
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

export const isSettingsDirty = (
  formProps: FormikProps<DeploymentCenterFormData<DeploymentCenterContainerFormData>>,
  deploymentCenterContext: IDeploymentCenterContext
): boolean => {
  return (
    (isContainerGeneralSettingsDirty(formProps) ||
      (formProps.values.registrySource === ContainerRegistrySources.privateRegistry && isPrivateRegistrySettingsDirty(formProps)) ||
      (formProps.values.registrySource === ContainerRegistrySources.docker && isDockerSettingsDirty(formProps)) ||
      (formProps.values.registrySource === ContainerRegistrySources.acr && isAcrSettingsDirty(formProps))) &&
    !!deploymentCenterContext.siteConfig &&
    deploymentCenterContext.siteConfig.properties.scmType === ScmType.None
  );
};

const isPrivateRegistrySettingsDirty = (formProps: FormikProps<DeploymentCenterFormData<DeploymentCenterContainerFormData>>): boolean => {
  return (
    formProps.values.privateRegistryServerUrl !== formProps.initialValues.privateRegistryServerUrl ||
    formProps.values.privateRegistryUsername !== formProps.initialValues.privateRegistryUsername ||
    formProps.values.privateRegistryPassword !== formProps.initialValues.privateRegistryPassword ||
    formProps.values.privateRegistryImageAndTag !== formProps.initialValues.privateRegistryImageAndTag ||
    formProps.values.privateRegistryComposeYml !== formProps.initialValues.privateRegistryComposeYml
  );
};

const isDockerSettingsDirty = (formProps: FormikProps<DeploymentCenterFormData<DeploymentCenterContainerFormData>>): boolean => {
  return (
    formProps.values.dockerHubAccessType !== formProps.initialValues.dockerHubAccessType ||
    formProps.values.dockerHubImageAndTag !== formProps.initialValues.dockerHubImageAndTag ||
    formProps.values.dockerHubComposeYml !== formProps.initialValues.dockerHubComposeYml
  );
};

const isAcrSettingsDirty = (formProps: FormikProps<DeploymentCenterFormData<DeploymentCenterContainerFormData>>): boolean => {
  return (
    formProps.values.acrLoginServer !== formProps.initialValues.acrLoginServer ||
    formProps.values.acrImage !== formProps.initialValues.acrImage ||
    formProps.values.acrTag !== formProps.initialValues.acrTag ||
    formProps.values.acrComposeYml !== formProps.initialValues.acrComposeYml ||
    formProps.values.acrCredentialType !== formProps.initialValues.acrCredentialType ||
    formProps.values.acrManagedIdentityType !== formProps.initialValues.acrManagedIdentityType
  );
};

const isContainerGeneralSettingsDirty = (formProps: FormikProps<DeploymentCenterFormData<DeploymentCenterContainerFormData>>): boolean => {
  return (
    formProps.values.scmType !== formProps.initialValues.scmType ||
    formProps.values.option !== formProps.initialValues.option ||
    formProps.values.registrySource !== formProps.initialValues.registrySource ||
    formProps.values.continuousDeploymentOption !== formProps.initialValues.continuousDeploymentOption ||
    formProps.values.command !== formProps.initialValues.command
  );
};

export const isFtpsDirty = (
  formProps: FormikProps<DeploymentCenterFormData<DeploymentCenterContainerFormData>>,
  deploymentCenterPublishingContext: IDeploymentCenterPublishingContext
): boolean => {
  const currentUser = deploymentCenterPublishingContext.publishingUser;
  const formPropsExist =
    (!!formProps.values.publishingUsername || formProps.values.publishingUsername === '') &&
    (!!formProps.values.publishingPassword || formProps.values.publishingPassword === '') &&
    (!!formProps.values.publishingConfirmPassword || formProps.values.publishingConfirmPassword === '');

  return (
    !!currentUser &&
    formPropsExist &&
    (currentUser.properties.publishingUserName !== formProps.values.publishingUsername ||
      (!!formProps.values.publishingPassword && currentUser.properties.publishingPassword !== formProps.values.publishingPassword))
  );
};

export const getDefaultVersionDisplayName = (version: string, isLinuxApp: boolean) => {
  return isLinuxApp ? getLinuxDefaultVersionDisplayName(version) : getWindowsDefaultVersionDisplayName(version);
};

export const getLinuxDefaultVersionDisplayName = (version: string) => {
  //NOTE(stpelleg): Java is different
  if (version === RuntimeVersionOptions.Java17) {
    return RuntimeVersionDisplayNames.Java17;
  } else if (version === RuntimeVersionOptions.Java11) {
    return RuntimeVersionDisplayNames.Java11;
  } else if (version === RuntimeVersionOptions.Java8) {
    return RuntimeVersionDisplayNames.Java8;
  }
  const versionNameParts: string[] = version.toLocaleLowerCase().split('|');

  return versionNameParts.length === 2
    ? `${getRuntimeStackDisplayName(versionNameParts[0])} ${versionNameParts[1].replace(CommonConstants.Hyphen, ' ').toUpperCase()}`
    : version;
};

export const getWindowsDefaultVersionDisplayName = (version: string) => {
  return version.replace(CommonConstants.Hyphen, ' ');
};

export const getRuntimeStackDisplayName = (stack: string) => {
  const stackName = stack.toLocaleLowerCase();
  switch (stackName) {
    case RuntimeStackOptions.Python:
      return RuntimeStackDisplayNames.Python;
    case RuntimeStackOptions.DotNetCore:
      return RuntimeStackDisplayNames.DotNetCore;
    case RuntimeStackOptions.Ruby:
      return RuntimeStackDisplayNames.Ruby;
    case RuntimeStackOptions.Java:
      return RuntimeStackDisplayNames.Java;
    case RuntimeStackOptions.Node:
      return RuntimeStackDisplayNames.Node;
    case RuntimeStackOptions.PHP:
      return RuntimeStackDisplayNames.PHP;
    case RuntimeStackOptions.AspDotNet:
      return RuntimeStackDisplayNames.AspDotNet;
    case RuntimeStackOptions.Dotnet:
      return RuntimeStackDisplayNames.Dotnet;
    case RuntimeStackOptions.DotnetIsolated:
      return RuntimeStackDisplayNames.DotnetIsolated;
    default:
      return '';
  }
};

export const getJavaContainerDisplayName = (stack: string) => {
  const stackName = stack.toLocaleLowerCase();
  switch (stackName) {
    case JavaContainers.JavaSE:
      return JavaContainerDisplayNames.JavaSE;
    case JavaContainers.Tomcat:
      return JavaContainerDisplayNames.Tomcat;
    case JavaContainers.JBoss:
      return JavaContainerDisplayNames.JBoss;
    default:
      return '';
  }
};

export const getDescriptionSection = (source: string, description: string, learnMoreLink?: string, learnMoreText?: string) => {
  return (
    <p className={deploymentCenterDescriptionTextStyle}>
      <span id={`deployment-center-${source}-description-text`}>{description}</span>
      {!!learnMoreLink && !!learnMoreText && (
        <Link
          id={`deployment-center-${source}-description-text-learnMore`}
          href={learnMoreLink}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby={`deployment-center-${source}-learnMore-link`}>
          {` ${learnMoreText}`}
        </Link>
      )}
    </p>
  );
};
