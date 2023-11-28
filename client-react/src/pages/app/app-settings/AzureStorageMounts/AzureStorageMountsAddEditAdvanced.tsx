import React, { useContext, useEffect } from 'react';
import { AzureStorageMountsAddEditConfigurationOptionsProps, AzureStorageMountsAddEditPropsCombined } from './AzureStorageMountsAddEdit';
import { FormikProps, Field } from 'formik';
import { FormAzureStorageMounts, StorageAccess, StorageFileShareProtocol } from '../AppSettings.types';
import TextField from '../../../../components/form-controls/TextField';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { useTranslation } from 'react-i18next';
import { StorageType } from '../../../../models/site/config';
import { MessageBarType } from '@fluentui/react';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { SiteContext } from '../Contexts';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import Dropdown from '../../../../components/form-controls/DropDown';
import { IDropdownOption } from '@fluentui/react';
import { Links } from '../../../../utils/FwLinks';
import StorageProtocol from './StorageProtocol';

const AzureStorageMountsAddEditAdvanced: React.FC<FormikProps<FormAzureStorageMounts> &
  AzureStorageMountsAddEditPropsCombined &
  AzureStorageMountsAddEditConfigurationOptionsProps> = props => {
  const { values, fileShareInfoBubbleMessage, setFieldValue, validateField, appSettings, storageTypeOptions } = props;
  const { t } = useTranslation();
  const site = useContext(SiteContext);
  const scenarioService = new ScenarioService(t);

  const validateShareName = (value: any): string | undefined => {
    return value ? undefined : t('validation_requiredError');
  };

  const supportsBlobStorage = scenarioService.checkScenario(ScenarioIds.azureBlobMount, { site }).status !== 'disabled';

  const showStorageAccess = React.useMemo(() => {
    return (
      values.type === StorageType.azureFiles && values.protocol.toLocaleLowerCase() === StorageFileShareProtocol.SMB.toLocaleLowerCase()
    );
  }, [values.type, values.protocol]);

  const showAccessKey = React.useMemo(() => {
    return (
      (values.type === StorageType.azureBlob || values.storageAccess === StorageAccess.AccessKey) &&
      values.protocol.toLocaleLowerCase() === StorageFileShareProtocol.SMB.toLocaleLowerCase()
    );
  }, [values.type, values.storageAccess, values.protocol]);

  const showAppSettings = React.useMemo(() => {
    return (
      values.type === StorageType.azureFiles &&
      values.storageAccess === StorageAccess.KeyVaultReference &&
      values.protocol.toLocaleLowerCase() === StorageFileShareProtocol.SMB.toLocaleLowerCase()
    );
  }, [values.type, values.storageAccess, values.protocol]);

  const appSettingDropdownOptions = React.useMemo<IDropdownOption[]>(() => {
    return appSettings.map(appSetting => {
      return {
        key: appSetting.name,
        text: appSetting.name,
        data: appSetting,
      };
    });
  }, [appSettings]);

  const showDeploymentSettingsWarning = React.useMemo(() => {
    const appSettingName = values.appSettings;
    const isSelectedAppSettingSticky =
      !appSettingName || appSettings.find(appSetting => appSetting.name === appSettingName && appSetting.sticky);
    return values.sticky && !isSelectedAppSettingSticky && showAppSettings;
  }, [values.appSettings, values.sticky, appSettings, showAppSettings]);

  useEffect(() => {
    if (!supportsBlobStorage) {
      setFieldValue('type', StorageType.azureFiles);
    }
    validateField('shareName');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Field
        component={TextField}
        name="accountName"
        label={t('storageAccounts')}
        id="azure-storage-mounts-account-name"
        required={true}
        infoBubbleMessage={
          values.protocol.toLocaleLowerCase() === StorageFileShareProtocol.SMB.toLocaleLowerCase() && t('byos_storageAccountInfoMessage')
        }
        learnMoreLink={
          values.protocol.toLocaleLowerCase() === StorageFileShareProtocol.SMB.toLocaleLowerCase() && Links.byosStorageAccountLearnMore
        }
      />
      {supportsBlobStorage && (
        <Field component={RadioButton} name="type" id="azure-storage-type" label={t('storageType')} options={storageTypeOptions} />
      )}
      <StorageProtocol values={values} />
      <Field
        component={TextField}
        name="shareName"
        label={t('shareName')}
        id="azure-storage-mounts-share-name"
        infoBubbleMessage={fileShareInfoBubbleMessage}
        required={true}
        validate={validateShareName}
      />
      {showStorageAccess && (
        <Field
          id="storageAccess"
          name={'storageAccess'}
          label={t('storageAccessLabel')}
          component={RadioButton}
          options={[
            {
              key: StorageAccess.AccessKey,
              text: t('manualInput'),
            },
            {
              key: StorageAccess.KeyVaultReference,
              text: t('keyVaultReference'),
            },
          ]}
        />
      )}
      {showAccessKey && (
        <Field
          component={TextField}
          name="accessKey"
          label={t('accessKey')}
          id="azure-storage-mounts-access-key"
          multiline
          rows={4}
          required={true}
        />
      )}
      {showAppSettings && (
        <Field
          component={Dropdown}
          name="appSettings"
          label={t('applicationSettings')}
          id="azure-storage-mounts-access-key"
          options={appSettingDropdownOptions}
          required={true}
          onPanel={true}
        />
      )}
      {showDeploymentSettingsWarning && (
        <CustomBanner
          id="azure-storage-mount-keyvault-warning"
          message={t('BYOSDeploymentSettingsWarning')}
          type={MessageBarType.warning}
          undocked={true}
        />
      )}
    </>
  );
};

export default AzureStorageMountsAddEditAdvanced;
