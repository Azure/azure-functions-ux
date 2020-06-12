import React, { useState, useEffect, useContext } from 'react';
import {
  DeploymentCenterFormData,
  DeploymentCenterYupValidationSchemaType,
  DeploymentProperties,
  DeploymentCenterCodeFormData,
  DeploymentCenterContainerFormData,
} from './DeploymentCenter.types';
import DeploymentCenterData from './DeploymentCenter.data';
import { PortalContext } from '../../../PortalContext';
import { SiteStateContext } from '../../../SiteState';
import RbacConstants from '../../../utils/rbac-constants';
import LogService from '../../../utils/LogService';
import { LogCategories } from '../../../utils/LogCategories';
import { getErrorMessage } from '../../../ApiHelpers/ArmHelper';
import {
  parsePublishProfileXml,
  PublishMethod,
  PublishingUser,
  PublishingCredentials,
  PublishingProfile,
} from '../../../models/site/publish';
import { useTranslation } from 'react-i18next';
import { ArmObj, ArmArray } from '../../../models/arm-obj';
import DeploymentCenterContainerForm from './container/DeploymentCenterContainerForm';
import DeploymentCenterCodeForm from './code/DeploymentCenterCodeForm';
import { ArmSiteDescriptor } from '../../../utils/resourceDescriptors';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import { HttpResponseObject } from '../../../ArmHelper.types';
import { DeploymentCenterContainerFormBuilder } from './container/DeploymentCenterContainerFormBuilder';
import DeploymentCenterPublishProfilePanel from './publish-profile/DeploymentCenterPublishProfilePanel';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { isContainerApp, isLinuxApp } from '../../../utils/arm-utils';
import { SiteConfig } from '../../../models/site/config';
import { KeyValue } from '../../../models/portal-models';
import { DeploymentCenterCodeFormBuilder } from './code/DeploymentCenterCodeFormBuilder';

export interface DeploymentCenterDataLoaderProps {
  resourceId: string;
}

const DeploymentCenterDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { resourceId } = props;
  const { t } = useTranslation();
  const deploymentCenterData = new DeploymentCenterData();
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);
  const [hasWritePermission, setHasWritePermission] = useState(false);
  const [logs, setLogs] = useState<string | undefined>(undefined);
  const [publishingUser, setPublishingUser] = useState<ArmObj<PublishingUser> | undefined>(undefined);
  const [publishingCredentials, setPublishingCredentials] = useState<ArmObj<PublishingCredentials> | undefined>(undefined);
  const [publishingProfile, setPublishingProfile] = useState<PublishingProfile | undefined>(undefined);
  const [siteDescriptor, setSiteDescriptor] = useState<ArmSiteDescriptor | undefined>(undefined);
  const [applicationSettings, setApplicationSettings] = useState<ArmObj<KeyValue<string>> | undefined>(undefined);
  const [containerFormData, setContainerFormData] = useState<DeploymentCenterFormData<DeploymentCenterContainerFormData> | undefined>(
    undefined
  );
  const [containerFormValidationSchema, setContainerFormValidationSchema] = useState<
    DeploymentCenterYupValidationSchemaType<DeploymentCenterContainerFormData> | undefined
  >(undefined);
  const [codeFormData, setCodeFormData] = useState<DeploymentCenterFormData<DeploymentCenterCodeFormData> | undefined>(undefined);
  const [codeFormValidationSchema, setCodeFormValidationSchema] = useState<
    DeploymentCenterYupValidationSchemaType<DeploymentCenterCodeFormData> | undefined
  >(undefined);
  const [isPublishProfilePanelOpen, setIsPublishProfilePanelOpen] = useState<boolean>(false);
  const [deployments, setDeployments] = useState<ArmArray<DeploymentProperties> | undefined>(undefined);
  const [siteConfig, setSiteConfig] = useState<ArmObj<SiteConfig> | undefined>(undefined);
  const [configMetadata, setConfigMetadata] = useState<ArmObj<KeyValue<string>> | undefined>(undefined);
  const [deploymentsError, setDeploymentsError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isContainerApplication, setIsContainerApplication] = useState(false);
  const [isLinuxApplication, setIsLinuxApplication] = useState(false);

  const deploymentCenterContainerFormBuilder = new DeploymentCenterContainerFormBuilder(t);
  const deploymentCenterCodeFormBuilder = new DeploymentCenterCodeFormBuilder(t);

  const processPublishProfileResponse = (publishProfileResponse: HttpResponseObject<string>) => {
    if (publishProfileResponse.metadata.success) {
      const publishingProfiles = parsePublishProfileXml(publishProfileResponse.data);
      setPublishingProfile(publishingProfiles.filter(profile => profile.publishMethod === PublishMethod.FTP)[0]);
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterFtpsDataLoader',
        `Failed to fetch publish profile with error: ${getErrorMessage(publishProfileResponse.metadata.error)}`
      );
    }
  };

  const resetApplicationPassword = async () => {
    const notificationId = portalContext.startNotification(
      t('siteSummary_resetProfileNotifyTitle'),
      t('siteSummary_resetProfileNotifyTitle')
    );

    const resetResponse = await deploymentCenterData.resetPublishProfile(resourceId);

    if (resetResponse.metadata.success) {
      const publishProfileResponse = await deploymentCenterData.getPublishProfile(resourceId);
      processPublishProfileResponse(publishProfileResponse);
      portalContext.stopNotification(notificationId, true, t('siteSummary_resetProfileNotifySuccess'));
    } else {
      portalContext.stopNotification(notificationId, false, t('siteSummary_resetProfileNotifyFail'));
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    const writePermissionRequest = portalContext.hasPermission(resourceId, [RbacConstants.writeScope]);
    const getPublishingUserRequest = deploymentCenterData.getPublishingUser();
    const getContainerLogsRequest = deploymentCenterData.fetchContainerLogs(resourceId);
    const getSiteConfigRequest = deploymentCenterData.getSiteConfig(resourceId);
    const getDeploymentsRequest = deploymentCenterData.getSiteDeployments(resourceId);
    const getConfigMetadataRequest = deploymentCenterData.getConfigMetadata(resourceId);

    const [
      writePermissionResponse,
      publishingUserResponse,
      containerLogsResponse,
      siteConfigResponse,
      deploymentsResponse,
      configMetadataResponse,
    ] = await Promise.all([
      writePermissionRequest,
      getPublishingUserRequest,
      getContainerLogsRequest,
      getSiteConfigRequest,
      getDeploymentsRequest,
      getConfigMetadataRequest,
    ]);

    setSiteDescriptor(new ArmSiteDescriptor(resourceId));
    setHasWritePermission(writePermissionResponse);

    if (containerLogsResponse.metadata.success) {
      setLogs(containerLogsResponse.data);
    } else {
      const errorMessage = getErrorMessage(containerLogsResponse.metadata.error);
      setLogs(
        errorMessage ? t('deploymentCenterContainerLogsFailedWithError').format(errorMessage) : t('deploymentCenterContainerLogsFailed')
      );
    }

    if (deploymentsResponse.metadata.success) {
      setDeployments(deploymentsResponse.data);
    } else {
      const errorMessage = getErrorMessage(deploymentsResponse.metadata.error);
      setDeploymentsError(
        errorMessage ? t('deploymentCenterCodeDeploymentsFailedWithError').format(errorMessage) : t('deploymentCenterCodeDeploymentsFailed')
      );
    }

    if (siteConfigResponse.metadata.success) {
      setSiteConfig(siteConfigResponse.data);
      deploymentCenterContainerFormBuilder.setSiteConfig(siteConfigResponse.data);
      deploymentCenterCodeFormBuilder.setSiteConfig(siteConfigResponse.data);
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterFtpsDataLoader',
        `Failed to get site config with error: ${getErrorMessage(siteConfigResponse.metadata.error)}`
      );
    }

    if (configMetadataResponse.metadata.success) {
      setConfigMetadata(configMetadataResponse.data);
      deploymentCenterContainerFormBuilder.setConfigMetadata(configMetadataResponse.data);
      deploymentCenterCodeFormBuilder.setConfigMetadata(configMetadataResponse.data);
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterFtpsDataLoader',
        `Failed to get site metadata with error: ${getErrorMessage(configMetadataResponse.metadata.error)}`
      );
    }

    if (publishingUserResponse.metadata.success) {
      setPublishingUser(publishingUserResponse.data);
      deploymentCenterContainerFormBuilder.setPublishingUser(publishingUserResponse.data);
      deploymentCenterCodeFormBuilder.setPublishingUser(publishingUserResponse.data);
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterFtpsDataLoader',
        `Failed to fetch publishing user with error: ${getErrorMessage(publishingUserResponse.metadata.error)}`
      );
    }

    if (writePermissionResponse) {
      const getPublishingCredentialsRequest = deploymentCenterData.getPublishingCredentials(resourceId);
      const getPublishProfileRequest = deploymentCenterData.getPublishProfile(resourceId);
      const fetchApplicationSettingsRequest = deploymentCenterData.fetchApplicationSettings(resourceId);
      const [publishingCredentialsResponse, publishProfileResponse, fetchApplicationSettingsResponse] = await Promise.all([
        getPublishingCredentialsRequest,
        getPublishProfileRequest,
        fetchApplicationSettingsRequest,
      ]);

      if (fetchApplicationSettingsResponse.metadata.success) {
        setApplicationSettings(fetchApplicationSettingsResponse.data);
        deploymentCenterContainerFormBuilder.setApplicationSettings(fetchApplicationSettingsResponse.data);
        deploymentCenterCodeFormBuilder.setApplicationSettings(fetchApplicationSettingsResponse.data);
      } else {
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterFtpsDataLoader',
          `Failed to get site application settings with error: ${getErrorMessage(fetchApplicationSettingsResponse.metadata.error)}`
        );
      }

      if (publishingCredentialsResponse.metadata.success) {
        setPublishingCredentials(publishingCredentialsResponse.data);
      } else {
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterFtpsDataLoader',
          `Failed to fetch publishing credentials with error: ${getErrorMessage(publishingCredentialsResponse.metadata.error)}`
        );
      }

      processPublishProfileResponse(publishProfileResponse);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }

    setContainerFormData(deploymentCenterContainerFormBuilder.generateFormData());
    setContainerFormValidationSchema(deploymentCenterContainerFormBuilder.generateYupValidationSchema());

    setCodeFormData(deploymentCenterCodeFormBuilder.generateFormData());
    setCodeFormValidationSchema(deploymentCenterCodeFormBuilder.generateYupValidationSchema());
  };

  const showPublishProfilePanel = () => {
    setIsPublishProfilePanelOpen(true);
  };

  const dismissPublishProfilePanel = () => {
    setIsPublishProfilePanelOpen(false);
  };

  const refresh = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (siteStateContext.site) {
      setIsContainerApplication(isContainerApp(siteStateContext.site));
      setIsLinuxApplication(isLinuxApp(siteStateContext.site));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext]);

  return siteStateContext.site ? (
    <DeploymentCenterContext.Provider
      value={{
        resourceId,
        hasWritePermission,
        siteDescriptor,
        siteConfig,
        applicationSettings,
        isContainerApplication,
        isLinuxApplication,
        configMetadata,
      }}>
      {isContainerApp(siteStateContext.site) ? (
        <DeploymentCenterContainerForm
          logs={logs}
          publishingUser={publishingUser}
          publishingProfile={publishingProfile}
          publishingCredentials={publishingCredentials}
          formData={containerFormData}
          formValidationSchema={containerFormValidationSchema}
          resetApplicationPassword={resetApplicationPassword}
          showPublishProfilePanel={showPublishProfilePanel}
          refresh={refresh}
          isLoading={isLoading}
        />
      ) : (
        <DeploymentCenterCodeForm
          deployments={deployments}
          deploymentsError={deploymentsError}
          publishingUser={publishingUser}
          publishingProfile={publishingProfile}
          publishingCredentials={publishingCredentials}
          formData={codeFormData}
          formValidationSchema={codeFormValidationSchema}
          resetApplicationPassword={resetApplicationPassword}
          showPublishProfilePanel={showPublishProfilePanel}
          refresh={refresh}
          isLoading={isLoading}
        />
      )}
      <DeploymentCenterPublishProfilePanel
        isPanelOpen={isPublishProfilePanelOpen}
        dismissPanel={dismissPublishProfilePanel}
        resetApplicationPassword={resetApplicationPassword}
      />
    </DeploymentCenterContext.Provider>
  ) : (
    <LoadingComponent />
  );
};

export default DeploymentCenterDataLoader;
