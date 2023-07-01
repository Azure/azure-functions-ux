import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';

import Dropdown from '../../../../components/form-controls/DropDown';
import { SiteStateContext } from '../../../../SiteState';
import { DeploymentCenterOneDriveProviderProps } from '../DeploymentCenter.types';

import DeploymentCenterOneDriveAccount from './DeploymentCenterOneDriveAccount';

const DeploymentCenterOneDriveProvider: React.FC<DeploymentCenterOneDriveProviderProps> = props => {
  const { formProps, accountUser, folderOptions, loadingFolders } = props;

  const { t } = useTranslation();

  const siteStateContext = useContext(SiteStateContext);

  const getDefaultSelectedKey = () => {
    if (!formProps.values.folder && siteStateContext.site && siteStateContext.site.properties && siteStateContext.site.properties.name) {
      formProps.setFieldValue('folder', siteStateContext.site.properties.name);
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
            label={t('deploymentCenterCodeFolder')}
            name="folder"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={folderOptions}
            defaultSelectedKey={getDefaultSelectedKey()}
            placeholder={t('deploymentCenterCodeFolderPlaceholder')}
            required={true}
            isLoading={loadingFolders}
            aria-required={true}
          />
        </>
      )}
    </>
  );
};

export default DeploymentCenterOneDriveProvider;
