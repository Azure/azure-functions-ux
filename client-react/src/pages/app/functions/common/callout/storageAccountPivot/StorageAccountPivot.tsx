import React, { useContext, useState, useEffect } from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { Formik, FormikProps, FieldProps } from 'formik';
import LoadingComponent from '../../../../../../components/loading/loading-component';
import { StorageAccountPivotContext } from './StorageAccountPivotDataLoader';
import { ArmObj } from '../../../../../../models/arm-obj';
import LogService from '../../../../../../utils/LogService';
import { LogCategories } from '../../../../../../utils/LogCategories';
import { IDropdownOption, DefaultButton, IDropdownProps } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { paddingTopStyle } from '../Callout.styles';
import { StorageAccount } from '../../../../../../models/storage-account';
import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';

interface StorageAccountPivotFormValues {
  storageAccount: ArmObj<StorageAccount> | undefined;
}

const StorageAccountPivot: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const provider = useContext(StorageAccountPivotContext);
  const { t } = useTranslation();
  const { resourceId } = props;
  const [formValues, setFormValues] = useState<StorageAccountPivotFormValues>({ storageAccount: undefined });
  const [storageAccounts, setStorageAccounts] = useState<ArmObj<StorageAccount>[] | undefined>(undefined);

  useEffect(() => {
    if (!storageAccounts) {
      provider.fetchAzureStorageAccounts(resourceId).then(r => {
        if (!r.metadata.success) {
          LogService.trackEvent(LogCategories.bindingResource, 'getStorageAccounts', `Failed to get Storage Accounts: ${r.metadata.error}`);
          return;
        }
        setStorageAccounts(r.data.value);
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
      onSubmit={() => setStorageAccountConnection(formValues, props.setNewAppSetting, props.setSelectedItem, props.setIsDialogVisible)}>
      {(formProps: FormikProps<StorageAccountPivotFormValues>) => {
        return (
          <form>
            {!!storageAccounts && storageAccounts.length === 0 ? (
              <p>{t('storageAccountPivot_noStorageAccounts')}</p>
            ) : (
              <>
                <Dropdown
                  label={t('storageAccountPivot_storageAccount')}
                  options={storageAccountOptions}
                  selectedKey={formValues.storageAccount && formValues.storageAccount.id}
                  onChange={(o, e) => {
                    setFormValues({ storageAccount: e && e.data });
                  }}
                  errorMessage={undefined}
                  {...props}
                />
              </>
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
  setNewAppSetting: (a: { key: string; value: string }) => void,
  setSelectedItem: (u: undefined) => void,
  setIsDialogVisible: (b: boolean) => void
) => {
  if (formValues.storageAccount) {
    const appSettingName = `${formValues.storageAccount.name}_STORAGE`;
    setNewAppSetting({ key: appSettingName, value: appSettingName });
    setSelectedItem(undefined);
    setIsDialogVisible(false);
  }
};

export default StorageAccountPivot;
