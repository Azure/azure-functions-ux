import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { DropboxFolder, DropboxUser } from '../../../../models/dropbox';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import DeploymentCenterDropboxProvider from './DeploymentCenterDropboxProvider';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterDropboxDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const [dropboxUser, setDropboxUser] = useState<DropboxUser | undefined>(undefined);
  const [dropboxAccountStatusMessage, setDropboxAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderOptions, setFolderOptions] = useState<IDropdownOption[]>([]);

  const deploymentCenterData = new DeploymentCenterData();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);

  const fetchData = async () => {
    const dropboxUserResponse = await deploymentCenterData.getDropboxUser(deploymentCenterContext.dropboxToken);

    setDropboxAccountStatusMessage(undefined);

    if (
      dropboxUserResponse.metadata.success &&
      dropboxUserResponse.data &&
      dropboxUserResponse.data.name &&
      dropboxUserResponse.data.name.display_name
    ) {
      // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
      setDropboxUser(dropboxUserResponse.data);
      formProps.setFieldValue('dropboxUser', dropboxUserResponse.data);
    }
  };

  const fetchFolderOptions = async () => {
    setLoadingFolders(true);
    setFolderOptions([]);
    const folderNames: DropboxFolder[] = [];

    if (dropboxUser) {
      const dropboxFolderResponse = await deploymentCenterData.getDropboxFolders(deploymentCenterContext.dropboxToken);

      if (dropboxFolderResponse) {
        dropboxFolderResponse.forEach(item => {
          folderNames.push(item);
        });
      }

      if (siteStateContext.site && siteStateContext.site.properties && siteStateContext.site.properties.name) {
        const siteName = siteStateContext.site.properties.name;
        const siteFolderExists = folderNames.find(folder => folder.name === siteName);
        if (!siteFolderExists) {
          folderNames.push({ name: siteName });
        }
      }
    }

    setFolderOptions(folderNames.map(folder => ({ key: folder.name, text: folder.name })));
    setLoadingFolders(false);
  };

  const authorizeDropboxAccount = () => {
    throw Error('Not implemented');
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!formProps.values.dropboxUser) {
      fetchData();
    } else {
      setDropboxUser(formProps.values.dropboxUser);
      setDropboxAccountStatusMessage(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.dropboxToken]);

  useEffect(() => {
    fetchFolderOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropboxUser]);

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
