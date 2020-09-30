import React, { useContext } from 'react';
import { DeploymentCenterOneDriveProviderProps } from '../DeploymentCenter.types';
import DeploymentCenterOneDriveAccount from './DeploymentCenterOneDriveAccount';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import { useTranslation } from 'react-i18next';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterOneDriveProvider: React.FC<DeploymentCenterOneDriveProviderProps> = props => {
  const { formProps, accountUser, folderOptions, loadingFolders } = props;

  const { t } = useTranslation();
  const siteStateContext = useContext(SiteStateContext);

  const setDefaultSelectedKey = () => {
    if (!formProps.values.folder) {
      let appFolderName = '';
      if (siteStateContext.site && siteStateContext.site.properties && siteStateContext.site.properties.name) {
        appFolderName = siteStateContext.site.properties.name;
      }
      formProps.setFieldValue('folder', appFolderName);
    }
    return formProps.values.folder;
  };

  return (
    <>
      <h3>{t('deploymentCenterCodeOneDriveTitle')}</h3>

      <DeploymentCenterOneDriveAccount {...props} />

      {accountUser && accountUser.createdBy.user.displayName && (
        <>
          <Field
            id="deployment-center-settings-folder-option"
            label={t('deploymentCenterCodeFolder')}
            name="folder"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={folderOptions}
            defaultSelectedKey={setDefaultSelectedKey()}
            placeholder={t('deploymentCenterCodeFolderPlaceholder')}
            required={true}
            isLoading={loadingFolders}
          />
        </>
      )}
    </>
  );
};

export default DeploymentCenterOneDriveProvider;
