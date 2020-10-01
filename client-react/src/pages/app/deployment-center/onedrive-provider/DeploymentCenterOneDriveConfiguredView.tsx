import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { useTranslation } from 'react-i18next';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { Link, MessageBarType } from 'office-ui-fabric-react';
import { DeploymentCenterCodeFormData, DeploymentCenterFieldProps, AuthorizationResult } from '../DeploymentCenter.types';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import OneDriveService from '../../../../ApiHelpers/OneDriveService';
import { authorizeWithProvider } from '../utility/DeploymentCenterUtility';

const DeploymentCenterOneDriveConfiguredView: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [folder, setFolder] = useState<string | undefined>(undefined);
  const [oneDriveUsername, setOneDriveUsername] = useState<string | undefined>(t('loading'));
  const [isSourceControlLoading, setIsSourceControlLoading] = useState(true);
  const [isOneDriveUsernameLoading, setIsOneDriveUsernameLoading] = useState(true);
  const [isOneDriveUsernameMissing, setIsOneDriveUsernameMissing] = useState(false);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();

  const fetchData = async () => {
    fetchOneDriveUser();
    fetchSourceControlDetails();
  };

  const fetchOneDriveUser = async () => {
    setIsOneDriveUsernameMissing(false);
    const OneDriveUserResponse = await deploymentCenterData.getOneDriveUser(deploymentCenterContext.oneDriveToken);
    if (
      OneDriveUserResponse.metadata.success &&
      OneDriveUserResponse.data &&
      OneDriveUserResponse.data.createdBy &&
      OneDriveUserResponse.data.createdBy.user &&
      OneDriveUserResponse.data.createdBy.user.displayName
    ) {
      setOneDriveUsername(OneDriveUserResponse.data.createdBy.user.displayName);
    } else {
      // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
      setOneDriveUsername(undefined);
      setIsOneDriveUsernameMissing(true);

      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterOneDriveConfiguredView',
        `Failed to get OneDrive user details with error: ${getErrorMessage(OneDriveUserResponse.metadata.error)}`
      );
    }
    setIsOneDriveUsernameLoading(false);
  };

  const fetchSourceControlDetails = async () => {
    const sourceControlDetailsResponse = await deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);
    if (sourceControlDetailsResponse.metadata.success) {
      const repoUrlSplit = sourceControlDetailsResponse.data.properties.repoUrl.split('/');
      if (repoUrlSplit.length >= 2) {
        setFolder(`/${repoUrlSplit[repoUrlSplit.length - 1]}`);
      } else {
        setFolder('');
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterOneDriveConfiguredView',
          `Repository url incorrectly formatted: ${sourceControlDetailsResponse.data.properties.repoUrl}`
        );
      }
    } else {
      setFolder(t('deploymentCenterErrorFetchingInfo'));
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSourceControls',
        `Failed to get source control details with error: ${getErrorMessage(sourceControlDetailsResponse.metadata.error)}`
      );
    }
    setIsSourceControlLoading(false);
  };

  const authorizeOneDriveAccount = () => {
    authorizeWithProvider(OneDriveService.authorizeUrl, () => {}, completingAuthCallback);
  };

  const completingAuthCallback = async (authorizationResult: AuthorizationResult) => {
    if (authorizationResult.redirectUrl) {
      const oneDriveTokenResponse = await deploymentCenterData.getOneDriveToken(authorizationResult.redirectUrl);
      if (oneDriveTokenResponse.metadata.success) {
        deploymentCenterData.storeOneDriveToken(oneDriveTokenResponse.data);
      } else {
        // NOTE(michinoy): This is all related to the handshake between us and the provider.
        // If this fails, there isn't much the user can do except retry.

        LogService.error(
          LogCategories.deploymentCenter,
          'authorizeOnedriveAccount',
          `Failed to get token with error: ${getErrorMessage(oneDriveTokenResponse.metadata.error)}`
        );

        Promise.resolve(null);
      }
    }
    fetchData();
  };

  const getSignedInAsComponent = (isLoading: boolean) => {
    if (
      isLoading &&
      formProps &&
      formProps.values.oneDriveUser &&
      formProps.values.oneDriveUser.createdBy &&
      formProps.values.oneDriveUser.createdBy.user &&
      formProps.values.oneDriveUser.createdBy.user.displayName
    ) {
      return <div>{formProps.values.oneDriveUser.createdBy.user.displayName}</div>;
    } else if (
      isLoading &&
      (!formProps ||
        !formProps.values.oneDriveUser ||
        !formProps.values.oneDriveUser.createdBy ||
        !formProps.values.oneDriveUser.createdBy.user ||
        !formProps.values.oneDriveUser.createdBy.user.displayName)
    ) {
      return <div>{t('loading')}</div>;
    }
    return <div>{oneDriveUsername}</div>;
  };

  const getUsernameMissingComponent = () => {
    return (
      <div className={deploymentCenterInfoBannerDiv}>
        <CustomBanner
          message={
            <>
              {`${t('deploymentCenterSettingsConfiguredViewUserNotAuthorized')} `}
              <Link onClick={authorizeOneDriveAccount} target="_blank">
                {t('authorize')}
              </Link>
            </>
          }
          type={MessageBarType.error}
        />
      </div>
    );
  };

  const getFolderValue = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.folder) {
      return formProps.values.folder;
    } else if (isLoading && (!formProps || !formProps.values.folder)) {
      return t('loading');
    }
    return folder;
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFolder(getFolderValue(isSourceControlLoading));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSourceControlLoading]);

  useEffect(() => {
    getSignedInAsComponent(isOneDriveUsernameLoading);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOneDriveUsernameLoading]);

  return (
    <>
      <h3>{t('deploymentCenterCodeOneDriveTitle')}</h3>

      <ReactiveFormControl id="deployment-center-oneDrive-user" label={t('deploymentCenterOAuthSingedInAs')}>
        <>
          {isOneDriveUsernameMissing && getUsernameMissingComponent()}
          {!isOneDriveUsernameMissing && getSignedInAsComponent(isOneDriveUsernameLoading)}
        </>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-folder" label={t('deploymentCenterCodeFolder')}>
        <div>{folder}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterOneDriveConfiguredView;
