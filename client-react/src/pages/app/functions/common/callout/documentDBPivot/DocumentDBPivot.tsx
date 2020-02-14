import React, { useContext, useState, useEffect } from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { Formik, FormikProps, FieldProps } from 'formik';
import LoadingComponent from '../../../../../../components/Loading/LoadingComponent';
import { DocumentDBPivotContext } from './DocumentDBDataLoader';
import { DatabaseAccount, KeyList } from '../../../../../../models/documentDB';
import { ArmObj } from '../../../../../../models/arm-obj';
import LogService from '../../../../../../utils/LogService';
import { LogCategories } from '../../../../../../utils/LogCategories';
import { IDropdownOption, DefaultButton, IDropdownProps } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';

interface DocumentDBPivotFormValues {
  databaseAccount: ArmObj<DatabaseAccount> | undefined;
}

const DocumentDBPivot: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setDocumentDBConnection(formValues, keyList, props.setNewAppSetting, props.setSelectedItem, props.setIsDialogVisible)
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
                  errorMessage={undefined}
                  {...props}
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
  setNewAppSetting: (a: { key: string; value: string }) => void,
  setSelectedItem: (u: undefined) => void,
  setIsDialogVisible: (d: boolean) => void
) => {
  if (formValues.databaseAccount && keyList) {
    const appSettingName = `${formValues.databaseAccount.name}_DOCUMENTDB`;
    const appSettingValue = `AccountEndpoint=${formValues.databaseAccount.properties.documentEndpoint};AccountKey=${
      keyList.primaryMasterKey
    };`;
    setNewAppSetting({ key: appSettingName, value: appSettingValue });
    setSelectedItem(undefined);
    setIsDialogVisible(false);
  }
};

export default DocumentDBPivot;
