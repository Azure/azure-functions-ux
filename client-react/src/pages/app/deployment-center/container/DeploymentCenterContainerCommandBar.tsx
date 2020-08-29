import React, { useContext } from 'react';
import {
  DeploymentCenterContainerCommandBarProps,
  ContinuousDeploymentOption,
  ContainerOptions,
  ContainerRegistrySources,
} from '../DeploymentCenter.types';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { getAcrWebhookName, getAppDockerWebhookUrl } from '../utility/DeploymentCenterUtility';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { ACRWebhookPayload } from '../../../../models/acr';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import { ScmType } from '../../../../models/site/config';
import { PortalContext } from '../../../../PortalContext';
import { useTranslation } from 'react-i18next';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterContainerCommandBar: React.FC<DeploymentCenterContainerCommandBarProps> = props => {
  const { refresh, isLoading, formProps } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const portalContext = useContext(PortalContext);
  const siteContext = useContext(SiteStateContext);
  const deploymentCenterData = new DeploymentCenterData();

  const getAppSettings = (): { [name: string]: string } => {
    const appSettings = {};

    if (formProps.values.continuousDeploymentOption === ContinuousDeploymentOption.on) {
      appSettings[DeploymentCenterConstants.enableCISetting] = 'true';
    }

    if (formProps.values.username) {
      appSettings[DeploymentCenterConstants.usernameSetting] = formProps.values.username;
    }

    if (formProps.values.password) {
      appSettings[DeploymentCenterConstants.passwordSetting] = formProps.values.password;
    }

    if (formProps.values.serverUrl) {
      appSettings[DeploymentCenterConstants.serverUrlSetting] = formProps.values.serverUrl;
    }

    return appSettings;
  };

  const getFxVersion = (): string => {
    const prefix = getFxVersionPrefix();

    if (formProps.values.option === ContainerOptions.docker) {
      const serverUrl = formProps.values.serverUrl.toLocaleLowerCase().replace('https://', '');
      return getDockerFxVersion(prefix, serverUrl);
    } else {
      throw Error('Not implemented');
    }
  };

  const getDockerFxVersion = (prefix: string, serverUrl: string) => {
    if (formProps.values.registrySource === ContainerRegistrySources.acr) {
      return `${prefix}|${serverUrl}/${formProps.values.image}:${formProps.values.tag}`;
    } else if (formProps.values.registrySource === ContainerRegistrySources.privateRegistry) {
      return `${prefix}|${serverUrl}/${formProps.values.imageAndTag}`;
    } else {
      return `$${prefix}|${formProps.values.imageAndTag}`;
    }
  };

  const getFxVersionPrefix = (): string => {
    switch (formProps.values.option) {
      case ContainerOptions.docker:
        return DeploymentCenterConstants.dockerPrefix;
      case ContainerOptions.compose:
        return DeploymentCenterConstants.composePrefix;
      case ContainerOptions.kubernetes:
        return DeploymentCenterConstants.kubernetesPrefix;
      default:
        throw Error(`Invalid container option '${formProps.values.option}'`);
    }
  };

  const manageAcrWebhook = () => {
    if (formProps.values.continuousDeploymentOption === ContinuousDeploymentOption.on) {
      return updateAcrWebhook();
    } else {
      return deleteAcrWebhook();
    }
  };

  const updateAcrWebhook = async () => {
    const webhookPayload = getAcrWebhookRegistrationPayload();

    if (
      webhookPayload &&
      formProps.values.acrResourceId &&
      formProps.values.acrResourceLocation &&
      deploymentCenterContext.siteDescriptor
    ) {
      const webhookName = getAcrWebhookName(deploymentCenterContext.siteDescriptor);
      const webhookResourceId = `${formProps.values.acrResourceId}/webhooks/${webhookName}`;

      return deploymentCenterData.updateAcrWebhook(webhookResourceId, webhookName, formProps.values.acrResourceLocation, webhookPayload);
    }

    return Promise.resolve(null);
  };

  const getAcrWebhookRegistrationPayload = (): ACRWebhookPayload | null => {
    if (deploymentCenterPublishingContext.publishingCredentials) {
      const webhookUrl = getAppDockerWebhookUrl(deploymentCenterPublishingContext.publishingCredentials);

      // NOTE(michinoy): In a multi-container configuration there is no way to detect the repository and tag as there are multiple configurations.
      // In this case the scope should be set to an empty string
      const acrTag = formProps.values.option === ContainerOptions.docker ? formProps.values.tag : '';
      const acrRepository = formProps.values.option === ContainerOptions.docker ? formProps.values.image : '';

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

  const deleteAcrWebhook = () => {
    if (deploymentCenterContext.siteDescriptor && formProps.values.acrResourceId) {
      const webhookName = getAcrWebhookName(deploymentCenterContext.siteDescriptor);
      const webhookResourceId = `${formProps.values.acrResourceId}/webhooks/${webhookName}`;

      return deploymentCenterData.deleteAcrWebhook(webhookResourceId);
    }

    return Promise.resolve(null);
  };

  const saveDirectRegistrySettings = async () => {
    const notificationId = portalContext.startNotification(t('savingContainerConfiguration'), t('savingContainerConfiguration'));
    const resourceId = siteContext.resourceId || '';

    // Get the latest app settings and site config.
    const appSettingRequest = deploymentCenterData.fetchApplicationSettings(resourceId);
    const siteConfigRequest = deploymentCenterData.getSiteConfig(resourceId);

    const [appSettingsResponse, siteConfigResponse] = await Promise.all([appSettingRequest, siteConfigRequest]);

    if (!appSettingsResponse.metadata.success || !siteConfigResponse.metadata.success) {
      portalContext.stopNotification(notificationId, false, t('savingContainerConfigurationFailed'));
      return;
    }

    // Update the app settings and site config with the container configuration
    appSettingsResponse.data.properties = getLatestAppSettings(appSettingsResponse.data.properties);
    siteConfigResponse.data.properties.appCommandLine = formProps.values.command;

    if (siteContext.isLinuxApp) {
      siteConfigResponse.data.properties.linuxFxVersion = getFxVersion();
    } else {
      siteConfigResponse.data.properties.windowsFxVersion = getFxVersion();
    }

    const saveAppSettingsRequest = deploymentCenterData.updateApplicationSettings(resourceId, appSettingsResponse.data);
    const saveSiteConfigRequest = deploymentCenterData.updateSiteConfig(resourceId, siteConfigResponse.data);

    const [saveAppSettingsReResponse, saveSiteConfigResponse] = await Promise.all([saveAppSettingsRequest, saveSiteConfigRequest]);

    if (!saveAppSettingsReResponse.metadata.success || !saveSiteConfigResponse.metadata.success) {
      portalContext.stopNotification(notificationId, false, t('savingContainerConfigurationFailed'));
      return;
    }

    if (formProps.values.registrySource === ContainerRegistrySources.acr) {
      // NOTE(michinoy): The registration of webhook should be a fire and forget operation. No need to wait on it.
      // Also no need to check the status.
      manageAcrWebhook();
    }
  };

  const getLatestAppSettings = (existingAppSettings: { [name: string]: string }): { [name: string]: string } => {
    const containerAppSettings = getAppSettings();

    delete existingAppSettings[DeploymentCenterConstants.serverUrlSetting];
    delete existingAppSettings[DeploymentCenterConstants.imageNameSetting];
    delete existingAppSettings[DeploymentCenterConstants.usernameSetting];
    delete existingAppSettings[DeploymentCenterConstants.passwordSetting];
    delete existingAppSettings[DeploymentCenterConstants.enableCISetting];

    return { ...existingAppSettings, ...containerAppSettings };
  };

  const saveGithubActionContainerSettings = async () => {
    throw Error('Not implemented');
  };

  const saveFunction = () => {
    if (formProps.values.scmType === ScmType.GitHubAction) {
      saveGithubActionContainerSettings();
    } else {
      saveDirectRegistrySettings();
    }
  };

  const discardFunction = () => {
    throw Error('not implemented');
  };

  return (
    <DeploymentCenterCommandBar
      saveFunction={saveFunction}
      discardFunction={discardFunction}
      showPublishProfilePanel={deploymentCenterPublishingContext.showPublishProfilePanel}
      refresh={refresh}
      isLoading={isLoading}
    />
  );
};

export default DeploymentCenterContainerCommandBar;
