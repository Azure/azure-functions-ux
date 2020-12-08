import { FieldProps, Formik, FormikProps } from 'formik';
import { IDropdownOption, IDropdownProps, PrimaryButton } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../../../../ApiHelpers/ArmHelper';
import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { Layout } from '../../../../../../components/form-controls/ReactiveFormControl';
import LoadingComponent from '../../../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../../../models/arm-obj';
import { DatabaseAccount, KeyList } from '../../../../../../models/documentDB';
import { LogCategories } from '../../../../../../utils/LogCategories';
import LogService from '../../../../../../utils/LogService';
import { generateAppSettingName } from '../../ResourceDropdown';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { DocumentDBPivotContext } from './DocumentDBDataLoader';

interface DocumentDBPivotFormValues {
  databaseAccount: ArmObj<DatabaseAccount> | undefined;
}

const DocumentDBPivot: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const provider = useContext(DocumentDBPivotContext);
  const { t } = useTranslation();
  const { resourceId, appSettingKeys } = props;
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
            `Failed to get Database Accounts: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
          return;
        }
        setDatabaseAccounts(r.data.value);
      });
    } else if (formValues.databaseAccount && !keyList) {
      provider.fetchKeyList(formValues.databaseAccount.id).then(r => {
        if (!r.metadata.success) {
          LogService.trackEvent(
            LogCategories.bindingResource,
            'getKeyList',
            `Failed to get Key List: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
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
        setDocumentDBConnection(
          formValues,
          keyList,
          appSettingKeys,
          props.setNewAppSetting,
          props.setSelectedItem,
          props.setIsDialogVisible
        )
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
                  layout={Layout.Vertical}
                  {...props}
                  id="newDocumentDBConnection"
                  mouseOverToolTip={undefined}
                />
                {!keyList && <LoadingComponent />}
              </>
            )}
            <footer style={paddingTopStyle}>
              <PrimaryButton disabled={!keyList} onClick={formProps.submitForm}>
                {t('ok')}
              </PrimaryButton>
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
  appSettingKeys: string[],
  setNewAppSetting: React.Dispatch<React.SetStateAction<{ key: string; value: string }>>,
  setSelectedItem: React.Dispatch<React.SetStateAction<IDropdownOption | undefined>>,
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (formValues.databaseAccount && keyList) {
    const appSettingName = generateAppSettingName(appSettingKeys, `${formValues.databaseAccount.name}_DOCUMENTDB`);
    const appSettingValue = `AccountEndpoint=${formValues.databaseAccount.properties.documentEndpoint};AccountKey=${
      keyList.primaryMasterKey
    };`;
    setNewAppSetting({ key: appSettingName, value: appSettingValue });
    setSelectedItem({ key: appSettingName, text: appSettingName, data: appSettingValue });
    setIsDialogVisible(false);
  }
};

export default DocumentDBPivot;
