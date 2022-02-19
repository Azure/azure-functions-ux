import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { useTranslation } from 'react-i18next';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { Link, MessageBarType } from 'office-ui-fabric-react';
import { DeploymentCenterCodeFormData, DeploymentCenterFieldProps, AuthorizationResult } from '../DeploymentCenter.types';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import OneDriveService from '../../../../ApiHelpers/OneDriveService';
import { authorizeWithProvider, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';

const DeploymentCenterOneDriveConfiguredView: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [folder, setFolder] = useState<string | undefined>(undefined);
  const [oneDriveUsername, setOneDriveUsername] = useState<string | undefined>(t('loading'));
  const [isSourceControlLoading, setIsSourceControlLoading] = useState(true);
  const [isOneDriveUsernameLoading, setIsOneDriveUsernameLoading] = useState(true);
  const [isOneDriveUsernameMissing, setIsOneDriveUsernameMissing] = useState(false);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);

  const deploymentCenterData = new DeploymentCenterData();

  const fetchData = async () => {
    fetchOneDriveUser();
    fetchSourceControlDetails();
  };

  const fetchOneDriveUser = async () => {
    setIsOneDriveUsernameMissing(false);
    const oneDriveUserResponse = await deploymentCenterData.getOneDriveUser(deploymentCenterContext.oneDriveToken);
    if (
      oneDriveUserResponse.metadata.success &&
      oneDriveUserResponse.data &&
      oneDriveUserResponse.data.createdBy &&
      oneDriveUserResponse.data.createdBy.user &&
      oneDriveUserResponse.data.createdBy.user.displayName
    ) {
      setOneDriveUsername(oneDriveUserResponse.data.createdBy.user.displayName);
    } else {
      // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
      setOneDriveUsername(undefined);
      setIsOneDriveUsernameMissing(true);
      portalContext.log(
        getTelemetryInfo('error', 'getOneDriveUser', 'failed', {
          message: getErrorMessage(oneDriveUserResponse.metadata.error),
          error: oneDriveUserResponse.metadata.error,
        })
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
        portalContext.log(
          getTelemetryInfo('error', 'splitRepositoryUrl', 'failed', {
            message: `Repository url incorrectly formatted: ${sourceControlDetailsResponse.data.properties.repoUrl}`,
          })
        );
      }
    } else {
      setFolder(t('deploymentCenterErrorFetchingInfo'));
      portalContext.log(
        getTelemetryInfo('error', 'getSourceControls', 'failed', {
          message: getErrorMessage(sourceControlDetailsResponse.metadata.error),
          error: sourceControlDetailsResponse.metadata.error,
        })
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
        await deploymentCenterData.storeOneDriveToken(oneDriveTokenResponse.data);
      } else {
        // NOTE(michinoy): This is all related to the handshake between us and the provider.
        // If this fails, there isn't much the user can do except retry.
        portalContext.log(
          getTelemetryInfo('error', 'authorizeOneDriveAccount', 'failed', {
            message: getErrorMessage(oneDriveTokenResponse.metadata.error),
            error: oneDriveTokenResponse.metadata.error,
          })
        );
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
          id="deployment-center-settings-configured-view-user-not-authorized"
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
