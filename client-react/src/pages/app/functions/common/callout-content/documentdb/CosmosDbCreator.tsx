import { Icon, Stack, TextField } from '@fluentui/react';
import { Field, FormikProps } from 'formik';
import { debounce } from 'lodash';
import { useCallback, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { sendHttpRequest } from '../../../../../../ApiHelpers/HttpClient';
import InputLabel from '../../../../../../components/InputLabel/InputLabel';
import { StartupInfoContext } from '../../../../../../StartupInfoContext';
import { ThemeContext } from '../../../../../../ThemeContext';
import { CommonConstants } from '../../../../../../utils/CommonConstants';
import { Guid } from '../../../../../../utils/Guid';
import CosmosDbControls from './CosmosDbControls';
import {
  accountNameFieldStyle,
  accountNameInputStyle,
  apiTypeFieldStyle,
  apiTypeStyle,
  errorIconStyle,
  inputErrorDivHorizontalStyle,
  inputErrorStyle,
  inputStackStyle,
} from './CosmosDbCreator.styles';

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
  const theme = useContext(ThemeContext);
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
          // https://docs.microsoft.com/rest/api/cosmos-db-resource-provider/2021-07-01-preview/database-accounts/check-name-exists
          resolve(
            sendHttpRequest<void>({
              headers: {
                Authorization: `Bearer ${startupInfoContext.token}`,
              },
              method: 'HEAD',
              url: `${startupInfoContext.armEndpoint}/providers/Microsoft.DocumentDB/databaseAccountNames/${name}?api-version=${CommonConstants.ApiVersions.documentDBApiVersion20210415}`,
            }).then(response => {
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
    if (formProps) {
      /** @todo (joechung): #14256559 - Fix template when integrating this. */
      const cDbControls = new CosmosDbControls();
      cDbControls.template.name = formProps.values.accountName;
      cDbControls.template.kind = 'GlobalDocumentDB';

      setTemplate(cDbControls.createTemplateJSON());
    }
  }, [formProps, setTemplate]);

  return (
    <Stack>
      <Stack horizontal verticalAlign="center" className={inputStackStyle}>
        <InputLabel
          htmlFor="accountName"
          labelText={t('cosmosDb_label_accountName')}
          required
          tooltipContent={t('cosmosDb_label_accountName')}
          tooltipId={`tooltip-${Guid.newTinyGuid()}`}
        />
        <Field
          className={accountNameFieldStyle}
          component={TextField}
          id="accountName"
          inputClassName={accountNameInputStyle}
          name="accountName"
          styles={{
            fieldGroup: {
              height: '24px',
            },
          }}
          validate={(value: string) => new Promise<string | undefined>(resolve => validateAccountName(value, resolve))}
          value={formProps.values.accountName}
          onChange={formProps.handleChange}
        />
      </Stack>
      {formProps.errors.accountName && (
        <Stack horizontal className={inputErrorDivHorizontalStyle}>
          <Icon className={errorIconStyle(theme)} iconName="StatusErrorFull" />
          <span className={inputErrorStyle(theme)}>{formProps.errors.accountName}</span>
        </Stack>
      )}
      <Stack horizontal verticalAlign="center" className={inputStackStyle}>
        <InputLabel labelText={t('cosmosDb_label_apiType')} required />
        <Stack verticalAlign="center" className={apiTypeFieldStyle}>
          <span className={apiTypeStyle(theme)}>{t('cosmosDb_apiType_coreSql')}</span>
        </Stack>
      </Stack>
    </Stack>
  );
};
