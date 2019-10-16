import React, { useState, useEffect } from 'react';
import { FieldProps, FormikProps } from 'formik';
import Dropdown, { CustomDropdownProps } from '../../../../components/form-controls/DropDown';
import { IDropdownOption, IDropdownProps, DefaultButton, Dialog, DialogType } from 'office-ui-fabric-react';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import StorageService from '../../../../ApiHelpers/StorageService';
import { ArmObj } from '../../../../models/arm-obj';
import { StorageAccount } from '../../../../models/storage-account';
import { BindingEditorFormValues } from './BindingFormBuilder';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../../../components/loading/loading-component';

export interface NewStorageAccountConnectionDialogProps {
  resourceId: string;
  setNewAppSettingName: (string) => void;
  setIsDialogVisible: (boolean) => void;
}

const NewStorageAccountConnectionDialog: React.SFC<
  NewStorageAccountConnectionDialogProps & CustomDropdownProps & FieldProps & IDropdownProps
> = props => {
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
    return (
      <Dialog
        hidden={false}
        onDismiss={() => setIsDialogVisible(false)}
        modalProps={{
          isBlocking: false,
        }}
        dialogContentProps={{
          type: DialogType.close,
          title: 'New Storage Account Connection',
        }}>
        <LoadingComponent />
      </Dialog>
    );
  }

  const options: IDropdownOption[] = [];
  storageAccounts.forEach((account, i) => options.push({ text: account.name, key: i }));
  if (!selectedItem && options.length > 0) {
    setSelectedItem(options[0]);
  }

  return (
    <Dialog
      hidden={false}
      onDismiss={() => setIsDialogVisible(false)}
      modalProps={{
        isBlocking: false,
      }}
      dialogContentProps={{
        type: DialogType.close,
        title: 'New Storage Account Connection',
      }}>
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
    </Dialog>
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

export default NewStorageAccountConnectionDialog;
