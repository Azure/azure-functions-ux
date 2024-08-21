import { Callout, IDropdownOption, IDropdownProps, Link } from '@fluentui/react';
import { FieldProps, FormikProps } from 'formik';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';
import DocumentDBService from '../../../../ApiHelpers/DocumentDBService';
import Dropdown, { CustomDropdownProps } from '../../../../components/form-controls/DropDown';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { ArmArray } from '../../../../models/arm-obj';
import { DatabaseAccount } from '../../../../models/documentDB';
import { BindingSetting } from '../../../../models/functions/binding';
import { IArmResourceTemplate, TSetArmResourceTemplates } from '../../../../utils/ArmTemplateHelper';
import { CommonConstants } from '../../../../utils/CommonConstants';
import {
  getNewContainerArmTemplate,
  getNewDatabaseArmTemplate,
  removeCurrentContainerArmTemplate,
  removeCurrentDatabaseArmTemplate,
  storeTemplateAndClearResources,
} from '../../../../utils/CosmosDbArmTemplateHelper';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { BindingEditorFormValues } from './BindingFormBuilder';
import NewCosmosDbAccountCallout from './callout/NewCosmosDbAccountCallout';
import { useStyles } from './CosmosDbResourceDropdown.styles';

interface Props {
  armResources: IArmResourceTemplate[];
  resourceId: string;
  setArmResources: TSetArmResourceTemplates;
  setting: BindingSetting;
}

type CosmosDbResourceDropdownProps = Props & CustomDropdownProps & FieldProps & IDropdownProps;

const CosmosDbResourceDropdown: React.FC<CosmosDbResourceDropdownProps> = (props: CosmosDbResourceDropdownProps) => {
  const { armResources, disabled, field, form: formProps, layout, resourceId, setArmResources } = props;

  const styles = useStyles(layout);
  const { t } = useTranslation();

  const [databaseAccounts, setDatabaseAccounts] = useState<ArmArray<DatabaseAccount>>();
  const [selectedItem, setSelectedItem] = useState<IDropdownOption>();
  const [newDatabaseAccountName, setNewDatabaseAccountName] = useState<string>();
  const [newDbAcctType, setNewDbAcctType] = useState<string>();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [storedArmTemplate, setStoredArmTemplate] = useState<IArmResourceTemplate>();

  useEffect(() => {
    setIsLoading(true);
    DocumentDBService.fetchDatabaseAccounts(resourceId)
      .then(r => {
        if (r.metadata.success) {
          setDatabaseAccounts(r.data);
        } else {
          LogService.error(
            LogCategories.bindingResource,
            'getCDbAccounts',
            `Failed to get Cosmos DB accounts: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [resourceId]);

  const options = useMemo((): IDropdownOption[] => {
    const result: IDropdownOption[] = newDatabaseAccountName
      ? [{ key: `${newDatabaseAccountName}_COSMOSDB`, text: `${t('new_parenthesized')} ${newDatabaseAccountName}`, data: newDbAcctType }]
      : [];

    if (databaseAccounts) {
      result.push(
        ...databaseAccounts.value.map(({ id, kind, name }) => ({
          data: {
            id,
            kind,
          },
          key: `${name}_COSMOSDB`,
          text: name,
        }))
      );
    }

    return result;
  }, [databaseAccounts, newDatabaseAccountName, newDbAcctType, t]);

  const onCalloutDismiss = useCallback(() => {
    setIsDialogVisible(false);
  }, []);

  const onChange = useCallback(
    (option: IDropdownOption | undefined, formProps: FormikProps<BindingEditorFormValues>, field: { name: string; value: unknown }) => {
      if (option) {
        const dbAcctConnectionSettingKey = option.key as string; // Format: `${dbAcctName}_COSMOSDB`
        const dbAcctName = dbAcctConnectionSettingKey.split('_')[0];
        formProps.setFieldValue(field.name, dbAcctConnectionSettingKey);
        formProps.setStatus({ ...formProps.status, dbAcctId: option.data.id, dbAcctType: option.data.kind });

        // Make sure the isNewDbAcct status is staying up-to-date with the selected option
        if (!selectedItem && !!formProps.status?.isNewDbAcct) {
          formProps.setStatus({ ...formProps.status, isNewDbAcct: false, isNewDatabase: false, isNewContainer: false });
          formProps.setFieldValue('databaseName', '');
          formProps.setFieldValue('collectionName', '');

          storeTemplateAndClearResources(armResources, setArmResources, setStoredArmTemplate);

          /** @todo (joechung): #14260766 - Log telemetry. */
        } else if (option.text.includes(t('new_parenthesized')) && !!formProps.status && !formProps.status.isNewDbAcct) {
          formProps.setStatus({ ...formProps.status, isNewDbAcct: true, isNewDatabase: true, isNewContainer: true });
          formProps.setFieldValue('databaseName', CommonConstants.CosmosDbDefaults.databaseName);
          formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);

          removeCurrentDatabaseArmTemplate(armResources, setArmResources);
          removeCurrentContainerArmTemplate(armResources, setArmResources);

          // If template already in armResources (should mean user generated new one) don't do anything, otherwise reinstate storedArmTemplate to armResources
          const isTemplateFound = armResources.find(
            armResource => armResource.type.toLowerCase().includes('databaseaccounts') && armResource.name.split('/').length === 1
          );

          if (!isTemplateFound && !!storedArmTemplate) {
            const databaseAccountName = storedArmTemplate.name;
            const databaseName = CommonConstants.CosmosDbDefaults.databaseName;
            setArmResources(prevArmResources => [
              ...prevArmResources,
              storedArmTemplate,
              getNewDatabaseArmTemplate(databaseName, armResources, databaseAccountName),
              getNewContainerArmTemplate(CommonConstants.CosmosDbDefaults.containerName, armResources, databaseAccountName, databaseName),
            ]);

            /** @todo (joechung): #14260766 - Log telemetry. */
          }
        } else {
          /** @todo (joechung): #14260766 - Log telemetry. */
        }

        // Always add the appsetting for CDB to simplify between new/existing DB accounts (FunctionsService deploy handles setting overlaps)
        formProps.setFieldValue('newAppSettings', {
          properties: {
            [dbAcctConnectionSettingKey]: `[listConnectionStrings(resourceId('${CommonConstants.ResourceTypes.cosmosDbAccount}', '${dbAcctName}'), '${CommonConstants.ApiVersions.documentDBApiVersion20191212}').connectionStrings[0].connectionString]`,
          },
        });
      }
    },
    [armResources, selectedItem, setArmResources, storedArmTemplate, t]
  );

  const onLinkClick = useCallback(() => {
    setIsDialogVisible(true);
  }, []);

  useEffect(() => {
    // Set database account type (SQL or MongoDB)
    if (!!formProps.status && !formProps.status.dbAcctType && !!options[0]) {
      formProps.setStatus({ ...formProps.status, dbAcctType: options[0].data.kind });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!options[0]]);

  useEffect(() => {
    // Set the value when coming back from the callout
    if (selectedItem) {
      onChange(selectedItem, formProps, field);
      setSelectedItem(undefined);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return isLoading ? (
    <LoadingComponent />
  ) : (
    <div>
      <Dropdown
        onChange={(_, option) => onChange(option, formProps, field)}
        {...props}
        options={options ?? props.options}
        placeholder={options.length === 0 ? t('cosmosDb_placeholder_noExistingAccounts') : t('cosmosDb_placeholder_selectAnAccount')}
      />
      {!disabled ? (
        <div className={styles.calloutContainer}>
          <Link id="target" onClick={onLinkClick}>
            {t('cosmosDb_label_createAnAccount')}
          </Link>
          <Callout
            className={styles.callout}
            hidden={!isDialogVisible}
            onDismiss={onCalloutDismiss}
            setInitialFocus={true}
            target="#target">
            <NewCosmosDbAccountCallout
              setIsDialogVisible={setIsDialogVisible}
              setNewDatabaseAccountName={setNewDatabaseAccountName}
              setNewDbAcctType={setNewDbAcctType}
              setSelectedItem={setSelectedItem}
              {...props}
            />
          </Callout>
        </div>
      ) : null}
    </div>
  );
};

export default CosmosDbResourceDropdown;
