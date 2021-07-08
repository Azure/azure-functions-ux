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
  armResources: IArmRscTemplate[];
}

const ResourceDropdown: React.SFC<CosmosDBResourceDropdownProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { resourceId, form: formProps, field, isDisabled, setArmResources, armResources } = props;
  const siteStateContext = useContext(SiteStateContext);
  const { t } = useTranslation();

  const [databaseAccounts, setDatabaseAccounts] = useState<ArmArray<DatabaseAccount> | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<IDropdownOption | undefined>(undefined);
  const [newDatabaseAccountName, setNewDatabaseAccountName] = useState<string | undefined>(undefined);
  const [newDbAcctType, setNewDbAcctType] = useState<string | undefined>(undefined);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [shownMissingOptionError, setShownMissingOptionError] = useState<boolean>(false);
  const [storedArmTemplate, setStoredArmTemplate] = useState<any>(undefined);

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

  useEffect(() => {
    formProps.setStatus({ ...formProps.status, isNewDbAcct: !!newDatabaseAccountName });
  }, [newDatabaseAccountName]);

  const getDocumentDBAccounts = (): IDropdownOption[] => {
    const result: IDropdownOption[] = newDatabaseAccountName
      ? [{ key: `${newDatabaseAccountName}_DOCUMENTDB`, text: `(new) ${newDatabaseAccountName}`, data: newDbAcctType }]
      : [];

    if (databaseAccounts) {
      databaseAccounts.value.forEach(dbAcct => {
        result.push({ key: `${dbAcct.name}_DOCUMENTDB`, text: dbAcct.name, data: dbAcct.kind });
      });
    }

    return result;
  };

  const onChange = (
    option: IDropdownOption | undefined,
    formProps: FormikProps<BindingEditorFormValues>,
    field: { name: string; value: any }
  ) => {
    if (option) {
      const dbAcctConnectionSettingKey = option.key as string; // Format: `${dbAcctName}_DOCUMENTDB`
      const dbAcctName = dbAcctConnectionSettingKey.split('_')[0];
      formProps.setFieldValue(field.name, dbAcctConnectionSettingKey);
      formProps.setStatus({ ...formProps.status, dbAcctType: option.data });

      // Make sure the isNewDbAcct status is staying up-to-date with the selected option
      if (!selectedItem && formProps.status && formProps.status.isNewDbAcct) {
        formProps.setStatus({ ...formProps.status, isNewDbAcct: false, isNewDatabase: false, isNewContainer: false });
        formProps.setFieldValue('databaseName', '');
        formProps.setFieldValue('collectionName', '');

        // Find & store into storedArmTemplate, then delete template from armResources (since this is dbAcct, just clear all below resources (db & cont))
        armResources.forEach((armRsc, index) => {
          if (armRsc.type.toLowerCase().includes('databaseaccounts') && armRsc.name.split('/').length === 1) {
            setStoredArmTemplate(armResources[index]);
            setArmResources([]);
          }
        });
      } else if (option.text.includes('(new)') && formProps.status && !formProps.status.isNewDbAcct) {
        formProps.setStatus({ ...formProps.status, isNewDbAcct: true });

        // If template already in armResources (should mean user generated new one) don't do anything, otherwise reinstate storedArmTemplate to armResources
        let isTemplateFound = false;
        armResources.forEach((armRsc, index) => {
          if (armRsc.type.toLowerCase().includes('databaseaccounts') && armRsc.name.split('/').length === 1) {
            isTemplateFound = true;
          }
        });

        if (isTemplateFound && !!storedArmTemplate) {
          setArmResources([...armResources, storedArmTemplate]);
        }
      }

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
  } // TODO: see if we need this

  if (!databaseAccounts) {
    return <LoadingComponent />;
  }

  const options = getDocumentDBAccounts();

  // Set database account type (SQL, mongoDB, etc)
  if (formProps.status && !formProps.status.dbAcctType && options.length > 0) {
    formProps.setStatus({ ...formProps.status, dbAcctType: options[0].data });
  }

  // Set the value when coming back from the callout
  if (selectedItem) {
    onChange(selectedItem, formProps, field);
    setSelectedItem(undefined);
  }

  if (field.value && !options.some(option => option.key === field.value) && !shownMissingOptionError) {
    formProps.setFieldError(field.name, t('resourceDropdown_missingAppSetting')); // TODO: update this, or check if we even need this function
    setShownMissingOptionError(true);
  }

  // TODO: consider using 'options.length < 1' as the check here
  let placeholder: string | undefined = undefined;
  if (!databaseAccounts) {
    placeholder = '(new) Database account'; // TODO: localization for these
  } else {
    placeholder = 'Select a Cosmos DB account';
  }

  return (
    <div>
      <Dropdown options={options} onChange={(_e, option) => onChange(option, formProps, field)} {...props} placeholder={placeholder} />
      {!isDisabled ? (
        <div style={linkPaddingStyle}>
          <Link id="target" onClick={() => setIsDialogVisible(true)}>
            Create an account
          </Link>

          <Callout onDismiss={() => setIsDialogVisible(false)} target={'#target'} hidden={!isDialogVisible} style={calloutStyleField}>
            <NewCosmosDBAccountCallout
              resourceId={resourceId}
              setNewDatabaseAccountName={setNewDatabaseAccountName}
              setNewDbAcctType={setNewDbAcctType}
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
