import React, { useState, useEffect, useContext } from 'react';
import { DeploymentCenterDataLoaderProps } from './DeploymentCenter.types';
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
import { ArmSiteDescriptor } from '../../../utils/resourceDescriptors';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import { DeploymentCenterPublishingContext } from './DeploymentCenterPublishingContext';
import { HttpResponseObject } from '../../../ArmHelper.types';
import DeploymentCenterPublishProfilePanel from './publish-profile/DeploymentCenterPublishProfilePanel';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { SiteConfig } from '../../../models/site/config';
import { KeyValue } from '../../../models/portal-models';
import { SourceControl } from '../../../models/provider';
import { PublishingCredentialPolicies } from '../../../models/site/site';
import DeploymentCenterContainerDataLoader from './container/DeploymentCenterContainerDataLoader';
import DeploymentCenterCodeDataLoader from './code/DeploymentCenterCodeDataLoader';

enum SourceControlTypes {
  oneDrive = 'onedrive',
  dropBox = 'dropbox',
  bitBucket = 'bitbucket',
  gitHub = 'github',
}

const DeploymentCenterDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { resourceId } = props;
  const { t } = useTranslation();
  const deploymentCenterData = new DeploymentCenterData();
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);
  const [hasWritePermission, setHasWritePermission] = useState(false);
  const [publishingUser, setPublishingUser] = useState<ArmObj<PublishingUser> | undefined>(undefined);
  const [publishingCredentials, setPublishingCredentials] = useState<ArmObj<PublishingCredentials> | undefined>(undefined);
  const [publishingProfile, setPublishingProfile] = useState<PublishingProfile | undefined>(undefined);
  const [siteDescriptor, setSiteDescriptor] = useState<ArmSiteDescriptor | undefined>(undefined);
  const [applicationSettings, setApplicationSettings] = useState<ArmObj<KeyValue<string>> | undefined>(undefined);
  const [isPublishProfilePanelOpen, setIsPublishProfilePanelOpen] = useState<boolean>(false);
  const [siteConfig, setSiteConfig] = useState<ArmObj<SiteConfig> | undefined>(undefined);
  const [configMetadata, setConfigMetadata] = useState<ArmObj<KeyValue<string>> | undefined>(undefined);
  const [oneDriveToken, setOneDriveToken] = useState<string>('');
  const [dropBoxToken, setDropBoxToken] = useState<string>('');
  const [bitbucketToken, setBitbucketToken] = useState<string>('');
  const [gitHubToken, setGitHubToken] = useState<string>('');
  const [basicPublishingCredentialsPolicies, setBasicPublishingCredentialsPolicies] = useState<PublishingCredentialPolicies | undefined>(
    undefined
  );

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
    const getUserSourceControlsRequest = deploymentCenterData.getUserSourceControls();
    const getSiteConfigRequest = deploymentCenterData.getSiteConfig(resourceId);
    const getConfigMetadataRequest = deploymentCenterData.getConfigMetadata(resourceId);
    const getBasicPublishingCredentialsPoliciesRequest = deploymentCenterData.getBasicPublishingCredentialsPolicies(resourceId);

    const [
      writePermissionResponse,
      publishingUserResponse,
      siteConfigResponse,
      configMetadataResponse,
      userSourceControlsResponse,
      basicPublishingCredentialsPoliciesResponse,
    ] = await Promise.all([
      writePermissionRequest,
      getPublishingUserRequest,
      getSiteConfigRequest,
      getConfigMetadataRequest,
      getUserSourceControlsRequest,
      getBasicPublishingCredentialsPoliciesRequest,
    ]);

    if (userSourceControlsResponse.metadata.success) {
      setUserSourceControlTokens(userSourceControlsResponse.data);
    }

    if (basicPublishingCredentialsPoliciesResponse.metadata.success) {
      setBasicPublishingCredentialsPolicies(basicPublishingCredentialsPoliciesResponse.data.properties);
    }

    setSiteDescriptor(new ArmSiteDescriptor(resourceId));
    setHasWritePermission(writePermissionResponse);

    if (siteConfigResponse.metadata.success) {
      setSiteConfig(siteConfigResponse.data);
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterFtpsDataLoader',
        `Failed to get site config with error: ${getErrorMessage(siteConfigResponse.metadata.error)}`
      );
    }

    if (configMetadataResponse.metadata.success) {
      setConfigMetadata(configMetadataResponse.data);
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterFtpsDataLoader',
        `Failed to get site metadata with error: ${getErrorMessage(configMetadataResponse.metadata.error)}`
      );
    }

    if (publishingUserResponse.metadata.success) {
      setPublishingUser(publishingUserResponse.data);
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
    }
  };

  const setUserSourceControlTokens = (sourceControls: ArmArray<SourceControl>) => {
    const getToken = (sourceControl?: ArmObj<SourceControl>) =>
      sourceControl && sourceControl.properties.token ? sourceControl.properties.token : '';

    setOneDriveToken(getToken(sourceControls.value.find(item => item.name.toLocaleLowerCase() === SourceControlTypes.oneDrive)));
    setDropBoxToken(getToken(sourceControls.value.find(item => item.name.toLocaleLowerCase() === SourceControlTypes.dropBox)));
    setBitbucketToken(getToken(sourceControls.value.find(item => item.name.toLocaleLowerCase() === SourceControlTypes.bitBucket)));
    setGitHubToken(getToken(sourceControls.value.find(item => item.name.toLocaleLowerCase() === SourceControlTypes.gitHub)));
  };

  const refreshUserSourceControlTokens = async () => {
    const userSourceControlsResponse = await deploymentCenterData.getUserSourceControls();
    if (userSourceControlsResponse.metadata.success) {
      setUserSourceControlTokens(userSourceControlsResponse.data);
    }
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
  }, [siteStateContext]);

  return siteStateContext.site ? (
    // NOTE(michinoy): Populate common deployment center level properties
    <DeploymentCenterContext.Provider
      value={{
        resourceId,
        hasWritePermission,
        siteDescriptor,
        siteConfig,
        applicationSettings,
        configMetadata,
        oneDriveToken,
        dropBoxToken,
        bitbucketToken,
        gitHubToken,
        refresh,
        refreshUserSourceControlTokens,
      }}>
      {/* NOTE(michinoy): Populate common publishing specific properties */}
      <DeploymentCenterPublishingContext.Provider
        value={{
          basicPublishingCredentialsPolicies,
          publishingUser,
          publishingProfile,
          publishingCredentials,
          resetApplicationPassword,
          showPublishProfilePanel,
        }}>
        {/* NOTE(michinoy): Load the specific experience based on the app settings */}
        {siteStateContext.isContainerApp ? (
          <DeploymentCenterContainerDataLoader resourceId={resourceId} />
        ) : (
          <DeploymentCenterCodeDataLoader resourceId={resourceId} />
        )}
        {/* NOTE(michinoy): Load the publishing profile panel which is common between both code and container experiences  */}
        <DeploymentCenterPublishProfilePanel
          isPanelOpen={isPublishProfilePanelOpen}
          dismissPanel={dismissPublishProfilePanel}
          resetApplicationPassword={resetApplicationPassword}
        />
      </DeploymentCenterPublishingContext.Provider>
    </DeploymentCenterContext.Provider>
  ) : (
    <LoadingComponent />
  );
};

export default DeploymentCenterDataLoader;
