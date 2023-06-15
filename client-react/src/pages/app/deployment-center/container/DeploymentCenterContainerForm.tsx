import { Formik, FormikProps } from 'formik';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { ACRWebhookPayload } from '../../../../models/acr';
import { GitHubActionWorkflowRequestContent, GitHubCommit } from '../../../../models/github';
import { KeyValue } from '../../../../models/portal-models';
import { ScmType, SiteConfig } from '../../../../models/site/config';
import { AppOs } from '../../../../models/site/site';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import { CommonConstants, PrincipalType, RBACRoleId } from '../../../../utils/CommonConstants';
import { Guid } from '../../../../utils/Guid';
import DeploymentCenterData from '../DeploymentCenter.data';
import { commandBarSticky, pivotContent } from '../DeploymentCenter.styles';
import {
  ACRCredentialType,
  ContainerDockerAccessTypes,
  ContainerOptions,
  ContainerRegistrySources,
  DeploymentCenterContainerFormData,
  DeploymentCenterContainerFormProps,
  DeploymentCenterFormData,
  ManagedIdentityType,
  SettingOption,
  SiteSourceControlRequestBody,
  WorkflowOption,
} from '../DeploymentCenter.types';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import {
  getAcrWebhookName,
  getAppDockerWebhookUrl,
  getArmToken,
  getTelemetryInfo,
  getWorkflowFilePath,
  isFtpsDirty,
  isSettingsDirty,
} from '../utility/DeploymentCenterUtility';
import {
  getContainerAppWorkflowInformation,
  isApiSyncError,
  updateGitHubActionSourceControlPropertiesManually,
} from '../utility/GitHubActionUtility';
import DeploymentCenterContainerPivot from './DeploymentCenterContainerPivot';

interface ResponseResult {
  success: boolean;
  error?: any; //NOTE(michinoy): This needs to remain as 'any' as we do not know the schema of the error object
}

const DeploymentCenterContainerForm: React.FC<DeploymentCenterContainerFormProps> = props => {
  const { t } = useTranslation();

  const [isDiscardConfirmDialogVisible, setIsDiscardConfirmDialogVisible] = useState(false);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const portalContext = useContext(PortalContext);
  const siteContext = useContext(SiteStateContext);
  const deploymentCenterData = new DeploymentCenterData();

  const getServerUrl = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    if (values.registrySource === ContainerRegistrySources.acr) {
      return `https://${values.acrLoginServer}`;
    } else if (values.registrySource === ContainerRegistrySources.privateRegistry) {
      return values.privateRegistryServerUrl;
    } else {
      return DeploymentCenterConstants.dockerHubServerUrl;
    }
  };

  const getUsername = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    if (values.registrySource === ContainerRegistrySources.acr) {
      return values.acrUsername;
    } else if (values.registrySource === ContainerRegistrySources.privateRegistry) {
      return values.privateRegistryUsername;
    } else {
      return values.dockerHubAccessType === ContainerDockerAccessTypes.private ? values.dockerHubUsername : '';
    }
  };

  const getPassword = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    if (values.registrySource === ContainerRegistrySources.acr) {
      return values.acrPassword;
    } else if (values.registrySource === ContainerRegistrySources.privateRegistry) {
      return values.privateRegistryPassword;
    } else {
      return values.dockerHubAccessType === ContainerDockerAccessTypes.private ? values.dockerHubPassword : '';
    }
  };

  const getFxVersion = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    const prefix = getFxVersionPrefix(values);

    if (values.option === ContainerOptions.docker) {
      return getDockerFxVersion(prefix, values);
    } else if (values.option === ContainerOptions.compose) {
      return getDockerComposeFxVersion(prefix, values);
    } else {
      throw Error('Not implemented');
    }
  };

  const getDockerComposeFxVersion = (prefix: string, values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    if (values.registrySource === ContainerRegistrySources.acr) {
      return `${prefix}|${btoa(values.acrComposeYml)}`;
    } else if (values.registrySource === ContainerRegistrySources.privateRegistry) {
      return `${prefix}|${btoa(values.privateRegistryComposeYml)}`;
    } else {
      return `${prefix}|${btoa(values.dockerHubComposeYml)}`;
    }
  };

  const getDockerFxVersion = (prefix: string, values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    if (values.registrySource === ContainerRegistrySources.acr) {
      const serverImageTag = formatServerImageTag(values.acrLoginServer, `${values.acrImage}:${values.acrTag}`);
      return `${prefix}|${serverImageTag}`;
    } else if (values.registrySource === ContainerRegistrySources.privateRegistry) {
      const server = values.privateRegistryServerUrl
        .toLocaleLowerCase()
        .replace(CommonConstants.DeploymentCenterConstants.https, '')
        .replace(/\/+$/, '');
      const serverImageTag = formatServerImageTag(server, values.privateRegistryImageAndTag);
      return `${prefix}|${serverImageTag}`;
    } else {
      return `${prefix}|${values.dockerHubImageAndTag}`;
    }
  };

  const formatServerImageTag = (server: string, imageAndTag: string) => {
    const imageAndTagWithoutScheme = imageAndTag
      .replace(CommonConstants.DeploymentCenterConstants.https, '')
      .replace(CommonConstants.DeploymentCenterConstants.http, '');
    const imageAndTagParts = imageAndTagWithoutScheme.split(CommonConstants.singleForwardSlash);
    let formattedImageAndTag = imageAndTagWithoutScheme;
    if (imageAndTagParts[0] === server) {
      formattedImageAndTag = imageAndTagParts.slice(1).join(CommonConstants.singleForwardSlash);
    }
    return `${server}/${formattedImageAndTag}`;
  };

  const getFxVersionPrefix = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    switch (values.option) {
      case ContainerOptions.docker:
        return DeploymentCenterConstants.dockerPrefix;
      case ContainerOptions.compose:
        return DeploymentCenterConstants.composePrefix;
      default:
        portalContext.log(
          getTelemetryInfo('error', 'getFxVersionPrefix', 'incorrectValue', {
            value: values.option,
          })
        );
        throw Error(`Invalid container option '${values.option}'`);
    }
  };

  const manageAcrWebhook = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    if (values.continuousDeploymentOption === SettingOption.on) {
      return updateAcrWebhook(values);
    } else {
      return deleteAcrWebhook(values);
    }
  };

  const updateAcrWebhook = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    const webhookPayload = getAcrWebhookRegistrationPayload(values);

    if (webhookPayload && values.acrResourceId && values.acrLocation && deploymentCenterContext.siteDescriptor) {
      portalContext.log(getTelemetryInfo('info', 'updateAcrWebhook', 'submit'));
      const webhookName = getAcrWebhookName(deploymentCenterContext.siteDescriptor);
      const webhookResourceId = `${values.acrResourceId}/webhooks/${webhookName}`;

      return deploymentCenterData.updateAcrWebhook(webhookResourceId, webhookName, values.acrLocation, webhookPayload);
    }

    return Promise.resolve(null);
  };

  const getAcrWebhookRegistrationPayload = (
    values: DeploymentCenterFormData<DeploymentCenterContainerFormData>
  ): ACRWebhookPayload | null => {
    if (deploymentCenterPublishingContext.publishingCredentials) {
      const webhookUrl = getAppDockerWebhookUrl(deploymentCenterPublishingContext.publishingCredentials);

      // NOTE(michinoy): In a multi-container configuration there is no way to detect the repository and tag as there are multiple configurations.
      // In this case the scope should be set to an empty string
      const acrTag = values.option === ContainerOptions.docker ? values.acrTag : '';
      const acrRepository = values.option === ContainerOptions.docker ? values.acrImage : '';

      let scope = '';
      if (acrRepository) {
        scope += acrRepository;

        if (acrTag) {
          scope += `:${acrTag}`;
        }
      }

      return {
        scope,
        serviceUri: webhookUrl,
        customHeaders: {},
        actions: ['push'],
        status: 'enabled',
      };
    }

    return null;
  };

  const deleteAcrWebhook = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    if (deploymentCenterContext.siteDescriptor && values.acrResourceId) {
      portalContext.log(getTelemetryInfo('info', 'deleteAcrWebhook', 'submit'));
      const webhookName = getAcrWebhookName(deploymentCenterContext.siteDescriptor);
      const webhookResourceId = `${values.acrResourceId}/webhooks/${webhookName}`;

      return deploymentCenterData.deleteAcrWebhook(webhookResourceId);
    }

    return Promise.resolve(null);
  };

  const getAppSettings = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): { [name: string]: string } => {
    const appSettings = {};

    if (values.scmType !== ScmType.GitHubAction && values.continuousDeploymentOption === SettingOption.on) {
      appSettings[DeploymentCenterConstants.enableCISetting] = 'true';
    }

    const userName = getUsername(values);
    if (userName) {
      appSettings[DeploymentCenterConstants.usernameSetting] = userName;
    }

    const password = getPassword(values);
    if (password) {
      appSettings[DeploymentCenterConstants.passwordSetting] = password;
    }

    appSettings[DeploymentCenterConstants.serverUrlSetting] = getServerUrl(values);

    return appSettings;
  };

  const getLatestAppSettings = (
    existingAppSettings: { [name: string]: string },
    values: DeploymentCenterFormData<DeploymentCenterContainerFormData>
  ): { [name: string]: string } => {
    const containerAppSettings = getAppSettings(values);

    delete existingAppSettings[DeploymentCenterConstants.serverUrlSetting];
    delete existingAppSettings[DeploymentCenterConstants.usernameSetting];
    delete existingAppSettings[DeploymentCenterConstants.passwordSetting];
    delete existingAppSettings[DeploymentCenterConstants.enableCISetting];

    if (values.acrVnetImagePullSetting) {
      delete existingAppSettings[DeploymentCenterConstants.vnetImagePullSetting];
    }

    return { ...existingAppSettings, ...containerAppSettings };
  };

  const updateAppSettings = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): Promise<ResponseResult> => {
    const resourceId = siteContext.resourceId || '';
    const responseResult = {
      success: true,
      error: null,
    };

    portalContext.log(getTelemetryInfo('info', 'updateAppSettings', 'submit'));

    const appSettingsResponse = await deploymentCenterData.fetchApplicationSettings(resourceId);

    if (appSettingsResponse.metadata.success) {
      appSettingsResponse.data.properties = getLatestAppSettings(appSettingsResponse.data.properties, values);
      const saveAppSettingsResponse = await deploymentCenterData.updateApplicationSettings(resourceId, appSettingsResponse.data);

      if (!saveAppSettingsResponse.metadata.success) {
        responseResult.success = false;
        responseResult.error = saveAppSettingsResponse.metadata.error;
      }
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'appSettingsResponse', 'failed', {
          message: getErrorMessage(appSettingsResponse.metadata.error),
          errorAsString: JSON.stringify(appSettingsResponse.metadata.error),
        })
      );

      responseResult.success = false;
      responseResult.error = appSettingsResponse.metadata.error;
    }

    return responseResult;
  };

  const updateSiteConfig = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): Promise<ResponseResult> => {
    const resourceId = siteContext.resourceId || '';
    const responseResult = {
      success: true,
      error: '',
    };

    portalContext.log(getTelemetryInfo('info', 'getSiteConfig', 'submit'));

    const siteConfigResponse = await deploymentCenterData.getSiteConfig(resourceId);

    if (siteConfigResponse.metadata.success) {
      siteConfigResponse.data.properties.appCommandLine = values.command;

      if (values.registrySource === ContainerRegistrySources.acr) {
        const updateSiteConfigForACRResponse = await updateSiteConfigForACR(siteConfigResponse.data.properties, values);
        if (!updateSiteConfigForACRResponse.success) {
          responseResult.success = false;
          responseResult.error = updateSiteConfigForACRResponse.error;
        }
      } else {
        siteConfigResponse.data.properties.acrUseManagedIdentityCreds = false;
        siteConfigResponse.data.properties.acrUserManagedIdentityID = '';
      }

      if (values.scmType !== ScmType.GitHubAction) {
        if (siteContext.isLinuxApp) {
          siteConfigResponse.data.properties.linuxFxVersion = getFxVersion(values);
        } else {
          siteConfigResponse.data.properties.windowsFxVersion = getFxVersion(values);
        }
      }

      portalContext.log(getTelemetryInfo('info', 'saveSiteConfig', 'submit'));
      const saveSiteConfigResponse = await deploymentCenterData.updateSiteConfig(resourceId, siteConfigResponse.data);
      if (!saveSiteConfigResponse.metadata.success) {
        responseResult.success = false;
        responseResult.error = saveSiteConfigResponse.metadata.error;

        portalContext.log(
          getTelemetryInfo('error', 'saveSiteConfigResponse', 'failed', {
            message: getErrorMessage(saveSiteConfigResponse.metadata.error),
            errorAsString: JSON.stringify(saveSiteConfigResponse.metadata.error),
          })
        );
      }
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'siteConfigResponse', 'failed', {
          message: getErrorMessage(siteConfigResponse.metadata.error),
          errorAsString: JSON.stringify(siteConfigResponse.metadata.error),
        })
      );

      responseResult.success = false;
      responseResult.error = siteConfigResponse.metadata.error;
    }

    return responseResult;
  };

  const updateSiteConfigForACR = async (siteConfig: SiteConfig, values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    let setSiteConfigForACR = false;
    let errorMessage = '';

    if (values.acrCredentialType === ACRCredentialType.adminCredentials) {
      setSiteConfigForACR = true;
    } else {
      let principalId = '';
      const acrResourceId = values.acrResourceId;
      const siteIdentity = siteContext.site?.identity;

      if (values.acrManagedIdentityClientId === ManagedIdentityType.systemAssigned) {
        portalContext.log(getTelemetryInfo('info', 'enableSystemAssignedIdentity', 'submit'));
        const response = await deploymentCenterData.enableSystemAssignedIdentity(deploymentCenterContext.resourceId, siteIdentity);
        if (response.metadata.success) {
          principalId = response.data.identity.principalId;
        } else {
          portalContext.log(getTelemetryInfo('error', 'enableSystemAssignedIdentity', 'failed'));
          errorMessage = response.metadata.error;
        }
      } else {
        principalId = values.acrManagedIdentityPrincipalId;
      }

      const getRoleAssignmentsResponse = await deploymentCenterData.getRoleAssignmentsWithScope(acrResourceId, principalId);
      if (getRoleAssignmentsResponse.metadata.success) {
        const hasAcrPullRoleAssignment = await deploymentCenterData.hasRoleAssignment(
          RBACRoleId.acrPull,
          getRoleAssignmentsResponse.data.value
        );
        if (hasAcrPullRoleAssignment) {
          setSiteConfigForACR = true;
        } else {
          portalContext.log(getTelemetryInfo('info', 'setAcrPullRoleAssignment', 'submit'));
          const putRoleAssignmentResponse = await deploymentCenterData.putRoleAssignmentWithScope(
            RBACRoleId.acrPull,
            acrResourceId,
            principalId,
            PrincipalType.servicePrincipal
          );
          if (putRoleAssignmentResponse.metadata.success) {
            setSiteConfigForACR = true;
          } else {
            portalContext.log(getTelemetryInfo('error', 'setAcrPullRoleAssignment', 'failed'));
            errorMessage = putRoleAssignmentResponse.metadata.error;
          }
        }
      } else {
        portalContext.log(getTelemetryInfo('error', 'getRoleAssignmentsWithScope', 'failed'));
        errorMessage = getRoleAssignmentsResponse.metadata.error;
      }
    }

    if (setSiteConfigForACR) {
      siteConfig.acrUseManagedIdentityCreds = values.acrCredentialType === ACRCredentialType.managedIdentity;
      siteConfig.acrUserManagedIdentityID =
        values.acrManagedIdentityClientId !== ManagedIdentityType.systemAssigned ? values.acrManagedIdentityClientId : '';
    }

    return {
      success: setSiteConfigForACR,
      error: errorMessage,
    };
  };

  const updateSite = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): Promise<ResponseResult> => {
    const responseResult = {
      success: true,
      error: null,
    };

    if (values.acrVnetImagePullSetting) {
      portalContext.log(getTelemetryInfo('info', 'settingVnetImagePullEnabled', 'submit'));
      const updateSiteResponse = await deploymentCenterData.patchSite(deploymentCenterContext.resourceId, {
        properties: {
          vnetImagePullEnabled: values.acrVnetImagePullSetting === SettingOption.on,
        },
      });

      if (!updateSiteResponse.metadata.success) {
        portalContext.log(getTelemetryInfo('error', 'settingVnetImagePullEnabled', 'failed', updateSiteResponse.metadata.error));
        responseResult.success = false;
        responseResult.error = updateSiteResponse.metadata.error;
      }
    }

    return responseResult;
  };

  const saveDirectRegistrySettings = async (
    values: DeploymentCenterFormData<DeploymentCenterContainerFormData>,
    deploymentProperties: KeyValue<any>
  ) => {
    const notificationId = portalContext.startNotification(t('savingContainerConfiguration'), t('savingContainerConfiguration'));

    const [updateAppSettingsResponse, updateSiteConfigResponse] = await Promise.all([
      updateAppSettings(values),
      updateSiteConfig(values),
      updateSite(values),
    ]);

    if (updateAppSettingsResponse.success && updateSiteConfigResponse.success) {
      if (values.registrySource === ContainerRegistrySources.acr) {
        // NOTE(michinoy): The registration of webhook should be a fire and forget operation. No need to wait on it.
        // Also no need to check the status.
        manageAcrWebhook(values);
      }

      portalContext.stopNotification(notificationId, true, t('savingContainerConfigurationSuccess'));
      logSaveConclusion(true, deploymentProperties);
    } else {
      let errorMessage = '';
      if (!updateAppSettingsResponse.success) {
        errorMessage = getErrorMessage(updateAppSettingsResponse.error);
      } else if (!updateSiteConfigResponse.success) {
        errorMessage = getErrorMessage(updateSiteConfigResponse.error);
      }

      if (errorMessage) {
        portalContext.stopNotification(
          notificationId,
          false,
          t('savingContainerConfigurationFailedWithStatusMessage').format(errorMessage)
        );
      } else {
        portalContext.stopNotification(notificationId, false, t('savingContainerConfigurationFailed'));
      }
      logSaveConclusion(false, deploymentProperties);
    }
  };

  const getImageForGitHubAction = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    let imageValue = '';
    if (values.registrySource === ContainerRegistrySources.acr) {
      imageValue = values.acrImage;
    } else if (values.registrySource === ContainerRegistrySources.docker) {
      imageValue = values.dockerHubImageAndTag;
    } else {
      imageValue = values.privateRegistryImageAndTag;
    }

    return imageValue.split(':')[0];
  };

  const updateGitHubActionSettings = async (
    values: DeploymentCenterFormData<DeploymentCenterContainerFormData>
  ): Promise<ResponseResult> => {
    if (
      values.workflowOption === WorkflowOption.None ||
      values.workflowOption === WorkflowOption.UseAvailableWorkflowConfigs ||
      values.workflowOption === WorkflowOption.UseExistingWorkflowConfig
    ) {
      return {
        success: true,
      };
    }

    portalContext.log(getTelemetryInfo('info', 'updateGitHubActionSettings', 'submit'));

    const repo = `${values.org}/${values.repo}`;
    const branch = values.branch || 'master';

    const serverUrl = getServerUrl(values);
    const image = getImageForGitHubAction(values);

    const workflowInformation = getContainerAppWorkflowInformation(
      serverUrl,
      image,
      branch,
      values.gitHubPublishProfileSecretGuid,
      values.gitHubContainerUsernameSecretGuid,
      values.gitHubContainerPasswordSecretGuid,
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
      deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
    );

    const commitInfo: GitHubCommit = {
      repoName: repo,
      branchName: branch,
      filePath: getWorkflowFilePath(
        branch,
        deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.site : '',
        deploymentCenterContext.siteDescriptor ? deploymentCenterContext.siteDescriptor.slot : ''
      ),
      message: t('githubActionWorkflowCommitMessage'),
      contentBase64Encoded: btoa(workflowInformation.content),
      committer: {
        name: 'Azure App Service',
        email: 'donotreply@microsoft.com',
      },
    };

    const workflowConfigurationResponse = await deploymentCenterData.getWorkflowConfiguration(
      values.org,
      values.repo,
      branch,
      commitInfo.filePath,
      deploymentCenterContext.gitHubToken
    );

    // NOTE(michinoy): A failure here means the file does not exist and we do not need to copy over the sha.
    // No need to log anything.
    if (workflowConfigurationResponse.metadata.success) {
      commitInfo.sha = workflowConfigurationResponse.data.sha;
    }

    const requestContent: GitHubActionWorkflowRequestContent = {
      resourceId: deploymentCenterContext.resourceId,
      secretName: workflowInformation.publishingProfileSecretName,

      containerUsernameSecretName: workflowInformation.containerUsernameSecretName,
      containerUsernameSecretValue: getUsername(values),
      containerPasswordSecretName: workflowInformation.containerPasswordSecretName,
      containerPasswordSecretValue: getPassword(values),
      commit: commitInfo,
    };

    const response = await deploymentCenterData.createOrUpdateActionWorkflow(
      getArmToken(),
      deploymentCenterContext.gitHubToken,
      requestContent
    );

    if (!response.metadata.success) {
      portalContext.log(
        getTelemetryInfo('error', 'updateGitHubActionSettingsResponse', 'failed', {
          message: getErrorMessage(response.metadata.error),
          errorAsString: JSON.stringify(response.metadata.error),
        })
      );
    }

    return {
      success: response.metadata.success,
      error: response.metadata.error,
    };
  };

  const updateSourceControlDetails = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    const payload: SiteSourceControlRequestBody = {
      repoUrl: `${DeploymentCenterConstants.githubUri}/${values.org}/${values.repo}`,
      branch: values.branch || 'master',
      isManualIntegration: false,
      isGitHubAction: true,
      isMercurial: false,
    };

    portalContext.log(getTelemetryInfo('info', 'updateSourceControlDetails', 'submit'));

    const updateSourceControlResponse = await deploymentCenterData.updateSourceControlDetails(deploymentCenterContext.resourceId, {
      properties: payload,
    });

    if (
      !updateSourceControlResponse.metadata.success &&
      payload.isGitHubAction &&
      (isApiSyncError(updateSourceControlResponse.metadata.error) || siteContext.isKubeApp)
    ) {
      // NOTE(michinoy): If the save operation was being done for GitHub Action, and
      // we are experiencing the API sync error, populate the source controls properties
      // manually.
      // This strictly a workaround and once all the APIs are sync this code can be removed.

      portalContext.log(getTelemetryInfo('warning', 'updateSourceControlDetailsWorkaround', 'submit'));

      return updateGitHubActionSourceControlPropertiesManually(
        deploymentCenterData,
        deploymentCenterContext.resourceId,
        payload,
        deploymentCenterContext.gitHubToken,
        portalContext
      );
    } else {
      return updateSourceControlResponse;
    }
  };

  const updateApplicationProperties = async (
    values: DeploymentCenterFormData<DeploymentCenterContainerFormData>
  ): Promise<ResponseResult> => {
    const responseResult = {
      success: true,
      error: null,
    };

    portalContext.log(getTelemetryInfo('info', 'updateApplicationProperties', 'submit'));
    const updateSourceControlDetailsResponse = await updateSourceControlDetails(values);

    if (updateSourceControlDetailsResponse.metadata.success) {
      // NOTE(michinoy): Do not make the call to update sourcecontrols API and site config parallel.
      // Internally the sourcecontrols API update the site config object, so this is to prevent any
      // locking issues on that object.
      const [updateAppSettingsResponse, updateSiteConfigResponse] = await Promise.all([
        updateAppSettings(values),
        updateSiteConfig(values),
      ]);

      if (!updateAppSettingsResponse.success) {
        responseResult.success = false;
        responseResult.error = updateAppSettingsResponse.error;
      }

      if (!updateSiteConfigResponse.success) {
        responseResult.success = false;
        responseResult.error = updateSiteConfigResponse.error;
      }
    } else {
      responseResult.success = false;
      responseResult.error = updateSourceControlDetailsResponse.metadata.error;
    }

    return responseResult;
  };

  const logSaveConclusion = (success: boolean, deploymentProperties: KeyValue<any>) => {
    const endTime = new Date().getTime();
    const duration = endTime - deploymentProperties.startTime;
    deploymentProperties.success = success ? 'true' : 'false';
    deploymentProperties.duration = `${duration.toLocaleString()}`;
    portalContext.log(getTelemetryInfo('info', 'saveDeploymentSettings', 'end', deploymentProperties));
  };

  const saveGithubActionContainerSettings = async (
    values: DeploymentCenterFormData<DeploymentCenterContainerFormData>,
    deploymentProperties: KeyValue<any>
  ) => {
    const notificationId = portalContext.startNotification(t('savingContainerConfiguration'), t('savingContainerConfiguration'));

    portalContext.log(getTelemetryInfo('info', 'saveGithubActionContainerSettings', 'submit'));
    const updateGitHubActionSettingsResponse = await updateGitHubActionSettings(values);
    let containerConfigurationSucceeded = true;
    let errorMessage = '';

    if (updateGitHubActionSettingsResponse.success) {
      const updateApplicationPropertiesResponse = await updateApplicationProperties(values);

      if (!updateApplicationPropertiesResponse.success) {
        containerConfigurationSucceeded = false;
        errorMessage = getErrorMessage(updateApplicationPropertiesResponse.error);
      }
    } else {
      containerConfigurationSucceeded = false;
      errorMessage = getErrorMessage(updateGitHubActionSettingsResponse.error);
    }

    if (containerConfigurationSucceeded) {
      portalContext.stopNotification(notificationId, true, t('savingContainerConfigurationSuccess'));
      logSaveConclusion(true, deploymentProperties);
    } else {
      if (errorMessage) {
        portalContext.stopNotification(
          notificationId,
          false,
          t('savingContainerConfigurationFailedWithStatusMessage').format(errorMessage)
        );
      } else {
        portalContext.stopNotification(notificationId, false, t('savingContainerConfigurationFailed'));
      }
      logSaveConclusion(false, deploymentProperties);
    }
  };

  const onSubmit = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    portalContext.log(getTelemetryInfo('info', 'onSubmitContainer', 'submit'));

    await Promise.all([updateDeploymentConfigurations(values), updatePublishingUser(values)]);
    props.refresh();
    siteContext.refresh();
  };

  const updateDeploymentConfigurations = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    const { scmType, org, repo, branch, workflowOption, registrySource, option, acrLoginServer, privateRegistryServerUrl } = values;
    const requestId = Guid.newGuid();
    const deploymentProperties: KeyValue<any> = {
      sourceProvider: scmType,
      buildProvider: scmType === ScmType.GitHubAction ? scmType : '',
      org,
      repo,
      branch,
      workflowOption,
      registrySource,
      option,
      acrLoginServer,
      privateRegistryServerUrl,
      publishType: 'container',
      appType: siteContext.isFunctionApp ? 'functionApp' : 'webApp',
      isKubeApp: siteContext.isKubeApp ? 'true' : 'false',
      os: siteContext.isLinuxApp ? AppOs.linux : AppOs.windows,
      requestId,
      startTime: new Date().getTime(),
    };
    portalContext.log(getTelemetryInfo('info', 'saveDeploymentSettings', 'start', deploymentProperties));

    // Only do the save if scmType in the config is set to none.
    // If the scmType in the config is not none, the user should be doing a disconnect operation first.
    // This check is in place, because the use could set the form props ina dirty state by just modifying the
    // publishing user information.
    if (deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.None) {
      if (values.scmType === ScmType.GitHubAction) {
        await saveGithubActionContainerSettings(values, deploymentProperties);
      } else {
        await saveDirectRegistrySettings(values, deploymentProperties);
      }
    }
  };

  const updatePublishingUser = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    const currentUser = deploymentCenterPublishingContext.publishingUser;
    if (
      (currentUser && currentUser.properties.publishingUserName !== values.publishingUsername) ||
      (currentUser && values.publishingPassword && currentUser.properties.publishingPassword !== values.publishingPassword)
    ) {
      portalContext.log(getTelemetryInfo('info', 'updatePublishingUser', 'submit'));

      const notificationId = portalContext.startNotification(t('UpdatingPublishingUser'), t('UpdatingPublishingUser'));
      currentUser.properties.publishingUserName = values.publishingUsername;
      currentUser.properties.publishingPassword = values.publishingPassword;
      const publishingUserResponse = await deploymentCenterData.updatePublishingUser(currentUser);

      if (publishingUserResponse.metadata.success) {
        portalContext.stopNotification(notificationId, true, t('UpdatingPublishingUserSuccess'));
      } else {
        const errorMessage = getErrorMessage(publishingUserResponse.metadata.error);
        errorMessage
          ? portalContext.stopNotification(notificationId, false, t('UpdatingPublishingUserFailWithStatusMessage').format(errorMessage))
          : portalContext.stopNotification(notificationId, false, t('UpdatingPublishingUserFail'));

        portalContext.log(
          getTelemetryInfo('error', 'publishingUserResponse', 'failed', {
            message: getErrorMessage(publishingUserResponse.metadata.error),
            errorAsString: JSON.stringify(publishingUserResponse.metadata.error),
          })
        );
      }
    }
  };

  const hideDiscardConfirmDialog = () => {
    setIsDiscardConfirmDialogVisible(false);
  };

  return (
    <Formik
      initialValues={props.formData}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validateOnChange={false}
      validationSchema={props.formValidationSchema}>
      {(formProps: FormikProps<DeploymentCenterFormData<DeploymentCenterContainerFormData>>) => (
        <form>
          <div id="deployment-center-command-bar" className={commandBarSticky}>
            <DeploymentCenterCommandBar
              saveFunction={formProps.submitForm}
              discardFunction={() => setIsDiscardConfirmDialogVisible(true)}
              showPublishProfilePanel={deploymentCenterPublishingContext.showPublishProfilePanel}
              isDataRefreshing={props.isDataRefreshing}
              isDirty={isSettingsDirty(formProps, deploymentCenterContext) || isFtpsDirty(formProps, deploymentCenterPublishingContext)}
              isValid={formProps.isValid}
              isVstsBuildProvider={formProps.values.scmType === ScmType.Vsts}
            />
          </div>
          <>
            <ConfirmDialog
              primaryActionButton={{
                title: t('ok'),
                onClick: () => {
                  formProps.resetForm();
                  deploymentCenterContext.refresh();
                  hideDiscardConfirmDialog();
                },
              }}
              defaultActionButton={{
                title: t('cancel'),
                onClick: hideDiscardConfirmDialog,
              }}
              title={t('deploymentCenterDiscardConfirmTitle')}
              content={t('deploymentCenterDataLossMessage')}
              hidden={!isDiscardConfirmDialogVisible}
              onDismiss={hideDiscardConfirmDialog}
            />
          </>
          <div className={pivotContent}>
            <DeploymentCenterContainerPivot {...props} formProps={formProps} />
          </div>
        </form>
      )}
    </Formik>
  );
};

export default DeploymentCenterContainerForm;
