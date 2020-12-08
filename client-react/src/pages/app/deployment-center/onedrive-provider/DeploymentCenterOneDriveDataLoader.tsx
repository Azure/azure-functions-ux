import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { OneDriveUser } from '../../../../models/onedrive';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import DeploymentCenterOneDriveProvider from './DeploymentCenterOneDriveProvider';

const DeploymentCenteroneDriveDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const [oneDriveUser, setOneDriveUser] = useState<OneDriveUser | undefined>(undefined);
  const [oneDriveAccountStatusMessage, setOneDriveAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderOptions, setFolderOptions] = useState<IDropdownOption[]>([]);

  const fetchData = async () => {
    setOneDriveUser(undefined);
    fetchFolderOptions();
    throw Error('Not implemented');
  };

  const fetchFolderOptions = async () => {
    setLoadingFolders(false);
    setFolderOptions([]);
    throw Error('Not implemented');
  };

  const authorizeoneDriveAccount = () => {
    setOneDriveAccountStatusMessage(t('deploymentCenterOAuthAuthorizingUser'));
    throw Error('Not implemented');
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DeploymentCenterOneDriveProvider
      formProps={formProps}
      accountUser={oneDriveUser}
      accountStatusMessage={oneDriveAccountStatusMessage}
      authorizeAccount={authorizeoneDriveAccount}
      folderOptions={folderOptions}
      loadingFolders={loadingFolders}
    />
  );
};

export default DeploymentCenteroneDriveDataLoader;
