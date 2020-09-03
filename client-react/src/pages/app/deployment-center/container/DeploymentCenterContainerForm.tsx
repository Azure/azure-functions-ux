import React, { useState, useContext } from 'react';
import { Formik, FormikProps } from 'formik';
import {
  DeploymentCenterFormData,
  DeploymentCenterContainerFormProps,
  DeploymentCenterContainerFormData,
  ContinuousDeploymentOption,
  ContainerRegistrySources,
  ContainerOptions,
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
import { getAcrWebhookName, getAppDockerWebhookUrl } from '../utility/DeploymentCenterUtility';
import { ACRWebhookPayload } from '../../../../models/acr';
import { ScmType } from '../../../../models/site/config';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';

const DeploymentCenterContainerForm: React.FC<DeploymentCenterContainerFormProps> = props => {
  const { t } = useTranslation();

  const [isRefreshConfirmDialogVisible, setIsRefreshConfirmDialogVisible] = useState(false);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const portalContext = useContext(PortalContext);
  const siteContext = useContext(SiteStateContext);
  const deploymentCenterData = new DeploymentCenterData();

  const getAppSettings = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): { [name: string]: string } => {
    const appSettings = {};

    if (values.continuousDeploymentOption === ContinuousDeploymentOption.on) {
      appSettings[DeploymentCenterConstants.enableCISetting] = 'true';
    }

    appSettings[DeploymentCenterConstants.usernameSetting] = getUsername(values);
    appSettings[DeploymentCenterConstants.passwordSetting] = getPassword(values);
    appSettings[DeploymentCenterConstants.serverUrlSetting] = getServerUrl(values);

    return appSettings;
  };

  const getServerUrl = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    if (values.registrySource === ContainerRegistrySources.acr) {
      return `https://${values.acrLoginServer}'`;
    } else if (values.registrySource === ContainerRegistrySources.privateRegistry) {
      return values.privateRegistryServerUrl;
    } else {
      return DeploymentCenterConstants.dockerHubUrl;
    }
  };

  const getUsername = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    if (values.registrySource === ContainerRegistrySources.acr) {
      return values.acrUsername;
    } else if (values.registrySource === ContainerRegistrySources.privateRegistry) {
      return values.privateRegistryUsername;
    } else {
      return values.privateRegistryUsername;
    }
  };

  const getPassword = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    if (values.registrySource === ContainerRegistrySources.acr) {
      return values.acrPassword;
    } else if (values.registrySource === ContainerRegistrySources.privateRegistry) {
      return values.privateRegistryPassword;
    } else {
      return values.privateRegistryPassword;
    }
  };

  const getFxVersion = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    const prefix = getFxVersionPrefix(values);

    if (values.option === ContainerOptions.docker) {
      return getDockerFxVersion(prefix, values);
    } else {
      throw Error('Not implemented');
    }
  };

  const getDockerFxVersion = (prefix: string, values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    if (values.registrySource === ContainerRegistrySources.acr) {
      return `${prefix}|${values.acrLoginServer}/${values.acrImage}:${values.acrTag}`;
    } else if (values.registrySource === ContainerRegistrySources.privateRegistry) {
      const server = values.privateRegistryServerUrl.toLocaleLowerCase().replace('https://', '');
      return `${prefix}|${server}/${values.privateRegistryImageAndTag}`;
    } else {
      return `${prefix}|${values.dockerHubImageAndTag}`;
    }
  };

  const getFxVersionPrefix = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>): string => {
    switch (values.option) {
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

  const saveDirectRegistrySettings = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
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
    appSettingsResponse.data.properties = getLatestAppSettings(appSettingsResponse.data.properties, values);
    siteConfigResponse.data.properties.appCommandLine = values.command;

    if (siteContext.isLinuxApp) {
      siteConfigResponse.data.properties.linuxFxVersion = getFxVersion(values);
    } else {
      siteConfigResponse.data.properties.windowsFxVersion = getFxVersion(values);
    }

    const saveAppSettingsRequest = deploymentCenterData.updateApplicationSettings(resourceId, appSettingsResponse.data);
    const saveSiteConfigRequest = deploymentCenterData.updateSiteConfig(resourceId, siteConfigResponse.data);

    const [saveAppSettingsReResponse, saveSiteConfigResponse] = await Promise.all([saveAppSettingsRequest, saveSiteConfigRequest]);

    if (!saveAppSettingsReResponse.metadata.success || !saveSiteConfigResponse.metadata.success) {
      portalContext.stopNotification(notificationId, false, t('savingContainerConfigurationFailed'));
      return;
    }

    if (values.registrySource === ContainerRegistrySources.acr) {
      // NOTE(michinoy): The registration of webhook should be a fire and forget operation. No need to wait on it.
      // Also no need to check the status.
      manageAcrWebhook(values);
    }

    portalContext.stopNotification(notificationId, true, t('savingContainerConfigurationSuccess'));
  };

  const getLatestAppSettings = (
    existingAppSettings: { [name: string]: string },
    values: DeploymentCenterFormData<DeploymentCenterContainerFormData>
  ): { [name: string]: string } => {
    const containerAppSettings = getAppSettings(values);

    delete existingAppSettings[DeploymentCenterConstants.serverUrlSetting];
    delete existingAppSettings[DeploymentCenterConstants.imageNameSetting];
    delete existingAppSettings[DeploymentCenterConstants.usernameSetting];
    delete existingAppSettings[DeploymentCenterConstants.passwordSetting];
    delete existingAppSettings[DeploymentCenterConstants.enableCISetting];

    return { ...existingAppSettings, ...containerAppSettings };
  };

  const saveGithubActionContainerSettings = async (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    throw Error('Not implemented');
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

  const onSubmit = (values: DeploymentCenterFormData<DeploymentCenterContainerFormData>) => {
    if (values.scmType === ScmType.GitHubAction) {
      saveGithubActionContainerSettings(values);
    } else {
      saveDirectRegistrySettings(values);
    }
  };

  const hideRefreshConfirmDialog = () => {
    setIsRefreshConfirmDialogVisible(false);
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
              discardFunction={formProps.resetForm}
              showPublishProfilePanel={deploymentCenterPublishingContext.showPublishProfilePanel}
              refresh={() => setIsRefreshConfirmDialogVisible(true)}
              isLoading={props.isLoading}
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
              title={t('staticSite_refreshConfirmTitle')}
              content={t('staticSite_refreshConfirmMessage')}
              hidden={!isRefreshConfirmDialogVisible}
              onDismiss={hideRefreshConfirmDialog}
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
