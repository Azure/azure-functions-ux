import React, { useState, useEffect } from 'react';
import { FieldProps, FormikProps } from 'formik';
import Dropdown, { CustomDropdownProps } from '../../../../components/form-controls/DropDown';
import { IDropdownOption, IDropdownProps, DefaultButton } from 'office-ui-fabric-react';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import StorageService from '../../../../ApiHelpers/StorageService';
import { ArmObj } from '../../../../models/arm-obj';
import { StorageAccount } from '../../../../models/storage-account';
import { BindingEditorFormValues } from './BindingFormBuilder';

export interface NewResourceConnectionProps {
  resourceId: string;
  setNewAppSettingName: (string) => void;
  setIsCalloutVisible: (boolean) => void;
}
const paddingStyle = {
  padding: '20px',
};

const NewResourceConnection: React.SFC<NewResourceConnectionProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { resourceId, setNewAppSettingName, setIsCalloutVisible, form: formProps, field } = props;
  const [storageAccounts, setStorageAccounts] = useState<ArmObj<StorageAccount>[] | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<IDropdownOption | undefined>(undefined);
  useEffect(() => {
    StorageService.fetchAzureStorageAccounts(resourceId).then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(LogCategories.bindingResource, 'getStorageAccounts', `Failed to get storage accounts: ${r.metadata.error}`);
        return;
      }
      setStorageAccounts(r.data.value);
    });
  }, []);

  if (!storageAccounts) {
    return null;
  }

  const options: IDropdownOption[] = [];
  storageAccounts.forEach((account, i) => options.push({ text: account.name, key: i }));
  if (!selectedItem && options.length > 0) {
    setSelectedItem(options[0]);
  }
  return (
    <form style={paddingStyle}>
      <Dropdown
        options={options}
        selectedKey={selectedItem ? selectedItem.key : undefined}
        onChange={(o, e) => setSelectedItem(e)}
        {...props}
      />
      <DefaultButton
        disabled={!selectedItem}
        onClick={() => createStorageAccountConnection(selectedItem, setNewAppSettingName, setIsCalloutVisible, formProps, field)}>
        {'Create storage account connection'}
      </DefaultButton>
    </form>
  );
};

const createStorageAccountConnection = (
  selectedItem: IDropdownOption | undefined,
  setNewAppSettingName: any,
  setIsCalloutVisible: any,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any }
) => {
  if (selectedItem) {
    const appSettingName = `${selectedItem.text}_STORAGE`;
    formProps.setFieldValue(field.name, appSettingName);
    setIsCalloutVisible(false);
    setNewAppSettingName(appSettingName);
  }
};

export default NewResourceConnection;
