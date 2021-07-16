import React, { useContext, useEffect, useCallback } from 'react';
import CosmosDbControls from './CosmosDbControls';
import { Field, FormikProps } from 'formik';
import { Stack, TextField, Icon } from 'office-ui-fabric-react';
import InputLabel from '../common/components/InputLabel';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../common/ThemeContext';
import {
  inputStackStyle,
  accountNameFieldStyle,
  accountNameInputStyle,
  apiTypeFieldStyle,
  inputErrorDivHorizontalStyle,
  inputErrorDivVerticalStyle,
  errorIconStyle,
  inputErrorStyle,
  apiTypeStyle,
} from './CosmosDbCreator.styles';

// Interface for form's values
export interface CreateCosmosDbFormValues {
  accountName: string;
  // apiType: string,
}

interface CosmosDbCreatorProps {
  setTemplate: Function;
  template: string; // Unused for now (6/14/2021), may be good for telemetry later
  location?: string;
  formProps: FormikProps<CreateCosmosDbFormValues>;
  armAuthToken?: string;
  horizontal?: boolean;
  language?: string;
}

// Unused for now, dropdown options to be implemented in future (only coreSql for now)
const apiType = 'coreSql';
// const apiTypeOptions = [
//    { key: 'coreSql', text: 'Core (SQL)' },
//    { key: 'mongoDb', text: 'MongoDB' },
//    { key: 'cassandra', text: 'Cassandra' },
//    { key: 'azureTable', text: 'Azure Table' },
//    { key: 'gremlin', text: 'Gremlin (Graph)' },
// ];

export const CosmosDbCreator = (props: CosmosDbCreatorProps) => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const { formProps } = props;
  const { setTemplate } = props;
  const AppSvc = CosmosDbControls.AppSvc;

  const validateAccountName = async (name: string, resolve) => {
    let error: string | undefined;
    const validNameRegExp = new RegExp('^[a-z0-9-]{3,44}$'); // Lowercase letters, numbers, '-'; 3 - 44 characters

    if (!name) {
      error = t('cosmosDb_error_accountNameReq');
    } else if (!validNameRegExp.test(name)) {
      error = t('cosmosDb_error_invalidAccountName');
    } else {
      // Check if DB account name is available
      // Docs: https://docs.microsoft.com/en-us/rest/api/cosmos-db-resource-provider/2021-04-15/database-accounts/check-name-exists

      if (!AppSvc.ajax || !props.armAuthToken) resolve(error);

      const apiVersion = '2021-04-15';
      const response = await AppSvc.ajax.httpRequest({
        url: `https://management.azure.com/providers/Microsoft.DocumentDB/databaseAccountNames/${name}?api-version=${apiVersion}`,
        method: 'HEAD',
        headers: {
          Authorization: `Bearer ${props.armAuthToken}`,
        },
      });

      if (response.metadata.success) {
        error = 'This account name is already taken';

        CosmosDbControls.logError({
          category: 'createCdbAccount',
          id: 'accountNameUnavailable',
          data: 'Name unavailable',
        });
      }
    }

    resolve(error);
  };

  const accountNameValidationDebounce = useCallback(debounce(validateAccountName, 300), []);

  // Generates Cosmos DB template on input value update
  // Validity is enforced on submit (parent component)
  const generateCosmosDbTemplate = () => {
    if (!formProps) return;
    const { accountName } = formProps.values; // Destructuring for ease of use

    let cDbControls = new CosmosDbControls();

    cDbControls.template.name = accountName;
    if (apiType === 'coreSql') {
      cDbControls.template.kind = 'GlobalDocumentDB';
    }

    let cosmosDbTemplateString = cDbControls.createTemplateJSON();

    // Prop method to handle what we're returning to it (ARM resource template)
    setTemplate(cosmosDbTemplateString);

    CosmosDbControls.logEvent({
      category: 'createCdbAccount',
      id: 'createdTemplate',
      data: cosmosDbTemplateString,
    });
  };

  useEffect(generateCosmosDbTemplate, [setTemplate, formProps, formProps.values]);

  return (
    <>
      <Stack horizontal={props.horizontal} verticalAlign="center" className={inputStackStyle}>
        <InputLabel htmlFor="accountName" labelText={t('cosmosDb_label_accountName')} required />
        <Field
          name="accountName"
          id="accountName"
          validate={value => new Promise(resolve => accountNameValidationDebounce(value, resolve))}
          component={TextField}
          className={accountNameFieldStyle}
          inputClassName={accountNameInputStyle}
          styles={{
            fieldGroup: {
              height: '24px',
            },
          }}
          onChange={formProps.handleChange}
          value={formProps.values.accountName}
        />
      </Stack>

      {formProps.errors.accountName && (
        <Stack horizontal className={props.horizontal ? inputErrorDivHorizontalStyle : inputErrorDivVerticalStyle}>
          <Icon className={errorIconStyle(theme)} iconName="StatusErrorFull" />
          <span className={inputErrorStyle(theme)}>{formProps.errors.accountName}</span>
        </Stack>
      )}

      <Stack horizontal={props.horizontal} verticalAlign="center" className={inputStackStyle}>
        <InputLabel /* htmlFor='apiType' */ labelText={t('cosmosDb_label_apiType')} required />
        {/* Disabled (along with apiTypeOptions) until future notice (as of 6/3/2021)
                <Field
                    name='apiType'
                    id='apiType'
                    value={formProps.values.apiType}
                >
                    {({ field }) => (
                        <Dropdown 
                            className={fieldStyle}
                            // 'onChanged' is deprecated but it works while 'onChange' doesn't (2 JUNE 2021)
                            onChanged={(option: IDropdownOption) => formProps.setFieldValue('apiType', option.key)} 
                            options={apiTypeOptions}
                            selectedKey={formProps.values.apiType}
                            {...field}
                            required
                        />
                    )}
                </Field>
                */}
        <Stack verticalAlign="center" className={apiTypeFieldStyle}>
          <span className={apiTypeStyle(theme)}>Core (SQL)</span>
        </Stack>
      </Stack>
    </>
  );
};
