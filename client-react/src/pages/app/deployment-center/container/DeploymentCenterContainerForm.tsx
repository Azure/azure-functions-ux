import React, { useState, useContext } from 'react';
import { Formik, FormikProps } from 'formik';
import {
  DeploymentCenterFormData,
  DeploymentCenterContainerFormProps,
  DeploymentCenterContainerFormData,
  ContinuousDeploymentOption,
  ContainerRegistrySources,
  ContainerOptions,
  SiteSourceControlRequestBody,
  WorkflowOption,
  ContainerDockerAccessTypes,
} from '../DeploymentCenter.types';
import { KeyCodes } from 'office-ui-fabric-react';
import { commandBarSticky, pivotContent } from '../DeploymentCenter.styles';
import DeploymentCenterContainerPivot from './DeploymentCenterContainerPivot';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getAcrWebhookName, getAppDockerWebhookUrl, getWorkflowFilePath, getArmToken, getLogId } from '../utility/DeploymentCenterUtility';
import { ACRWebhookPayload } from '../../../../models/acr';
import { ScmType } from '../../../../models/site/config';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import {
  getContainerAppWorkflowInformation,
  isApiSyncError,
  updateGitHubActionSourceControlPropertiesManually,
} from '../utility/GitHubActionUtility';
import { GitHubCommit, GitHubActionWorkflowRequestContent } from '../../../../models/github';

interface ResponseResult {
  success: boolean;
  error?: any; //NOTE(michinoy): This needs to remain as 'any' as we do not know the schema of the error object
}

const DeploymentCenterContainerForm: React.FC<DeploymentCenterContainerFormProps> = props => {
  const { t } = useTranslation();

  const [isRefreshConfirmDialogVisible, setIsRefreshConfirmDialogVisible] = useState(false);
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
      return values.dockerHubUsername;
    }
  };

  const getPassword = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    if (values.registrySource === ContainerRegistrySources.acr) {
      return values.acrPassword;
    } else if (values.registrySource === ContainerRegistrySources.privateRegistry) {
      return values.privateRegistryPassword;
    } else {
      return values.dockerHubPassword;
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
      return `${prefix}|${values.acrLoginServer}/${values.acrImage}:${values.acrTag}`;
    } else if (values.registrySource === ContainerRegistrySources.privateRegistry) {
      const server = values.privateRegistryServerUrl.toLocaleLowerCase().replace('https://', '');
      return `${prefix}|${server}/${values.privateRegistryImageAndTag}`;
    } else {
      return values.dockerHubAccessType === ContainerDockerAccessTypes.public
        ? `${prefix}|${values.dockerHubImageAndTag}`
        : `${prefix}|${values.dockerHubUsername}/${values.dockerHubImageAndTag}`;
    }
  };

  const getFxVersionPrefix = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    switch (values.option) {
      case ContainerOptions.docker:
        return DeploymentCenterConstants.dockerPrefix;
      case ContainerOptions.compose:
        return DeploymentCenterConstants.composePrefix;
      default:
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterContainerCommandBar',
          `Incorrect container option provided ${values.option}`
        );
        throw Error(`Invalid container option '${values.option}'`);
    }
  };

  const manageAcrWebhook = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    if (values.continuousDeploymentOption === ContinuousDeploymentOption.on) {
      return updateAcrWebhook(values);
    } else {
      return deleteAcrWebhook(values);
    }
  };

  const updateAcrWebhook = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    const webhookPayload = getAcrWebhookRegistrationPayload(values);

    if (webhookPayload && values.acrResourceId && values.acrLocation && deploymentCenterContext.siteDescriptor) {
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
      const webhookName = getAcrWebhookName(deploymentCenterContext.siteDescriptor);
      const webhookResourceId = `${values.acrResourceId}/webhooks/${webhookName}`;

      return deploymentCenterData.deleteAcrWebhook(webhookResourceId);
    }

    return Promise.resolve(null);
  };

  const getAppSettings = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): { [name: string]: string } => {
    const appSettings = {};

    if (values.scmType !== ScmType.GitHubAction && values.continuousDeploymentOption === ContinuousDeploymentOption.on) {
      appSettings[DeploymentCenterConstants.enableCISetting] = 'true';
    }

    appSettings[DeploymentCenterConstants.usernameSetting] = getUsername(values);
    appSettings[DeploymentCenterConstants.passwordSetting] = getPassword(values);
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

    return { ...existingAppSettings, ...containerAppSettings };
  };

  const updateAppSettings = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): Promise<ResponseResult> => {
    const resourceId = siteContext.resourceId || '';
    const responseResult = {
      success: true,
      error: null,
    };

    const appSettingsResponse = await deploymentCenterData.fetchApplicationSettings(resourceId);

    if (appSettingsResponse.metadata.success) {
      appSettingsResponse.data.properties = getLatestAppSettings(appSettingsResponse.data.properties, values);
      const saveAppSettingsResponse = await deploymentCenterData.updateApplicationSettings(resourceId, appSettingsResponse.data);

      if (!saveAppSettingsResponse.metadata.success) {
        responseResult.success = false;
        responseResult.error = saveAppSettingsResponse.metadata.error;
      }
    } else {
      LogService.error(LogCategories.deploymentCenter, getLogId('DeploymentCenterContainerForm', 'updateAppSettings'), {
        error: appSettingsResponse.metadata.error,
      });

      responseResult.success = false;
      responseResult.error = appSettingsResponse.metadata.error;
    }

    return responseResult;
  };

  const updateSiteConfig = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): Promise<ResponseResult> => {
    const resourceId = siteContext.resourceId || '';
    const responseResult = {
      success: true,
      error: null,
    };

    const siteConfigResponse = await deploymentCenterData.getSiteConfig(resourceId);

    if (siteConfigResponse.metadata.success) {
      siteConfigResponse.data.properties.appCommandLine = values.command;

      if (siteContext.isLinuxApp) {
        siteConfigResponse.data.properties.linuxFxVersion = getFxVersion(values);
      } else {
        siteConfigResponse.data.properties.windowsFxVersion = getFxVersion(values);
      }

      const saveSiteConfigResponse = await deploymentCenterData.updateSiteConfig(resourceId, siteConfigResponse.data);
      if (!saveSiteConfigResponse.metadata.success) {
        responseResult.success = false;
        responseResult.error = saveSiteConfigResponse.metadata.error;
      }
    } else {
      LogService.error(LogCategories.deploymentCenter, getLogId('DeploymentCenterContainerForm', 'updateSiteConfig'), {
        error: siteConfigResponse.metadata.error,
      });

      responseResult.success = false;
      responseResult.error = siteConfigResponse.metadata.error;
    }

    return responseResult;
  };

  const saveDirectRegistrySettings = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    const notificationId = portalContext.startNotification(t('savingContainerConfiguration'), t('savingContainerConfiguration'));

    const [updateAppSettingsResponse, updateSiteConfigResponse] = await Promise.all([updateAppSettings(values), updateSiteConfig(values)]);

    if (updateAppSettingsResponse.success && updateSiteConfigResponse.success) {
      if (values.registrySource === ContainerRegistrySources.acr) {
        // NOTE(michinoy): The registration of webhook should be a fire and forget operation. No need to wait on it.
        // Also no need to check the status.
        manageAcrWebhook(values);
      }

      portalContext.stopNotification(notificationId, true, t('savingContainerConfigurationSuccess'));
    } else {
      let errorMessage = !updateAppSettingsResponse.success ? getErrorMessage(updateAppSettingsResponse.error) : '';

      errorMessage = !errorMessage && !updateSiteConfigResponse.success ? getErrorMessage(updateSiteConfigResponse.error) : '';

      if (errorMessage) {
        portalContext.stopNotification(
          notificationId,
          false,
          t('savingContainerConfigurationFailedWithStatusMessage').format(errorMessage)
        );
      } else {
        portalContext.stopNotification(notificationId, false, t('savingContainerConfigurationFailed'));
      }
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
      LogService.error(LogCategories.deploymentCenter, getLogId('DeploymentCenterContainerForm', 'updateGitHubActionSettings'), {
        error: response.metadata.error,
      });
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

    const updateSourceControlResponse = await deploymentCenterData.updateSourceControlDetails(deploymentCenterContext.resourceId, {
      properties: payload,
    });

    if (
      !updateSourceControlResponse.metadata.success &&
      payload.isGitHubAction &&
      isApiSyncError(updateSourceControlResponse.metadata.error)
    ) {
      // NOTE(michinoy): If the save operation was being done for GitHub Action, and
      // we are experiencing the API sync error, populate the source controls properties
      // manually.
      // This strictly a workaround and once all the APIs are sync this code can be removed.

      LogService.trackEvent(
        LogCategories.deploymentCenter,
        getLogId('DeploymentCenterContainerForm', 'updateSourceControlDetails-apiSyncErrorWorkaround'),
        { resourceId: deploymentCenterContext.resourceId }
      );

      return updateGitHubActionSourceControlPropertiesManually(deploymentCenterData, deploymentCenterContext.resourceId, payload);
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

  const saveGithubActionContainerSettings = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    const notificationId = portalContext.startNotification(t('savingContainerConfiguration'), t('savingContainerConfiguration'));

    const updateGitHubActionSettingsResponse = await updateGitHubActionSettings(values);
    let containerConfigurationSucceeded = true;
    let errorMessage = '';

    if (updateGitHubActionSettingsResponse.success) {
      const updateApplicationPropertiesResponse = await updateApplicationProperties(values);

      if (!updateApplicationPropertiesResponse.success) {
        errorMessage = getErrorMessage(updateApplicationPropertiesResponse.error);
      }
    } else {
      errorMessage = getErrorMessage(updateGitHubActionSettingsResponse.error);
    }

    if (containerConfigurationSucceeded) {
      portalContext.stopNotification(notificationId, true, t('savingContainerConfigurationSuccess'));
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
    }
  };

  const onKeyDown = keyEvent => {
    if ((keyEvent.charCode || keyEvent.keyCode) === KeyCodes.enter) {
      keyEvent.preventDefault();
    }
  };

  const refreshFunction = () => {
    hideRefreshConfirmDialog();
    props.refresh();
  };

  const onSubmit = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    await Promise.all([updateDeploymentConfigurations(values), updatePublishingUser(values)]);
    deploymentCenterContext.refresh();
    props.refresh();
  };

  const updateDeploymentConfigurations = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    const { scmType, org, repo, branch, workflowOption, registrySource, option, acrLoginServer, privateRegistryServerUrl } = values;
    LogService.trackEvent(LogCategories.deploymentCenter, getLogId('DeploymentCenterContainerForm', 'updateDeploymentConfigurations'), {
      scmType,
      org,
      repo,
      branch,
      workflowOption,
      registrySource,
      option,
      acrLoginServer,
      privateRegistryServerUrl,
    });

    // Only do the save if scmtype in the config is set to none.
    // If the scmtype in the config is not none, the user should be doing a disconnect operation first.
    // This check is in place, because the use could set the form props ina dirty state by just modifying the
    // publishing user information.
    if (deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.None) {
      if (values.scmType === ScmType.GitHubAction) {
        await saveGithubActionContainerSettings(values);
      } else {
        await saveDirectRegistrySettings(values);
      }
    }
  };

  const updatePublishingUser = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    const currentUser = deploymentCenterPublishingContext.publishingUser;
    if (
      (currentUser && currentUser.properties.publishingUserName !== values.publishingUsername) ||
      (currentUser && values.publishingPassword && currentUser.properties.publishingPassword !== values.publishingPassword)
    ) {
      LogService.trackEvent(LogCategories.deploymentCenter, getLogId('DeploymentCenterContainerForm', 'updatePublishingUser'), {});

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

        LogService.error(LogCategories.deploymentCenter, getLogId('DeploymentCenterContainerForm', 'updatePublishingUser'), {
          error: publishingUserResponse.metadata.error,
        });
      }
    }
  };

  const hideRefreshConfirmDialog = () => {
    setIsRefreshConfirmDialogVisible(false);
  };

  const hideDiscardConfirmDialog = () => {
    setIsDiscardConfirmDialogVisible(false);
  };

  return (
    <Formik
      initialValues={props.formData}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={props.formValidationSchema}>
      {(formProps: FormikProps<DeploymentCenterFormData<DeploymentCenterContainerFormData>>) => (
        <form onKeyDown={onKeyDown}>
          <div id="deployment-center-command-bar" className={commandBarSticky}>
            <DeploymentCenterCommandBar
              saveFunction={formProps.submitForm}
              discardFunction={() => setIsDiscardConfirmDialogVisible(true)}
              showPublishProfilePanel={deploymentCenterPublishingContext.showPublishProfilePanel}
              refresh={() => setIsRefreshConfirmDialogVisible(true)}
              isLoading={props.isLoading}
              isDirty={formProps.dirty}
            />
          </div>
          <>
            <ConfirmDialog
              primaryActionButton={{
                title: t('ok'),
                onClick: refreshFunction,
              }}
              defaultActionButton={{
                title: t('cancel'),
                onClick: hideRefreshConfirmDialog,
              }}
              title={t('deploymentCenterRefreshConfirmTitle')}
              content={t('deploymentCenterDataLossMessage')}
              hidden={!isRefreshConfirmDialogVisible}
              onDismiss={hideRefreshConfirmDialog}
            />

            <ConfirmDialog
              primaryActionButton={{
                title: t('ok'),
                onClick: () => {
                  formProps.resetForm();
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
