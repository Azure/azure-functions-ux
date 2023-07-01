import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldProps, Formik, FormikProps } from 'formik';

import { DefaultButton, IDropdownOption, IDropdownProps, PrimaryButton } from '@fluentui/react';

import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { Layout } from '../../../../../../components/form-controls/ReactiveFormControl';
import LoadingComponent from '../../../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../../../models/arm-obj';
import { StorageAccount, StorageAccountKeys } from '../../../../../../models/storage-account';
import { PortalContext } from '../../../../../../PortalContext';
import { NationalCloudEnvironment } from '../../../../../../utils/scenario-checker/national-cloud.environment';
import { getTelemetryInfo } from '../../../../../../utils/TelemetryUtils';
import { generateAppSettingName } from '../../ResourceDropdown';
import { NewConnectionCalloutProps } from '../Callout.properties';

import { primaryButtonStyle } from './StorageAccountPivot.styles';
import { StorageAccountPivotContext } from './StorageAccountPivotDataLoader';

interface StorageAccountPivotFormValues {
  storageAccount: ArmObj<StorageAccount> | undefined;
}

const StorageAccountPivot: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const provider = useContext(StorageAccountPivotContext);
  const portalContext = useContext(PortalContext);

  const { t } = useTranslation();
  const { resourceId, appSettingKeys } = props;
  const [formValues, setFormValues] = useState<StorageAccountPivotFormValues>({ storageAccount: undefined });
  const [storageAccounts, setStorageAccounts] = useState<ArmObj<StorageAccount>[] | undefined>(undefined);
  const [keyList, setKeyList] = useState<StorageAccountKeys | undefined>(undefined);

  useEffect(() => {
    if (!storageAccounts) {
      provider.fetchAzureStorageAccounts(resourceId).then(r => {
        if (r.metadata.success) {
          setStorageAccounts(r.data.value);
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'fetchAzureStorageAccounts', 'failed', {
              error: r.metadata.error,
              message: 'Failed to fetch azure storage accounts',
            })
          );
        }
      });
    } else if (formValues.storageAccount && !keyList) {
      provider.fetchStorageAccountKeys(formValues.storageAccount.id).then(response => {
        if (response.metadata.success) {
          setKeyList(response.data);
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'fetchStorageAccountKeys', 'failed', {
              error: response.metadata.error,
              message: 'Failed to fetch storage account keys',
            })
          );
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  if (!storageAccounts) {
    return <LoadingComponent />;
  }

  const storageAccountOptions: IDropdownOption[] = [];
  storageAccounts.forEach(account => storageAccountOptions.push({ text: account.name, key: account.id, data: account }));
  if (!formValues.storageAccount && storageAccountOptions.length > 0) {
    setFormValues({ ...formValues, storageAccount: storageAccounts[0] });
  }

  return (
    <Formik
      initialValues={formValues}
      onSubmit={() =>
        setStorageAccountConnection(
          formValues,
          keyList,
          appSettingKeys,
          props.setNewAppSetting,
          props.setSelectedItem,
          props.setIsDialogVisible
        )
      }>
      {(formProps: FormikProps<StorageAccountPivotFormValues>) => {
        return (
          <form>
            {!!storageAccounts && storageAccounts.length === 0 ? (
              <p>{t('storageAccountPivot_noStorageAccounts')}</p>
            ) : (
              <Dropdown
                label={t('storageAccountPivot_storageAccount')}
                selectedKey={formValues.storageAccount && formValues.storageAccount.id}
                onChange={(o, e) => {
                  setFormValues({ storageAccount: e && e.data });
                  setKeyList(undefined);
                }}
                errorMessage={undefined}
                layout={Layout.Vertical}
                {...props}
                options={storageAccountOptions}
                id="newStorageAccountConnection"
                mouseOverToolTip={undefined}
              />
            )}
            <div>
              <PrimaryButton className={primaryButtonStyle} disabled={!formValues.storageAccount} onClick={formProps.submitForm}>
                {t('ok')}
              </PrimaryButton>
              <DefaultButton
                onClick={() => {
                  props.setIsDialogVisible(false);
                }}>
                {t('cancel')}
              </DefaultButton>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

const setStorageAccountConnection = (
  formValues: StorageAccountPivotFormValues,
  keyList: StorageAccountKeys | undefined,
  appSettingKeys: string[],
  setNewAppSetting: React.Dispatch<React.SetStateAction<{ key: string; value: string }>>,
  setSelectedItem: React.Dispatch<React.SetStateAction<IDropdownOption | undefined>>,
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (formValues.storageAccount && keyList) {
    let appSettingName = generateAppSettingName(appSettingKeys, `${formValues.storageAccount.name}_STORAGE`);
    const appSettingValue = `DefaultEndpointsProtocol=https;AccountName=${formValues.storageAccount.name};AccountKey=${
      keyList.keys[0].value
    }${appendEndpoint()}`;

    if (appSettingName !== `${formValues.storageAccount.name}_STORAGE`) {
      appSettingName = `${formValues.storageAccount.name}_STORAGE`;
    } else {
      setNewAppSetting({ key: appSettingName, value: appSettingValue });
    }

    setSelectedItem({ key: appSettingName, text: appSettingName, data: appSettingValue });
    setIsDialogVisible(false);
  }
};

const appendEndpoint = () => {
  if (NationalCloudEnvironment.isFairFax()) {
    return ';EndpointSuffix=core.usgovcloudapi.net';
  }
  if (NationalCloudEnvironment.isMooncake()) {
    return ';EndpointSuffix=core.chinacloudapi.cn';
  }
  if (NationalCloudEnvironment.isUSNat()) {
    return ';EndpointSuffix=core.eaglex.ic.gov';
  }
  if (NationalCloudEnvironment.isUSSec()) {
    return ';EndpointSuffix=core.microsoft.scloud';
  }
  return '';
};

export default StorageAccountPivot;
