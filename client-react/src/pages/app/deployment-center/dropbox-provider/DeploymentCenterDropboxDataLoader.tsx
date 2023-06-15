import { IDropdownOption } from '@fluentui/react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import DropboxService from '../../../../ApiHelpers/DropboxService';
import { DropboxFolder, DropboxUser } from '../../../../models/dropbox';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import DeploymentCenterData from '../DeploymentCenter.data';
import { AuthorizationResult, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { authorizeWithProvider, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import DeploymentCenterDropboxProvider from './DeploymentCenterDropboxProvider';

const DeploymentCenterDropboxDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const [dropboxUser, setDropboxUser] = useState<DropboxUser | undefined>(undefined);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderOptions, setFolderOptions] = useState<IDropdownOption[]>([]);
  const [dropboxAccountStatusMessage, setDropboxAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);

  const deploymentCenterData = new DeploymentCenterData();

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
        const siteFolderExists = folderNames.find(folder => folder.name.toLocaleLowerCase() === siteName.toLocaleLowerCase());
        if (!siteFolderExists) {
          folderNames.push({ name: siteName });
        }
      }
    }

    setFolderOptions(folderNames.map(folder => ({ key: folder.name, text: folder.name })));
    setLoadingFolders(false);
  };

  const authorizeDropboxAccount = () => {
    authorizeWithProvider(DropboxService.authorizeUrl, startingAuthCallback, completingAuthCallBack);
  };

  const completingAuthCallBack = (authorizationResult: AuthorizationResult) => {
    if (authorizationResult.redirectUrl) {
      deploymentCenterData.getDropboxToken(authorizationResult.redirectUrl).then(response => {
        if (response.metadata.success) {
          deploymentCenterData.storeDropboxToken(response.data).then(() => deploymentCenterContext.refreshUserSourceControlTokens());
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'authorizeDropboxAccount', 'failed', {
              message: getErrorMessage(response.metadata.error),
              error: response.metadata.error,
            })
          );
          return Promise.resolve(null);
        }
      });
    } else {
      return fetchData();
    }
  };

  const startingAuthCallback = (): void => {
    setDropboxAccountStatusMessage(t('deploymentCenterOAuthAuthorizingUser'));
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
