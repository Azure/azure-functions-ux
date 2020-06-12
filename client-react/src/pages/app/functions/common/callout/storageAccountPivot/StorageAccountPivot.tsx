import { FieldProps, Formik, FormikProps } from 'formik';
import { IDropdownOption, IDropdownProps, PrimaryButton } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../../../../ApiHelpers/ArmHelper';
import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { Layout } from '../../../../../../components/form-controls/ReactiveFormControl';
import LoadingComponent from '../../../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../../../models/arm-obj';
import { StorageAccount, StorageAccountKeys } from '../../../../../../models/storage-account';
import { LogCategories } from '../../../../../../utils/LogCategories';
import LogService from '../../../../../../utils/LogService';
import { NationalCloudEnvironment } from '../../../../../../utils/scenario-checker/national-cloud.environment';
import { generateAppSettingName } from '../../ResourceDropdown';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { paddingTopStyle } from '../Callout.styles';
import { StorageAccountPivotContext } from './StorageAccountPivotDataLoader';

interface StorageAccountPivotFormValues {
  storageAccount: ArmObj<StorageAccount> | undefined;
}

const StorageAccountPivot: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const provider = useContext(StorageAccountPivotContext);
  const { t } = useTranslation();
  const { resourceId, appSettingKeys } = props;
  const [formValues, setFormValues] = useState<StorageAccountPivotFormValues>({ storageAccount: undefined });
  const [storageAccounts, setStorageAccounts] = useState<ArmObj<StorageAccount>[] | undefined>(undefined);
  const [keyList, setKeyList] = useState<StorageAccountKeys | undefined>(undefined);

  useEffect(() => {
    if (!storageAccounts) {
      provider.fetchAzureStorageAccounts(resourceId).then(r => {
        if (!r.metadata.success) {
          LogService.trackEvent(
            LogCategories.bindingResource,
            'fetchAzureStorageAccounts',
            `Failed to get Storage Accounts: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
          return;
        }
        setStorageAccounts(r.data.value);
      });
    } else if (formValues.storageAccount && !keyList) {
      provider.fetchStorageAccountKeys(formValues.storageAccount.id).then(response => {
        if (!response.metadata.success) {
          LogService.trackEvent(
            LogCategories.bindingResource,
            'fetchStorageAccountKeys',
            `Failed to get storage account keys: ${getErrorMessageOrStringify(response.metadata.error)}`
          );
          return;
        }

        setKeyList(response.data);
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
          props.setIsDialogVisible,
          setKeyList
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
                options={storageAccountOptions}
                selectedKey={formValues.storageAccount && formValues.storageAccount.id}
                onChange={(o, e) => {
                  setFormValues({ storageAccount: e && e.data });
                  setKeyList(undefined);
                }}
                errorMessage={undefined}
                layout={Layout.Vertical}
                {...props}
                id="newStorageAccountConnection"
                mouseOverToolTip={undefined}
              />
            )}
            <footer style={paddingTopStyle}>
              <PrimaryButton disabled={!formValues.storageAccount} onClick={formProps.submitForm}>
                {t('ok')}
              </PrimaryButton>
            </footer>
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
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setKeyList: React.Dispatch<React.SetStateAction<StorageAccountKeys | undefined>>
) => {
  if (formValues.storageAccount && keyList) {
    const appSettingName = generateAppSettingName(appSettingKeys, `${formValues.storageAccount.name}_STORAGE`);
    const appSettingValue = `DefaultEndpointsProtocol=https;AccountName=${formValues.storageAccount.name};AccountKey=${
      keyList.keys[0].value
    }${appendEndpoint()}`;
    setNewAppSetting({ key: appSettingName, value: appSettingValue });
    setSelectedItem({ key: appSettingName, text: appSettingName, data: appSettingValue });
    setKeyList(undefined);
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
  if (NationalCloudEnvironment.isBlackforest()) {
    return ';EndpointSuffix=core.cloudapi.de';
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
