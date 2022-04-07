import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { OneDriveUser, OneDriveFolder } from '../../../../models/onedrive';
import { DeploymentCenterFieldProps, AuthorizationResult } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import DeploymentCenterOneDriveProvider from './DeploymentCenterOneDriveProvider';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { SiteStateContext } from '../../../../SiteState';
import OneDriveService from '../../../../ApiHelpers/OneDriveService';
import { authorizeWithProvider, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';

const DeploymentCenterOneDriveDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const [oneDriveUser, setOneDriveUser] = useState<OneDriveUser | undefined>(undefined);
  const [oneDriveAccountStatusMessage, setOneDriveAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderOptions, setFolderOptions] = useState<IDropdownOption[]>([]);
  const deploymentCenterData = new DeploymentCenterData();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);

  const fetchData = async () => {
    const oneDriveUserResponse = await deploymentCenterData.getOneDriveUser(deploymentCenterContext.oneDriveToken);

    setOneDriveAccountStatusMessage(undefined);

    if (
      oneDriveUserResponse.metadata.success &&
      oneDriveUserResponse.data &&
      oneDriveUserResponse.data.createdBy &&
      oneDriveUserResponse.data.createdBy.user &&
      oneDriveUserResponse.data.createdBy.user.displayName
    ) {
      // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
      setOneDriveUser(oneDriveUserResponse.data);
      formProps.setFieldValue('oneDriveUser', oneDriveUserResponse.data);
    }
  };

  const fetchFolderOptions = async () => {
    setLoadingFolders(true);
    setFolderOptions([]);
    const folderNames: OneDriveFolder[] = [];

    if (oneDriveUser) {
      const oneDriveFolderResponse = await deploymentCenterData.getOneDriveFolders(deploymentCenterContext.oneDriveToken);

      if (oneDriveFolderResponse) {
        oneDriveFolderResponse.forEach(item => {
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

  const authorizeOneDriveAccount = () => {
    authorizeWithProvider(OneDriveService.authorizeUrl, startingAuthCallback, completingAuthCallBack);
  };

  const completingAuthCallBack = (authorizationResult: AuthorizationResult) => {
    if (authorizationResult.redirectUrl) {
      deploymentCenterData.getOneDriveToken(authorizationResult.redirectUrl).then(response => {
        if (response.metadata.success) {
          deploymentCenterData.storeOneDriveToken(response.data).then(() => deploymentCenterContext.refreshUserSourceControlTokens());
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'authorizeOneDriveAccount', 'failed', {
              message: getErrorMessage(response.metadata.error),
              error: response.metadata.error,
            })
          );
          return Promise.resolve(undefined);
        }
      });
    } else {
      return fetchData();
    }
  };

  const startingAuthCallback = (): void => {
    setOneDriveAccountStatusMessage(t('deploymentCenterOAuthAuthorizingUser'));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!formProps.values.oneDriveUser) {
      fetchData();
    } else {
      setOneDriveUser(formProps.values.oneDriveUser);
      setOneDriveAccountStatusMessage(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.oneDriveToken]);

  useEffect(() => {
    fetchFolderOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oneDriveUser]);

  return (
    <DeploymentCenterOneDriveProvider
      formProps={formProps}
      accountUser={oneDriveUser}
      accountStatusMessage={oneDriveAccountStatusMessage}
      authorizeAccount={authorizeOneDriveAccount}
      folderOptions={folderOptions}
      loadingFolders={loadingFolders}
    />
  );
};

export default DeploymentCenterOneDriveDataLoader;
