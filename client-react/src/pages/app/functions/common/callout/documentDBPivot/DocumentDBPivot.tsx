import React, { useContext, useState, useEffect } from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { FieldProps, Formik, FormikProps } from 'formik';
import LoadingComponent from '../../../../../../components/loading/loading-component';
import { DocumentDBPivotContext } from './DocumentDBDataLoader';
import { DatabaseAccount, KeyList } from '../../../../../../models/documentDB';
import { ArmObj } from '../../../../../../models/arm-obj';
import LogService from '../../../../../../utils/LogService';
import { LogCategories } from '../../../../../../utils/LogCategories';
import { IDropdownOption, Dropdown, DefaultButton } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { BindingEditorFormValues } from '../../BindingFormBuilder';

interface DocumentDBPivotFormValues {
  databaseAccount: ArmObj<DatabaseAccount> | undefined;
}

const DocumentDBPivot: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  const provider = useContext(DocumentDBPivotContext);
  const { t } = useTranslation();
  const { resourceId } = props;
  const [formValues, setFormValues] = useState<DocumentDBPivotFormValues>({ databaseAccount: undefined });
  const [databaseAccounts, setDatabaseAccounts] = useState<ArmObj<DatabaseAccount>[] | undefined>(undefined);
  const [keyList, setKeyList] = useState<KeyList | undefined>(undefined);

  useEffect(() => {
    if (!databaseAccounts) {
      provider.fetchDatabaseAccounts(resourceId).then(r => {
        if (!r.metadata.success) {
          LogService.trackEvent(
            LogCategories.bindingResource,
            'getDatabaseAccounts',
            `Failed to get Database Accounts: ${r.metadata.error}`
          );
          return;
        }
        setDatabaseAccounts(r.data.value);
      });
    } else if (formValues.databaseAccount && !keyList) {
      provider.fetchKeyList(formValues.databaseAccount.id).then(r => {
        if (!r.metadata.success) {
          LogService.trackEvent(LogCategories.bindingResource, 'getKeyList', `Failed to get Key List: ${r.metadata.error}`);
          return;
        }
        setKeyList(r.data);
      });
    }
  }, [formValues]);

  if (!databaseAccounts) {
    return <LoadingComponent />;
  }

  const databaseAccountOptions: IDropdownOption[] = [];
  databaseAccounts.forEach(account => databaseAccountOptions.push({ text: account.name, key: account.id, data: account }));
  if (!formValues.databaseAccount && databaseAccountOptions.length > 0) {
    setFormValues({ ...formValues, databaseAccount: databaseAccounts[0] });
  }

  return (
    <Formik
      initialValues={formValues}
      onSubmit={() =>
        setDocumentDBConnection(formValues, keyList, props.setNewAppSettingName, props.setIsDialogVisible, props.form, props.field)
      }>
      {(formProps: FormikProps<DocumentDBPivotFormValues>) => {
        return (
          <form style={paddingSidesStyle}>
            {!!databaseAccounts && databaseAccounts.length === 0 ? (
              <p>{t('documentDBPivot_noDatabaseAccounts')}</p>
            ) : (
              <>
                <Dropdown
                  label={t('documentDBPivot_databaseAccount')}
                  options={databaseAccountOptions}
                  selectedKey={formValues.databaseAccount && formValues.databaseAccount.id}
                  onChange={(o, e) => {
                    setFormValues({ databaseAccount: e && e.data });
                    setKeyList(undefined);
                  }}
                />
                {!keyList && <LoadingComponent />}
              </>
            )}
            <footer style={paddingTopStyle}>
              <DefaultButton disabled={!keyList} onClick={formProps.submitForm}>
                {t('ok')}
              </DefaultButton>
            </footer>
          </form>
        );
      }}
    </Formik>
  );
};

const setDocumentDBConnection = (
  formValues: DocumentDBPivotFormValues,
  keyList: KeyList | undefined,
  setNewAppSettingName: (e: string) => void,
  setIsDialogVisible: (d: boolean) => void,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any }
) => {
  if (formValues.databaseAccount && keyList) {
    const appSettingName = `${formValues.databaseAccount.name}_DOCUMENTDB`;
    formProps.setFieldValue(field.name, appSettingName);
    setNewAppSettingName(appSettingName);
    setIsDialogVisible(false);
  }
};

export default DocumentDBPivot;
