import React, { useState, useEffect, useContext } from 'react';
import { DeploymentCenterFormData } from './DeploymentCenter.types';
import DeploymentCenterData from './DeploymentCenter.data';
import { PortalContext } from '../../../PortalContext';
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
import { ArmObj } from '../../../models/arm-obj';
import DeploymentCenterContainerForm from './DeploymentCenterContainerForm';
import { ArmSiteDescriptor } from '../../../utils/resourceDescriptors';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import { HttpResponseObject } from '../../../ArmHelper.types';

export interface DeploymentCenterDataLoaderProps {
  resourceId: string;
}

const DeploymentCenterDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { resourceId } = props;
  const { t } = useTranslation();
  const deploymentCenterData = new DeploymentCenterData();
  const portalContext = useContext(PortalContext);
  const [hasWritePermission, setHasWritePermission] = useState(false);
  const [logs, setLogs] = useState<string | undefined>(undefined);
  const [publishingUser, setPublishingUser] = useState<ArmObj<PublishingUser> | undefined>(undefined);
  const [publishingCredentials, setPublishingCredentials] = useState<ArmObj<PublishingCredentials> | undefined>(undefined);
  const [publishingProfile, setPublishingProfile] = useState<PublishingProfile | undefined>(undefined);
  const [formData, setFormData] = useState<DeploymentCenterFormData | undefined>(undefined);
  const [siteDescriptor, setSiteDescriptor] = useState<ArmSiteDescriptor | undefined>(undefined);

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
    const writePermissionRequest = portalContext.hasPermission(resourceId, [RbacConstants.writeScope]);
    const getPublishingUserRequest = deploymentCenterData.getPublishingUser();
    const getContainerLogsRequest = deploymentCenterData.fetchContainerLogs(resourceId);
    const [writePermissionResponse, publishingUserResponse, containerLogsResponse] = await Promise.all([
      writePermissionRequest,
      getPublishingUserRequest,
      getContainerLogsRequest,
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

    if (publishingUserResponse.metadata.success) {
      setPublishingUser(publishingUserResponse.data);
      setFormData({
        publishingUsername: publishingUserResponse.data.properties.publishingUserName,
        publishingPassword: '',
        publishingConfirmPassword: '',
      });
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
      const [publishingCredentialsResponse, publishProfileResponse] = await Promise.all([
        getPublishingCredentialsRequest,
        getPublishProfileRequest,
      ]);

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
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DeploymentCenterContext.Provider value={{ resourceId, hasWritePermission, siteDescriptor }}>
      <DeploymentCenterContainerForm
        logs={logs}
        publishingUser={publishingUser}
        publishingProfile={publishingProfile}
        publishingCredentials={publishingCredentials}
        formData={formData}
        resetApplicationPassword={resetApplicationPassword}
      />
    </DeploymentCenterContext.Provider>
  );
};

export default DeploymentCenterDataLoader;
