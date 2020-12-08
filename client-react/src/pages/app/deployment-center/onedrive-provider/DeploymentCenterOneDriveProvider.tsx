import React from 'react';
import { DeploymentCenterOneDriveProviderProps } from '../DeploymentCenter.types';
import DeploymentCenterOneDriveAccount from './DeploymentCenterOneDriveAccount';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import { useTranslation } from 'react-i18next';

const DeploymentCenterOneDriveProvider: React.FC<DeploymentCenterOneDriveProviderProps> = props => {
  const { formProps, accountUser, folderOptions, loadingFolders } = props;

  const { t } = useTranslation();

  return (
    <>
      <h3>{t('deploymentCenterCodeOneDriveTitle')}</h3>

      <DeploymentCenterOneDriveAccount {...props} />

      {accountUser && accountUser.displayName && (
        <>
          <Field
            id="deployment-center-settings-folder-option"
            label={t('deploymentCenterCodeFolder')}
            name="folder"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={folderOptions}
            defaultSelectedKey={formProps.values.org}
            required={true}
            isLoading={loadingFolders}
          />
        </>
      )}
    </>
  );
};

export default DeploymentCenterOneDriveProvider;
