import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import ActionBar from '../../../../components/ActionBar';
import { FormAzureStorageMounts } from '../AppSettings.types';
import { IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import AzureStorageMountsAddEditBasic from './AzureStorageMountsAddEditBasic';
import AzureStorageMountsAddEditAdvanced from './AzureStorageMountsAddEditAdvanced';
import { Formik, FormikProps, Field, Form } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import { SiteContext, StorageAccountsContext } from '../Contexts';
import { addEditFormStyle } from '../../../../components/form-controls/formControl.override.styles';
import RadioButton from '../../../../components/form-controls/RadioButton';
import * as Yup from 'yup';
import { style } from 'typestyle';
import { isContainerApp, isWindowsCode } from '../../../../utils/arm-utils';
import { ValidationRegex } from '../../../../utils/constants/ValidationRegex';

export interface AzureStorageMountsAddEditProps {
  updateAzureStorageMount: (item: FormAzureStorageMounts) => any;
  otherAzureStorageMounts: FormAzureStorageMounts[];
  closeBlade: () => void;
  azureStorageMount: FormAzureStorageMounts;
  // TODO (refortie): Temporary until xenon validation is put in
  enableValidation: boolean;
}

export type AzureStorageMountsAddEditPropsCombined = AzureStorageMountsAddEditProps;
const AzureStorageMountsAddEdit: React.SFC<AzureStorageMountsAddEditPropsCombined> = props => {
  const { closeBlade, otherAzureStorageMounts, azureStorageMount, updateAzureStorageMount, enableValidation } = props;
  const storageAccounts = useContext(StorageAccountsContext);
  const site = useContext(SiteContext);
  const [configurationOption, setConfigurationOption] = useState('basic');
  const { t } = useTranslation();
  const [basicDisabled, setBasicDisabled] = useState(false);
  const [initialName] = useState(azureStorageMount.name);
  const [initialMountPath] = useState(azureStorageMount.mountPath);

  const shareNameMaxLength = 64;
  const mountPathMaxLength = 256;

  // eslint-disable-next-line no-useless-escape
  const shareNameRegex = /^[a-zA-Z0-9\[\]\(\)\-_]+$/;
  const cancel = () => {
    closeBlade();
  };

  const validateMountPath = (value: string): string | undefined => {
    if (!!value) {
      let errorMessage = '';
      let regex: RegExp;
      if (isWindowsCode(site)) {
        if (isContainerApp(site)) {
          regex = ValidationRegex.storageMountPath.windowsContainer;
          if (!regex.test(value)) {
            errorMessage = t('validation_windowsContainerMountPath');
          }
        } else {
          regex = ValidationRegex.storageMountPath.windowsCode;
          if (!regex.test(value)) {
            // eslint-disable-next-line no-useless-escape
            const invalidChars = /^[a-zA-Z0-9._\-\[\]\(\)\/\\]*$/;
            errorMessage = invalidChars.test(value)
              ? t('validation_windowsWebAppMountPath')
              : t('validation_windowsWebAppMountNameAllowedCharacters');
          }
        }
      } else {
        regex = new RegExp(ValidationRegex.storageMountPath.linux);
        if (!regex.test(value)) {
          errorMessage = t('validation_linuxMountNameAllowedCharacters');
        }
      }
      return !!errorMessage ? errorMessage : undefined;
    }

    return t('validation_requiredError');
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t('validation_requiredError'))
      .test('uniqueName', t('azureStorageMountMustBeUnique'), value => {
        return (
          !value ||
          value.toLowerCase() === initialName.toLowerCase() ||
          !otherAzureStorageMounts.some(storageMount => storageMount.name.toLowerCase() === value.toLowerCase())
        );
      }),
    accountName: Yup.string().required(t('validation_requiredError')),
    shareName: Yup.string()
      .max(shareNameMaxLength, t('validation_fieldMaxCharacters').format(shareNameMaxLength))
      .matches(shareNameRegex, t('validation_shareNameAllowedCharacters')),
    accessKey: Yup.string().required(t('validation_requiredError')),
    mountPath: Yup.string()
      .required(t('validation_requiredError'))
      .max(mountPathMaxLength, t('validation_fieldMaxCharacters').format(mountPathMaxLength))
      .test('cannotMountHomeDirectory', t('validation_mountPathNotHome'), (value: string) => value !== '/home')
      .test('cannotMountRootDirectory', t('validation_mountPathNotRoot'), (value: string) => value !== '/')
      .test('uniqueMountPath', t('mouthPathMustBeUnique'), value => {
        return (
          !value ||
          value === initialMountPath ||
          !otherAzureStorageMounts.some(storageMount => storageMount.mountPath.toLowerCase() === value.toLowerCase())
        );
      }),
  });

  useEffect(() => {
    if (storageAccounts.value.length === 0) {
      setConfigurationOption('advanced');
      setBasicDisabled(true);
    } else if (azureStorageMount.accountName && !storageAccounts.value.find(x => x.name === azureStorageMount.accountName)) {
      setConfigurationOption('advanced');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Formik
      initialValues={{ ...azureStorageMount }}
      onSubmit={values => {
        updateAzureStorageMount(values);
      }}
      validationSchema={enableValidation && validationSchema}
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
              required={true}
              autoFocus
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
              required={true}
              validate={validateMountPath}
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

export const messageBanner = style({
  paddingLeft: '5px',
  marginBottom: '15px',
});

export default AzureStorageMountsAddEdit;
