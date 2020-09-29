import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { OneDriveUser, OneDriveFolder } from '../../../../models/onedrive';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import DeploymentCenterOneDriveProvider from './DeploymentCenterOneDriveProvider';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';

const DeploymentCenteroneDriveDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
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

  const fetchData = async () => {
    const OneDriveUserResponse = await deploymentCenterData.getOneDriveUser(deploymentCenterContext.oneDriveToken);

    setOneDriveAccountStatusMessage(undefined);

    if (
      OneDriveUserResponse.metadata.success &&
      OneDriveUserResponse.data &&
      OneDriveUserResponse.data.createdBy &&
      OneDriveUserResponse.data.createdBy.user &&
      OneDriveUserResponse.data.createdBy.user.displayName
    ) {
      // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
      setOneDriveUser(OneDriveUserResponse.data);
      formProps.setFieldValue('oneDriveUser', OneDriveUserResponse.data);
    }
  };

  const fetchFolderOptions = async () => {
    setLoadingFolders(true);
    setFolderOptions([]);
    let folderNames: OneDriveFolder[] = [];

    if (oneDriveUser) {
      const oneDriveFolderResponse = await deploymentCenterData.getOneDriveFolders(deploymentCenterContext.oneDriveToken);
      oneDriveFolderResponse.forEach(item => {
        folderNames.push(item);
      });
    }

    const newFolderOptions: IDropdownOption[] = folderNames.map(folder => ({ key: folder.name, text: folder.name }));

    setFolderOptions(newFolderOptions);
    setLoadingFolders(false);
  };

  const authorizeoneDriveAccount = () => {
    setOneDriveAccountStatusMessage(t('deploymentCenterOAuthAuthorizingUser'));
    throw Error('Not implemented');
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
      authorizeAccount={authorizeoneDriveAccount}
      folderOptions={folderOptions}
      loadingFolders={loadingFolders}
    />
  );
};

export default DeploymentCenteroneDriveDataLoader;
