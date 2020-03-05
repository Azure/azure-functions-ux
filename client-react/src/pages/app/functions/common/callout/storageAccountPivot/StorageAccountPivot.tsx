import { FieldProps, Formik, FormikProps } from 'formik';
import { DefaultButton, IDropdownOption, IDropdownProps } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { FormControlWrapper, Layout } from '../../../../../../components/FormControlWrapper/FormControlWrapper';
import LoadingComponent from '../../../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../../../models/arm-obj';
import { StorageAccount, StorageAccountKeys } from '../../../../../../models/storage-account';
import { LogCategories } from '../../../../../../utils/LogCategories';
import LogService from '../../../../../../utils/LogService';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { paddingTopStyle } from '../Callout.styles';
import { StorageAccountPivotContext } from './StorageAccountPivotDataLoader';

interface StorageAccountPivotFormValues {
  storageAccount: ArmObj<StorageAccount> | undefined;
}

const StorageAccountPivot: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const provider = useContext(StorageAccountPivotContext);
  const { t } = useTranslation();
  const { resourceId } = props;
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
            `Failed to get Storage Accounts: ${r.metadata.error}`
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
            `Failed to get storage account keys: ${response.metadata.error}`
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
              <FormControlWrapper label={t('storageAccountPivot_storageAccount')} layout={Layout.vertical}>
                <Dropdown
                  options={storageAccountOptions}
                  selectedKey={formValues.storageAccount && formValues.storageAccount.id}
                  onChange={(o, e) => {
                    setFormValues({ storageAccount: e && e.data });
                  }}
                  errorMessage={undefined}
                  {...props}
                />
              </FormControlWrapper>
            )}
            <footer style={paddingTopStyle}>
              <DefaultButton disabled={!formValues.storageAccount} onClick={formProps.submitForm}>
                {t('ok')}
              </DefaultButton>
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
  setNewAppSetting: React.Dispatch<React.SetStateAction<{ key: string; value: string }>>,
  setSelectedItem: React.Dispatch<React.SetStateAction<IDropdownOption | undefined>>,
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setKeyList: React.Dispatch<React.SetStateAction<StorageAccountKeys | undefined>>
) => {
  if (formValues.storageAccount && keyList) {
    const appSettingName = `${formValues.storageAccount.name}_STORAGE`;
    const appSettingValue = `DefaultEndpointsProtocol=https;AccountName=${formValues.storageAccount.name};AccountKey=${
      keyList.keys[0].value
    }`;
    setNewAppSetting({ key: appSettingName, value: appSettingValue });
    setSelectedItem({ key: appSettingName, text: appSettingName, data: appSettingValue });
    setKeyList(undefined);
    setIsDialogVisible(false);
  }
};

export default StorageAccountPivot;
