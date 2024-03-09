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
  GitHubActionsCodeDeploymentsRow,
  CodeDeploymentsRow,
  DeploymentProperties,
} from '../DeploymentCenter.types';
import { ArmArray, ArmObj } from '../../../../models/arm-obj';
import { ScmType, SiteConfig } from '../../../../models/site/config';
import { KeyValue } from '../../../../models/portal-models';
import { RuntimeStacks, JavaContainers } from '../../../../utils/stacks-utils';
import { IDeploymentCenterPublishingContext } from '../authentication/DeploymentCenterPublishingContext';
import { ArmSiteDescriptor } from '../../../../utils/resourceDescriptors';
import { PublishingCredentials } from '../../../../models/site/publish';
import { LogLevel, TelemetryInfo } from '../../../../models/telemetry';
import { LogCategories } from '../../../../utils/LogCategories';
import { FieldProps, FormikProps } from 'formik';
import { IDeploymentCenterContext } from '../DeploymentCenterContext';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { deploymentCenterDescriptionTextStyle } from '../DeploymentCenter.styles';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { ISelectableOption, Link } from '@fluentui/react';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import PortalCommunicator from '../../../../portal-communicator';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import DeploymentCenterData from '../DeploymentCenter.data';
import { ISiteState } from '../../../../SiteState';
import { Guid } from '../../../../utils/Guid';
import { truncate } from 'lodash-es';
import { isSameLocation } from '../../../../utils/location';
import { toASCII } from 'punycode';

export const getRuntimeStackSetting = (
  isLinuxApp: boolean,
  isFunctionApp: boolean,
  isKubeApp: boolean,
  isWordPressApp: boolean,
  siteConfig?: ArmObj<SiteConfig>,
  configMetadata?: ArmObj<KeyValue<string>>,
  applicationSettings?: ArmObj<KeyValue<string>>
): RuntimeStackSetting => {
  if ((isLinuxApp || isKubeApp) && !!siteConfig) {
    return getRuntimeStackSettingForLinux(isFunctionApp, isWordPressApp, siteConfig);
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
  } else if ((stack === RuntimeStacks.dotnet || stack === RuntimeStacks.dotnetIsolated) && metadataStack !== RuntimeStacks.dotnetcore) {
    // NOTE(michinoy): This could be either .NET 5 or ASP .NET V*
    return siteConfig.properties.netFrameworkVersion;
  } else if (metadataStack === RuntimeStacks.dotnetcore) {
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

  stackData.runtimeVersion =
    getRuntimeStackVersionForWindows(stackData.runtimeStack, configMetadata, siteConfig, applicationSettings) ?? '';

  return stackData;
};

const getRuntimeStackVersionForLinux = (siteConfig: ArmObj<SiteConfig>, isFunctionApp: boolean, isWordPressApp: boolean) => {
  // NOTE(stpelleg): Java is special, so need to handle it carefully.
  if (!siteConfig.properties.linuxFxVersion) {
    return '';
  }
  let linuxFxVersion = siteConfig.properties.linuxFxVersion;
  if (isWordPressApp) {
    linuxFxVersion = CommonConstants.WordPressLinuxFxVersionsMapping[linuxFxVersion.toLocaleLowerCase()] ||  linuxFxVersion;
  }

  const linuxFxVersionParts = linuxFxVersion ? linuxFxVersion.split('|') : [];
  const runtimeStack = linuxFxVersionParts.length > 0 ? linuxFxVersionParts[0].toLocaleLowerCase() : '';

  // NOTE(zmohammed): We need to handle two different linuxFxVersion formats: 'WORDPRESS|tag' and 'DOCKER|image:tag'
  if (isWordPressApp && linuxFxVersionParts.length > 1) {
    if (runtimeStack === RuntimeStackOptions.WordPress) {
      return linuxFxVersionParts[1]?.toLocaleLowerCase() ?? '';
    } else {
      const fxVersionParts = linuxFxVersionParts[1]?.toLocaleLowerCase().split(':') ?? [];
      return fxVersionParts.length === 2 ? fxVersionParts[1].toLocaleLowerCase() : '';
    }
  }

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

const getWebAppRuntimeStackForLinux = (siteConfig: ArmObj<SiteConfig>, isWordPressApp: boolean) => {
  if (isWordPressApp) {
    return RuntimeStackOptions.WordPress;
  }
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

const getRuntimeStackSettingForLinux = (
  isFunctionApp: boolean,
  isWordPressApp: boolean,
  siteConfig: ArmObj<SiteConfig>
): RuntimeStackSetting => {
  const stackData = { runtimeStack: '', runtimeVersion: '' };

  stackData.runtimeStack = isFunctionApp
    ? getFunctionAppRuntimeStackForLinux(siteConfig)
    : getWebAppRuntimeStackForLinux(siteConfig, isWordPressApp);

  stackData.runtimeVersion = getRuntimeStackVersionForLinux(siteConfig, isFunctionApp, isWordPressApp) ?? '';

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
  startingAuth: () => void = () => {
    /** @note (joechung): Do nothing before starting authorization. */
  },
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
  // NOTE(yoonaoh): If we have an invalid scmType for containers, we will default to None.
  // We also only want to enable the save button when we start from None because the other scmTypes
  // should show configured views and not the editable settings.
  const isScmTypeNone =
    deploymentCenterContext?.siteConfig && isScmTypeValidForContainers(deploymentCenterContext.siteConfig.properties.scmType)
      ? deploymentCenterContext.siteConfig.properties.scmType === ScmType.None
      : true;
  return (
    (isContainerGeneralSettingsDirty(formProps) ||
      (formProps.values.registrySource === ContainerRegistrySources.privateRegistry && isPrivateRegistrySettingsDirty(formProps)) ||
      (formProps.values.registrySource === ContainerRegistrySources.docker && isDockerSettingsDirty(formProps)) ||
      (formProps.values.registrySource === ContainerRegistrySources.acr && isAcrSettingsDirty(formProps))) &&
    isScmTypeNone
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
    formProps.values.acrManagedIdentityClientId !== formProps.initialValues.acrManagedIdentityClientId ||
    formProps.values.acrVnetImagePullSetting !== formProps.initialValues.acrVnetImagePullSetting
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
  if (currentUser) {
    // NOTE(yoonaoh): Publishing username and password can be null
    // causing the equality check to find null !== '' when both are functionally the same
    currentUser.properties.publishingUserName = currentUser.properties.publishingUserName ?? '';
    currentUser.properties.publishingPassword = currentUser.properties.publishingPassword ?? '';
  }
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
    case RuntimeStackOptions.Go:
      return RuntimeStackDisplayNames.Go;
    case RuntimeStackOptions.WordPress:
      return RuntimeStackDisplayNames.WordPress;
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

export const optionsSortingFunction = (a: ISelectableOption, b: ISelectableOption) => a.text.localeCompare(b.text);
export const ignoreCaseSortingFunction = (a: string, b: string) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());

export function formikOnBlur<T>(e: React.FocusEvent<T>, props: FieldProps) {
  const { field, form } = props;
  form.setFieldTouched(field.name);
  field.onBlur(e);
}

export const fetchDeploymentLogs = async (
  resourceId: string,
  deploymentCenterData: DeploymentCenterData,
  siteStateContext: ISiteState,
  setDeployments: (value?: React.SetStateAction<ArmArray<DeploymentProperties>>) => void,
  setDeploymentsError: (value?: React.SetStateAction<string | undefined>) => void,
  t: any
) => {
  // NOTE(michinoy): We should prevent adding logs for this method. The reason is because it is called
  // on a frequency, currently it is set to 30 seconds.
  const deploymentsResponse = await deploymentCenterData.getSiteDeployments(resourceId);

  if (deploymentsResponse.metadata.success) {
    setDeployments(deploymentsResponse.data);
  } else if (!siteStateContext.isKubeApp) {
    const errorMessage = getErrorMessage(deploymentsResponse.metadata.error);
    setDeploymentsError(
      errorMessage ? t('deploymentCenterCodeDeploymentsFailedWithError').format(errorMessage) : t('deploymentCenterCodeDeploymentsFailed')
    );
  }
};

export const refreshLogsWithDelay = async (refreshLogs: () => void, ms: number = 3000) => {
  const sleepPromise = new Promise(resolve => setTimeout(resolve, ms));
  return await sleepPromise.then(refreshLogs);
};

export const deleteDeploymentCenterLogs = async (
  portalContext: PortalCommunicator,
  deploymentCenterContext: IDeploymentCenterContext,
  deploymentCenterData: DeploymentCenterData,
  selectedLogs: GitHubActionsCodeDeploymentsRow[] | CodeDeploymentsRow[],
  refreshLogs: () => void,
  t: any,
  org?: string,
  repo?: string
) => {
  const notificationId = portalContext.startNotification(
    t('deploymentCenterDeleteLogsNotificationTitle'),
    t('deploymentCenterDeleteLogsNotificationDescription')
  );

  const promises = selectedLogs.map(async log => {
    if (typeof log.id === 'string') {
      portalContext.log(
        getTelemetryInfo('info', 'deletingKuduLog', 'submit', {
          publishType: 'code',
        })
      );
      return await deploymentCenterData.deleteSiteDeployment(log.id);
    } else if (typeof log.id === 'number' && org && repo) {
      portalContext.log(
        getTelemetryInfo('info', 'deletingGitHubActionsWorkflowRun', 'submit', {
          publishType: 'code',
        })
      );
      return await deploymentCenterData.deleteWorkflowRun(deploymentCenterContext.gitHubToken, org, repo, log.id);
    }
  });
  const responses = await Promise.all(promises);

  if (responses.some(response => !response?.metadata.success)) {
    const errorMessages = responses
      .filter(response => !response?.metadata.success)
      .map(response => getErrorMessage(response?.metadata.error));
    const message = errorMessages.join(' - ');
    const description =
      errorMessages.length > 0
        ? t('deploymentCenterDeleteLogsFailureWithErrorNotificationDescription').format(message)
        : t('deploymentCenterDeleteLogsFailureNotificationDescription');
    await refreshLogsWithDelay(refreshLogs);
    portalContext.stopNotification(notificationId, false, description);
    portalContext.log(getTelemetryInfo('error', 'deleteLogs', 'failed'));
  } else {
    await refreshLogsWithDelay(refreshLogs);
    portalContext.stopNotification(notificationId, true, t('deploymentCenterDeleteLogsSuccessNotificationDescription'));
  }
};

export const getAcrNameFromLoginServer = (loginServer: string): string => {
  const loginServerParts = loginServer?.split('.') ?? [];
  return loginServerParts.length > 0 ? loginServerParts[0] : '';
};

// The name of a federated identity credentials must be within 3 and 120 characters
// only contains letters (A-Z, a-z), numbers, hyphens and dashes and must start with
// a number or letter.
export const getFederatedCredentialName = (fullRepoName: string): string => {
  const guid = Guid.newTinyGuid();
  let name = `${fullRepoName}-${guid}`;

  if (name.length > 120) {
    name = `${truncate(fullRepoName, { length: 120 - `fc--${guid}`.length, omission: '' })}-${guid}`;
  }

  // Remove characters that are not letters, numbers, hyphens, or dashes
  name = name.replace(/[^a-zA-Z0-9-]/g, '');

  // Ensure the string starts with a letter or number
  if (name && !/^[a-zA-Z0-9]/.test(name)) {
    return 'fc-' + name.slice(1);
  }

  return name;
};

export const getUserAssignedIdentityName = (appName: string): string => {
  const guid = Guid.newTinyGuid();
  const encodedAppName = toASCII(appName);
  if (`${encodedAppName}-id-${guid}`.length > 24) {
    return `${truncate(encodedAppName, { length: 24 - `-id-${guid}`.length, omission: '' })}-id-${guid}`;
  }

  return `${encodedAppName}-id-${guid}`;
};

export const isScmTypeValidForContainers = (scmType: ScmType): boolean => {
  return scmType === ScmType.None || scmType === ScmType.GitHubAction || scmType === ScmType.Vsts;
};

export const isFederatedCredentialsSupported = (identityLocation: string): boolean => {
  const unsupportedRegions = [
    'germanynorth',
    'swedensouth',
    'swedencentral',
    'eastasia',
    'qatarcentral',
    'brazilsoutheast',
    'malaysiasouth',
    'polandcentral',
  ];

  return !unsupportedRegions.some(region => isSameLocation(region, identityLocation));
};
