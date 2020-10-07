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
import { DeploymentCenterCodeFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';

const DeploymentCenterDropboxConfiguredView: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const [folder, setFolder] = useState<string | undefined>(undefined);
  const [dropboxUsername, setDropboxUsername] = useState<string | undefined>(t('loading'));
  const [isSourceControlLoading, setIsSourceControlLoading] = useState(true);
  const [isDropboxUsernameLoading, setIsDropboxUsernameLoading] = useState(true);
  const [isDropboxUsernameMissing, setIsDropboxUsernameMissing] = useState(false);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();

  const fetchData = async () => {
    fetchDropboxUser();
    fetchSourceControlDetails();
  };

  const fetchDropboxUser = async () => {
    setIsDropboxUsernameMissing(false);
    const dropboxUserResponse = await deploymentCenterData.getDropboxUser(deploymentCenterContext.dropboxToken);
    if (
      dropboxUserResponse.metadata.success &&
      dropboxUserResponse.data &&
      dropboxUserResponse.data.name &&
      dropboxUserResponse.data.name.display_name
    ) {
      setDropboxUsername(dropboxUserResponse.data.name.display_name);
    } else {
      // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
      setDropboxUsername(undefined);
      setIsDropboxUsernameMissing(true);

      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterDropboxConfiguredView',
        `Failed to get Dropbox user details with error: ${getErrorMessage(dropboxUserResponse.metadata.error)}`
      );
    }
    setIsDropboxUsernameLoading(false);
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
          'DeploymentCenterDropboxConfiguredView',
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

  const authorizeDropboxAccount = () => {
    throw Error('Not implemented');
  };

  const getSignedInAsComponent = (isLoading: boolean) => {
    if (
      isLoading &&
      formProps &&
      formProps.values.dropboxUser &&
      formProps.values.dropboxUser.name &&
      formProps.values.dropboxUser.name.display_name
    ) {
      return <div>{formProps.values.dropboxUser.name.display_name}</div>;
    } else if (
      isLoading &&
      (!formProps || !formProps.values.dropboxUser || !formProps.values.dropboxUser.name || !formProps.values.dropboxUser.name.display_name)
    ) {
      return <div>{t('loading')}</div>;
    }
    return <div>{dropboxUsername}</div>;
  };

  const getUsernameMissingComponent = () => {
    return (
      <div className={deploymentCenterInfoBannerDiv}>
        <CustomBanner
          message={
            <>
              {`${t('deploymentCenterSettingsConfiguredViewUserNotAuthorized')} `}
              <Link onClick={authorizeDropboxAccount} target="_blank">
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
    getSignedInAsComponent(isDropboxUsernameLoading);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDropboxUsernameLoading]);

  return (
    <>
      <h3>{t('deploymentCenterCodeDropboxTitle')}</h3>

      <ReactiveFormControl id="deployment-center-Dropbox-user" label={t('deploymentCenterOAuthSingedInAs')}>
        <>
          {isDropboxUsernameMissing && getUsernameMissingComponent()}
          {!isDropboxUsernameMissing && getSignedInAsComponent(isDropboxUsernameLoading)}
        </>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-folder" label={t('deploymentCenterCodeFolder')}>
        <div>{folder}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterDropboxConfiguredView;
