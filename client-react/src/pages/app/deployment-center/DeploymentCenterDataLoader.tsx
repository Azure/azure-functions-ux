import React, { useState, useEffect, useContext } from 'react';
import { DeploymentCenterFormData, DeploymentCenterYupValidationSchemaType } from './DeploymentCenter.types';
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
import * as Yup from 'yup';

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
  const [siteDescriptor, setSiteDescriptor] = useState<ArmSiteDescriptor | undefined>(undefined);
  const [formData, setFormData] = useState<DeploymentCenterFormData | undefined>(undefined);
  const [formValidationSchema, setFormValidationSchema] = useState<DeploymentCenterYupValidationSchemaType | undefined>(undefined);

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

      // NOTE(michinoy): The password should be at least eight characters long and must contain letters and numbers.
      const passwordMinimumRequirementsRegex = new RegExp(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*#?&]{8,}$/);
      const usernameMinLength = 3;
      setFormValidationSchema(
        Yup.object().shape({
          publishingUsername: Yup.string().test(
            'usernameMinCharsIfEntered',
            t('usernameLengthRequirements').format(usernameMinLength),
            value => {
              if (value && value.length < usernameMinLength) {
                return false;
              }
              return true;
            }
          ),
          publishingPassword: Yup.string().test('validateIfNeeded', t('userCredsError'), value => {
            if (value) {
              return passwordMinimumRequirementsRegex.test(value);
            }
            return true;
          }),
          // NOTE(michinoy): Cannot use the arrow operator for the test function as 'this' context is required.
          publishingConfirmPassword: Yup.string().test('validateIfNeeded', t('nomatchpassword'), function(value) {
            if (this.parent.publishingPassword && this.parent.publishingPassword !== value) {
              return false;
            }
            return true;
          }),
        })
      );
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
        formValidationSchema={formValidationSchema}
        resetApplicationPassword={resetApplicationPassword}
      />
    </DeploymentCenterContext.Provider>
  );
};

export default DeploymentCenterDataLoader;
