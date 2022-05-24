import { Icon, Stack, TextField } from '@fluentui/react';
import { Field, FormikProps } from 'formik';
import { debounce } from 'lodash';
import { useCallback, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DocumentDBService from '../../../../../../ApiHelpers/DocumentDBService';
import InputLabel from '../../../../../../components/InputLabel/InputLabel';
import { StartupInfoContext } from '../../../../../../StartupInfoContext';
import CosmosDbControls from './CosmosDbControls';
import { accountNameFieldStyles, useStyles } from './CosmosDbCreator.styles';

export interface CreateCosmosDbFormValues {
  accountName: string;
}

interface CosmosDbCreatorProps {
  formProps: FormikProps<CreateCosmosDbFormValues>;
  template?: string;
  setTemplate: React.Dispatch<string>;
}

// Lowercase letters, numbers, '-'; 3-44 characters
const validNameRegExp = /^[a-z0-9-]{3,44}$/;

export const CosmosDbCreator: React.FC<CosmosDbCreatorProps> = ({ formProps, setTemplate }: CosmosDbCreatorProps) => {
  const startupInfoContext = useContext(StartupInfoContext);
  const styles = useStyles();
  const { t } = useTranslation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateAccountName = useCallback(
    debounce(
      (name: string, resolve: (value?: string | PromiseLike<string | undefined>) => void) => {
        if (!name) {
          resolve(t('cosmosDb_error_accountNameRequired'));
        } else if (!validNameRegExp.test(name)) {
          resolve(t('cosmosDb_error_accountNameInvalid'));
        } else {
          const { armEndpoint, token } = startupInfoContext;
          resolve(
            DocumentDBService.validateDatabaseAccountName(armEndpoint, token, name).then(response => {
              return response.metadata.success ? t('cosmosDb_error_accountNameTaken') : undefined;
            })
          );
        }
      },
      300 // milliseconds
    ),
    []
  );

  useEffect(() => {
    if (formProps?.values.accountName) {
      const cDbControls = new CosmosDbControls();
      cDbControls.template.name = formProps?.values.accountName;
      cDbControls.template.kind = 'GlobalDocumentDB';

      setTemplate(cDbControls.createTemplateJSON());
    }
  }, [formProps?.values.accountName, setTemplate]);

  return (
    <Stack>
      <Stack horizontal verticalAlign="center" className={styles.inputStack}>
        <InputLabel htmlFor="accountName" labelText={t('cosmosDb_label_accountName')} required />
        <Field
          className={styles.accountNameField}
          component={TextField}
          id="accountName"
          inputClassName={styles.accountNameInput}
          name="accountName"
          styles={accountNameFieldStyles}
          validate={(value: string) => new Promise<string | undefined>(resolve => validateAccountName(value, resolve))}
          value={formProps.values.accountName}
          onChange={formProps.handleChange}
        />
      </Stack>
      {formProps.errors.accountName && (
        <Stack horizontal className={styles.inputErrorDivHorizontal}>
          <Icon className={styles.errorIcon} iconName="StatusErrorFull" />
          <span className={styles.inputError}>{formProps.errors.accountName}</span>
        </Stack>
      )}
      <Stack horizontal verticalAlign="center" className={styles.inputStack}>
        <InputLabel labelText={t('cosmosDb_label_apiType')} required />
        <Stack verticalAlign="center" className={styles.apiTypeField}>
          <span className={styles.apiType}>{t('cosmosDb_apiType_coreSql')}</span>
        </Stack>
      </Stack>
    </Stack>
  );
};
