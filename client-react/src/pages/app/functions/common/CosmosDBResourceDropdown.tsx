import { FieldProps, FormikProps } from 'formik';
import { Callout, IDropdownOption, IDropdownProps, Link } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';
import DocumentDBService from '../../../../ApiHelpers/DocumentDBService';
import Dropdown, { CustomDropdownProps } from '../../../../components/form-controls/DropDown';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { ArmArray } from '../../../../models/arm-obj';
import { BindingSetting } from '../../../../models/functions/binding';
import { SiteStateContext } from '../../../../SiteState';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import SiteHelper from '../../../../utils/SiteHelper';
import { IArmRscTemplate } from '../new-create-preview/FunctionCreateDataLoader';
import { BindingEditorFormValues } from './BindingFormBuilder';
import { calloutStyleField, linkPaddingStyle } from './callout/Callout.styles';
import NewCosmosDBAccountCallout from './callout/NewCosmosDBAccountCallout';
import { DatabaseAccount } from '../../../../models/documentDB';

interface CosmosDBResourceDropdownProps {
  setting: BindingSetting;
  resourceId: string;
  setArmResources: (template: IArmRscTemplate[]) => void;
}

const ResourceDropdown: React.SFC<CosmosDBResourceDropdownProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { resourceId, form: formProps, field, isDisabled } = props;
  const siteStateContext = useContext(SiteStateContext);
  const { t } = useTranslation();

  const [databaseAccounts, setDatabaseAccounts] = useState<ArmArray<DatabaseAccount> | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<IDropdownOption | undefined>(undefined);
  const [newDatabaseAccountName, setNewDatabaseAccountName] = useState<string | undefined>(undefined);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [shownMissingOptionError, setShownMissingOptionError] = useState<boolean>(false);

  useEffect(() => {
    DocumentDBService.fetchDatabaseAccounts(resourceId).then(r => {
      if (!r.metadata.success) {
        LogService.error(
          LogCategories.bindingResource,
          'getCDbAccounts',
          `Failed to get Cosmos DB accounts: ${getErrorMessageOrStringify(r.metadata.error)}`
        );
        return;
      }
      setDatabaseAccounts(r.data);
    });
  }, [resourceId]);

  const getDocumentDBAccounts = (): IDropdownOption[] => {
    const result: IDropdownOption[] = newDatabaseAccountName
      ? [{ key: `${newDatabaseAccountName}_DOCUMENTDB`, text: `(new) ${newDatabaseAccountName}` }]
      : [];

    databaseAccounts!.value.forEach(dbAcct => {
      result.push({ key: `${dbAcct.name}_DOCUMENTDB`, text: dbAcct.name });
    });

    return result;
  };

  const onChange = (
    option: IDropdownOption | undefined,
    formProps: FormikProps<BindingEditorFormValues>,
    field: { name: string; value: any }
  ) => {
    console.log(option);
    if (option) {
      const dbAcctConnectionSettingKey = option.key as string; // `${dbAcctName}_DOCUMENTDB`
      const dbAcctName = dbAcctConnectionSettingKey.split('_')[0];
      formProps.setFieldValue(field.name, dbAcctConnectionSettingKey);

      // Always add the appsetting for CDB to simplify between new/existing DB accounts (FunctionsService deploy handles setting overlaps)
      let newAppSettings = {
        properties: {},
      };

      newAppSettings.properties[
        dbAcctConnectionSettingKey
      ] = `[listConnectionStrings(resourceId('Microsoft.DocumentDB/databaseAccounts', '${dbAcctName}'), '2019-12-12').connectionStrings[0].connectionString]`;
      formProps.setFieldValue('newAppSettings', newAppSettings);
    }
  };

  // If we are readonly, don't rely on app settings, assume that the saved value is correct
  if (SiteHelper.isFunctionAppReadOnly(siteStateContext.siteAppEditState)) {
    return <Dropdown options={[{ text: field.value, key: field.value }]} selectedKey={field.value} {...props} />;
  }

  if (!databaseAccounts) {
    return <LoadingComponent />;
  }

  const options = getDocumentDBAccounts();

  // Set the onload value
  if (!field.value && options.length > 0) {
    formProps.setFieldValue(field.name, options[0].key);
  }

  // Set the value when coming back from the callout
  if (selectedItem) {
    onChange(selectedItem, formProps, field);
    setSelectedItem(undefined);
  }

  if (field.value && !options.some(option => option.key === field.value) && !shownMissingOptionError) {
    formProps.setFieldError(field.name, t('resourceDropdown_missingAppSetting'));
    setShownMissingOptionError(true);
  }

  return (
    <div>
      <Dropdown
        options={options}
        placeholder={options.length < 1 ? t('resourceDropdown_noAppSettingsFound') : undefined}
        onChange={(_e, option) => onChange(option, formProps, field)}
        {...props}
      />
      {!isDisabled ? (
        <div style={linkPaddingStyle}>
          <Link id="target" onClick={() => setIsDialogVisible(true)}>
            Create an account
          </Link>

          <Callout onDismiss={() => setIsDialogVisible(false)} target={'#target'} hidden={!isDialogVisible} style={calloutStyleField}>
            <NewCosmosDBAccountCallout
              resourceId={resourceId}
              setNewDatabaseAccountName={setNewDatabaseAccountName}
              setSelectedItem={setSelectedItem}
              setIsDialogVisible={setIsDialogVisible}
              {...props}
            />
          </Callout>
        </div>
      ) : (
        undefined
      )}
    </div>
  );
};

export default ResourceDropdown;
