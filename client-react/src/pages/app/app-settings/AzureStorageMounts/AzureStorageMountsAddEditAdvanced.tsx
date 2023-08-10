import React, { useContext, useEffect, useState } from 'react';
import { AzureStorageMountsAddEditPropsCombined } from './AzureStorageMountsAddEdit';
import { FormikProps, Field } from 'formik';
import { FormAzureStorageMounts, StorageAccess, StorageFileShareProtocol } from '../AppSettings.types';
import TextField from '../../../../components/form-controls/TextField';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { useTranslation } from 'react-i18next';
import { StorageType } from '../../../../models/site/config';
import { IChoiceGroupOption, MessageBarType } from '@fluentui/react';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { SiteContext } from '../Contexts';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ExperimentationConstants } from '../../../../utils/CommonConstants';
import Dropdown from '../../../../components/form-controls/DropDown';
import { IDropdownOption } from '@fluentui/react';
import { PortalContext } from '../../../../PortalContext';
import { NationalCloudEnvironment } from '../../../../utils/scenario-checker/national-cloud.environment';
import { SiteStateContext } from '../../../../SiteState';

const AzureStorageMountsAddEditAdvanced: React.FC<FormikProps<FormAzureStorageMounts> &
  AzureStorageMountsAddEditPropsCombined & {
    storageTypeOptions: IChoiceGroupOption[];
    fileShareProtocalOptions: IChoiceGroupOption[];
    fileShareInfoBubbleMessage?: string;
  }> = props => {
  const {
    values,
    fileShareInfoBubbleMessage,
    setFieldValue,
    validateField,
    appSettings,
    storageTypeOptions,
    fileShareProtocalOptions,
  } = props;
  const { t } = useTranslation();
  const site = useContext(SiteContext);
  const { isLinuxApp } = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);
  const scenarioService = new ScenarioService(t);

  const [showKeyvaultReference, setShowKeyvaultReference] = useState(false);

  const validateShareName = (value: any): string | undefined => {
    return value ? undefined : t('validation_requiredError');
  };

  const supportsBlobStorage = scenarioService.checkScenario(ScenarioIds.azureBlobMount, { site }).status !== 'disabled';

  const showFileSharesProtocolOptions = React.useMemo(() => {
    return values.type === StorageType.azureFiles && isLinuxApp;
  }, [values.type, isLinuxApp]);

  const showStoragaAccess = React.useMemo(() => {
    return (
      values.type === StorageType.azureFiles &&
      showKeyvaultReference &&
      values.protocol === StorageFileShareProtocol.SMB &&
      !NationalCloudEnvironment.isNationalCloud()
    );
  }, [values.type, showKeyvaultReference, values.protocol]);

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
    return values.sticky && !isSelectedAppSettingSticky;
  }, [values.appSettings, values.sticky, appSettings]);

  useEffect(() => {
    let isSubscribed = true;
    portalContext.hasFlightEnabled(ExperimentationConstants.TreatmentFlight.showByosKeyVault).then(enabled => {
      if (isSubscribed) {
        setShowKeyvaultReference(enabled);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [portalContext]);

  useEffect(() => {
    if (!supportsBlobStorage) {
      setFieldValue('type', StorageType.azureFiles);
    }
    validateField('shareName');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Field component={TextField} name="accountName" label={t('storageAccounts')} id="azure-storage-mounts-account-name" required={true} />
      {supportsBlobStorage && (
        <Field component={RadioButton} name="type" id="azure-storage-type" label={t('storageType')} options={storageTypeOptions} />
      )}
      {showFileSharesProtocolOptions && (
        <Field
          component={RadioButton}
          name="protocol"
          id="azure-file-shares-proptocol"
          label={'Protocol'}
          options={fileShareProtocalOptions}
        />
      )}
      <Field
        component={TextField}
        name="shareName"
        label={t('shareName')}
        id="azure-storage-mounts-share-name"
        infoBubbleMessage={fileShareInfoBubbleMessage}
        required={true}
        validate={validateShareName}
      />
      {showStoragaAccess && (
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
      {(values.type === StorageType.azureBlob || values.storageAccess === StorageAccess.AccessKey) && (
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
      {values.type === StorageType.azureFiles && values.storageAccess === StorageAccess.KeyVaultReference && (
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
      {values.type === StorageType.azureFiles &&
        values.storageAccess === StorageAccess.KeyVaultReference &&
        showDeploymentSettingsWarning && (
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
