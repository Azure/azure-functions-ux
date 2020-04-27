import React, { useState, useEffect, useContext } from 'react';
import { FormikActions } from 'formik';
import { DeploymentCenterFormValues, DeploymentCenterFormProps } from './DeploymentCenter.types';
import DeploymentCenterData from './DeploymentCenter.data';
import { PortalContext } from '../../../PortalContext';
import RbacConstants from '../../../utils/rbac-constants';
import LogService from '../../../utils/LogService';
import { LogCategories } from '../../../utils/LogCategories';
import { getErrorMessage } from '../../../ApiHelpers/ArmHelper';
import { parsePublishProfileXml } from '../../../models/site/publish';
import DeploymentCenterForm from './DeploymentCenterForm';

export interface DeploymentCenterDataLoaderProps {
  children: (props: DeploymentCenterFormProps) => JSX.Element;
  resourceId: string;
}

const DeploymentCenterDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { resourceId } = props;
  const deploymentCenterData = new DeploymentCenterData();
  const portalContext = useContext(PortalContext);
  const [initialValues, setInitialValues] = useState<DeploymentCenterFormValues | null>(null);

  const fetchData = async () => {
    const writePermissionRequest = portalContext.hasPermission(resourceId, [RbacConstants.writeScope]);
    const getPublishingUserRequest = deploymentCenterData.getPublishingUser();
    const [hasWritePermission, publishingUserResponse] = await Promise.all([writePermissionRequest, getPublishingUserRequest]);

    const initialDataValues: DeploymentCenterFormValues = {
      hasWritePermission,
      publishingCredentials: undefined,
      publishingUser: undefined,
      ftpPublishingProfile: undefined,
    };

    if (publishingUserResponse.metadata.success) {
      initialDataValues.publishingUser = publishingUserResponse.data;
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterFtpsDataLoader',
        `Failed to fetch publishing user with error: ${getErrorMessage(publishingUserResponse.metadata.error)}`
      );
    }

    if (hasWritePermission) {
      const getPublishingCredentialsRequest = deploymentCenterData.getPublishingCredentials(resourceId);
      const getPublishProfileRequest = deploymentCenterData.getPublishProfile(resourceId);
      const [publishingCredentialsResponse, publishProfileResponse] = await Promise.all([
        getPublishingCredentialsRequest,
        getPublishProfileRequest,
      ]);

      if (publishingCredentialsResponse.metadata.success) {
        initialDataValues.publishingCredentials = publishingCredentialsResponse.data;
      } else {
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterFtpsDataLoader',
          `Failed to fetch publishing credentials with error: ${getErrorMessage(publishingCredentialsResponse.metadata.error)}`
        );
      }

      if (publishProfileResponse.metadata.success) {
        const publishingProfiles = parsePublishProfileXml(publishProfileResponse.data);

        initialDataValues.ftpPublishingProfile = publishingProfiles.filter(
          profile => profile.publishMethod.toLocaleLowerCase() === 'ftp'
        )[0];
      } else {
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterFtpsDataLoader',
          `Failed to fetch publish profile with error: ${getErrorMessage(publishProfileResponse.metadata.error)}`
        );
      }
    }

    setInitialValues(initialDataValues);
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshSettings = () => {
    fetchData();
  };

  const onSubmit = (values: DeploymentCenterFormValues, action: FormikActions<DeploymentCenterFormValues>) => {
    throw Error('not implemented');
  };

  return (
    <DeploymentCenterForm resourceId={resourceId} initialValues={initialValues} refreshSettings={refreshSettings} onSubmit={onSubmit} />
  );
};

export default DeploymentCenterDataLoader;
