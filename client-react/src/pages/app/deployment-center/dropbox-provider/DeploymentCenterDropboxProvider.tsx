import { Field } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from '../../../../components/form-controls/DropDown';
import { SiteStateContext } from '../../../../SiteState';
import { DeploymentCenterDropboxProviderProps } from '../DeploymentCenter.types';
import DeploymentCenterDropboxAccount from './DeploymentCenterDropboxAccount';

const DeploymentCenterDropboxProvider: React.FC<DeploymentCenterDropboxProviderProps> = props => {
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
      <h3>{t('deploymentCenterCodeDropboxTitle')}</h3>

      <DeploymentCenterDropboxAccount {...props} />

      {accountUser && accountUser.name && accountUser.name.display_name && (
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

export default DeploymentCenterDropboxProvider;
