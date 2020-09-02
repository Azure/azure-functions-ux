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
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';

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

    appSettings[DeploymentCenterConstants.usernameSetting] = getUsername();
    appSettings[DeploymentCenterConstants.passwordSetting] = getPassword();
    appSettings[DeploymentCenterConstants.serverUrlSetting] = getServerUrl();

    return appSettings;
  };

  const getServerUrl = (): string => {
    if (formProps.values.registrySource === ContainerRegistrySources.acr) {
      return `https://${formProps.values.acrLoginServer}'`;
    } else if (formProps.values.registrySource === ContainerRegistrySources.privateRegistry) {
      return formProps.values.privateRegistryServerUrl;
    } else {
      return DeploymentCenterConstants.dockerHubUrl;
    }
  };

  const getUsername = (): string => {
    if (formProps.values.registrySource === ContainerRegistrySources.acr) {
      return formProps.values.acrUsername;
    } else if (formProps.values.registrySource === ContainerRegistrySources.privateRegistry) {
      return formProps.values.privateRegistryUsername;
    } else {
      return formProps.values.privateRegistryUsername;
    }
  };

  const getPassword = (): string => {
    if (formProps.values.registrySource === ContainerRegistrySources.acr) {
      return formProps.values.acrPassword;
    } else if (formProps.values.registrySource === ContainerRegistrySources.privateRegistry) {
      return formProps.values.privateRegistryPassword;
    } else {
      return formProps.values.privateRegistryPassword;
    }
  };

  const getFxVersion = (): string => {
    const prefix = getFxVersionPrefix();

    if (formProps.values.option === ContainerOptions.docker) {
      return getDockerFxVersion(prefix);
    } else {
      throw Error('Not implemented');
    }
  };

  const getDockerFxVersion = (prefix: string) => {
    if (formProps.values.registrySource === ContainerRegistrySources.acr) {
      return `${prefix}|${formProps.values.acrLoginServer}/${formProps.values.acrImage}:${formProps.values.acrTag}`;
    } else if (formProps.values.registrySource === ContainerRegistrySources.privateRegistry) {
      const server = formProps.values.privateRegistryServerUrl.toLocaleLowerCase().replace('https://', '');
      return `${prefix}|${server}/${formProps.values.privateRegistryImageAndTag}`;
    } else {
      return `${prefix}|${formProps.values.dockerHubImageAndTag}`;
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
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterContainerCommandBar',
          `Incorrect container option provided ${formProps.values.option}`
        );
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

    if (webhookPayload && formProps.values.acrResourceId && formProps.values.acrLocation && deploymentCenterContext.siteDescriptor) {
      const webhookName = getAcrWebhookName(deploymentCenterContext.siteDescriptor);
      const webhookResourceId = `${formProps.values.acrResourceId}/webhooks/${webhookName}`;

      return deploymentCenterData.updateAcrWebhook(webhookResourceId, webhookName, formProps.values.acrLocation, webhookPayload);
    }

    return Promise.resolve(null);
  };

  const getAcrWebhookRegistrationPayload = (): ACRWebhookPayload | null => {
    if (deploymentCenterPublishingContext.publishingCredentials) {
      const webhookUrl = getAppDockerWebhookUrl(deploymentCenterPublishingContext.publishingCredentials);

      // NOTE(michinoy): In a multi-container configuration there is no way to detect the repository and tag as there are multiple configurations.
      // In this case the scope should be set to an empty string
      const acrTag = formProps.values.option === ContainerOptions.docker ? formProps.values.acrTag : '';
      const acrRepository = formProps.values.option === ContainerOptions.docker ? formProps.values.acrImage : '';

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

    portalContext.stopNotification(notificationId, true, t('savingContainerConfigurationSuccess'));
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
