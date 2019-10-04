import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import ActionBar from '../../../../components/ActionBar';
import { FormAzureStorageMounts } from '../AppSettings.types';
import { IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import AzureStorageMountsAddEditBasic from './AzureStorageMountsAddEditBasic';
import AzureStorageMountsAddEditAdvanced from './AzureStorageMountsAddEditAdvanced';
import { Formik, FormikProps, Field, Form } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import { StorageAccountsContext } from '../Contexts';
import { addEditFormStyle } from '../../../../components/form-controls/formControl.override.styles';
import RadioButton from '../../../../components/form-controls/RadioButton';

export interface AzureStorageMountsAddEditProps {
  updateAzureStorageMount: (item: FormAzureStorageMounts) => any;
  otherAzureStorageMounts: FormAzureStorageMounts[];
  closeBlade: () => void;
  azureStorageMount: FormAzureStorageMounts;
}

export type AzureStorageMountsAddEditPropsCombined = AzureStorageMountsAddEditProps;
const AzureStorageMountsAddEdit: React.SFC<AzureStorageMountsAddEditPropsCombined> = props => {
  const { closeBlade, otherAzureStorageMounts, azureStorageMount, updateAzureStorageMount } = props;
  const storageAccounts = useContext(StorageAccountsContext);
  const [configurationOption, setConfigurationOption] = useState('basic');
  const { t } = useTranslation();
  const [basicDisabled, setBasicDisabled] = useState(false);
  const [initialName] = useState(azureStorageMount.name);
  const cancel = () => {
    closeBlade();
  };

  const validateAppSettingName = (value: string) => {
    if (initialName && value === initialName) {
      return undefined;
    }

    if (!value) {
      return t('validation_requiredError');
    }

    return otherAzureStorageMounts.filter(v => v.name.toLowerCase() === value.toLowerCase()).length >= 1
      ? t('azureStorageMountMustBeUnique')
      : undefined;
  };

  useEffect(() => {
    if (storageAccounts.value.length === 0) {
      setConfigurationOption('advanced');
      setBasicDisabled(true);
    } else if (azureStorageMount.accountName && !storageAccounts.value.find(x => x.name === azureStorageMount.accountName)) {
      setConfigurationOption('advanced');
    }
  }, []);

  return (
    <Formik
      initialValues={{ ...azureStorageMount }}
      onSubmit={values => {
        updateAzureStorageMount(values);
      }}
      render={(formProps: FormikProps<FormAzureStorageMounts>) => {
        const actionBarPrimaryButtonProps = {
          id: 'save',
          title: t('ok'),
          onClick: formProps.submitForm,
          disable: !formProps.isValid || !formProps.dirty || formProps.isValidating,
        };

        const actionBarSecondaryButtonProps = {
          id: 'cancel',
          title: t('cancel'),
          onClick: cancel,
          disable: false,
        };
        return (
          <Form className={addEditFormStyle}>
            <Field
              name={'name'}
              label={t('_name')}
              component={TextField}
              id={`azure-storage-mounts-name`}
              ariaLabel={t('_name')}
              errorMessage={formProps.errors && formProps.errors.name}
              validate={(value: string) => {
                const error = validateAppSettingName(value);
                if (error) {
                  throw error;
                }
              }}
              autoFocus
              {...formProps}
            />
            <Field
              id="azure-storage-mounts-configuration-options"
              selectedKey={configurationOption}
              label={t('configurationOptions')}
              component={RadioButton}
              options={[
                {
                  key: 'basic',
                  text: t('basic'),
                  disabled: basicDisabled,
                },
                {
                  key: 'advanced',
                  text: t('advanced'),
                },
              ]}
              onChange={(e: any, configOptions: IChoiceGroupOption) => {
                setConfigurationOption(configOptions.key);
              }}
            />
            {configurationOption === 'basic' && <AzureStorageMountsAddEditBasic {...props} {...formProps} />}
            {configurationOption === 'advanced' && <AzureStorageMountsAddEditAdvanced {...props} {...formProps} />}
            <Field
              name={'mountPath'}
              label={t('mountPath')}
              component={TextField}
              id={`azure-storage-mounts-path`}
              errorMessage={formProps.errors && formProps.errors.mountPath}
              {...formProps}
            />
            <ActionBar
              id="handler-mappings-edit-footer"
              primaryButton={actionBarPrimaryButtonProps}
              secondaryButton={actionBarSecondaryButtonProps}
              validating={formProps.isValidating}
            />
          </Form>
        );
      }}
    />
  );
};

export default AzureStorageMountsAddEdit;
