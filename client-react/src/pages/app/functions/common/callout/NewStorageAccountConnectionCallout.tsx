import React, { useState, useEffect } from 'react';
import { FieldProps, FormikProps } from 'formik';
import { IDropdownOption, DefaultButton, Dropdown } from 'office-ui-fabric-react';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import StorageService from '../../../../../ApiHelpers/StorageService';
import { ArmObj } from '../../../../../models/arm-obj';
import { StorageAccount } from '../../../../../models/storage-account';
import { BindingEditorFormValues } from '../BindingFormBuilder';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../../../../components/loading/loading-component';
import { NewConnectionCalloutProps } from './Callout.properties';

const NewStorageAccountConnectionCallout: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  const { resourceId, setNewAppSettingName, setIsDialogVisible, form: formProps, field } = props;
  const [storageAccounts, setStorageAccounts] = useState<ArmObj<StorageAccount>[] | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<IDropdownOption | undefined>(undefined);

  const { t } = useTranslation();
  useEffect(() => {
    // This will need to be moved to a resource data file to handle requests
    StorageService.fetchAzureStorageAccounts(resourceId).then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(LogCategories.bindingResource, 'getStorageAccounts', `Failed to get storage accounts: ${r.metadata.error}`);
        return;
      }
      setStorageAccounts(r.data.value);
    });
  }, []);

  if (!storageAccounts) {
    return <LoadingComponent />;
  }

  const options: IDropdownOption[] = [];
  storageAccounts.forEach((account, i) => options.push({ text: account.name, key: i }));
  if (!selectedItem && options.length > 0) {
    setSelectedItem(options[0]);
  }

  return (
    <form>
      <Dropdown
        options={options}
        selectedKey={selectedItem ? selectedItem.key : undefined}
        onChange={(o, e) => setSelectedItem(e)}
        {...props}
      />
      <DefaultButton
        disabled={!selectedItem}
        onClick={() => createStorageAccountConnection(selectedItem, setNewAppSettingName, setIsDialogVisible, formProps, field)}>
        {t('ok')}
      </DefaultButton>
    </form>
  );
};

const createStorageAccountConnection = (
  selectedItem: IDropdownOption | undefined,
  setNewAppSettingName: any,
  setIsDialogVisilbe: any,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any }
) => {
  if (selectedItem) {
    const appSettingName = `${selectedItem.text}_STORAGE`;
    formProps.setFieldValue(field.name, appSettingName);
    setNewAppSettingName(appSettingName);
    setIsDialogVisilbe(false);
  }
};

export default NewStorageAccountConnectionCallout;
