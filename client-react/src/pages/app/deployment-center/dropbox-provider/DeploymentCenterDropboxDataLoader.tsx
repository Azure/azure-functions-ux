import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DropboxUser } from '../../../../models/dropbox';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import DeploymentCenterDropboxProvider from './DeploymentCenterDropboxProvider';

const DeploymentCenterDropboxDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const [dropboxUser, setDropboxUser] = useState<DropboxUser | undefined>(undefined);
  const [dropboxAccountStatusMessage, setDropboxAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderOptions, setFolderOptions] = useState<IDropdownOption[]>([]);

  const fetchData = async () => {
    setDropboxUser(undefined);
    setDropboxAccountStatusMessage(undefined);
    fetchFolderOptions();
    throw Error('Not implemented');
  };

  const fetchFolderOptions = async () => {
    setLoadingFolders(true);
    setFolderOptions([]);
    throw Error('Not implemented');
  };

  const authorizeDropboxAccount = () => {
    throw Error('Not implemented');
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DeploymentCenterDropboxProvider
      formProps={formProps}
      accountUser={dropboxUser}
      accountStatusMessage={dropboxAccountStatusMessage}
      authorizeAccount={authorizeDropboxAccount}
      folderOptions={folderOptions}
      loadingFolders={loadingFolders}
    />
  );
};

export default DeploymentCenterDropboxDataLoader;
