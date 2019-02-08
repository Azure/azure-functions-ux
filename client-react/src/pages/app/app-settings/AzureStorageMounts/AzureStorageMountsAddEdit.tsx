import React, { useState, useEffect } from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';

import ActionBar from '../../../../components/ActionBar';
import { formElementStyle } from '../AppSettings.styles';
import { FormAzureStorageMounts } from '../AppSettings.types';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { RootState } from '../../../../modules/types';
import { StorageAccountsState } from '../../../../modules/storageAccounts/reducer';
import AzureStorageMountsAddEditBasic from './AzureStorageMountsAddEditBasic';
import AzureStorageMountsAddEditAdvanced from './AzureStorageMountsAddEditAdvanced';
import { Formik, FormikProps, Field } from 'formik';
import TextField from '../../../../components/form-controls/TextField';

export interface AzureStorageMountsAddEditProps {
  updateAzureStorageMount: (item: FormAzureStorageMounts) => any;
  otherAzureStorageMounts: FormAzureStorageMounts[];
  closeBlade: () => void;
  azureStorageMount: FormAzureStorageMounts;
}

interface AzureStorageMountsAddEditStateProps {
  storageAccounts: StorageAccountsState;
}

export type AzureStorageMountsAddEditPropsCombined = AzureStorageMountsAddEditProps &
  InjectedTranslateProps &
  AzureStorageMountsAddEditStateProps;
const AzureStorageMountsAddEdit: React.SFC<AzureStorageMountsAddEditPropsCombined> = props => {
  const { t, closeBlade, storageAccounts, otherAzureStorageMounts, azureStorageMount, updateAzureStorageMount } = props;
  const [confiurationOption, setConfigurationOption] = useState('basic');
  const [basicDisabled, setBasicDisabled] = useState(false);
  const [initialName] = useState(azureStorageMount.name);
  const cancel = () => {
    closeBlade();
  };

  const validateAppSettingName = (value: string) => {
    if (initialName && value === initialName) {
      return '';
    }
    return otherAzureStorageMounts.filter(v => v.name.toLowerCase() === value.toLowerCase()).length >= 1
      ? t('azureStorageMountMustBeUnique')
      : '';
  };

  const updateConfigurationOptions = (e: any, configOptions: IChoiceGroupOption) => {
    setConfigurationOption(configOptions.key);
  };

  useEffect(() => {
    if (storageAccounts.data.value.length === 0) {
      setConfigurationOption('advanced');
      setBasicDisabled(true);
    } else if (azureStorageMount.accountName && !storageAccounts.data.value.find(x => x.name === azureStorageMount.accountName)) {
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
          title: t('update'),
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
          <form>
            <Field
              name={'name'}
              label={t('_name')}
              component={TextField}
              id={`azure-storage-mounts-name`}
              ariaLabel={t('_name')}
              errorMessage={formProps.errors && formProps.errors.name}
              styles={{
                root: formElementStyle,
              }}
              validate={val => {
                const error = validateAppSettingName(val);
                if (error) {
                  throw error;
                }
              }}
              autoFocus
              {...formProps}
            />
            <ChoiceGroup
              id="azure-storage-mounts-configuration-options"
              selectedKey={confiurationOption}
              label={t('configurationOptions')}
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
              onChange={updateConfigurationOptions}
            />
            {confiurationOption === 'basic' && <AzureStorageMountsAddEditBasic {...props} {...formProps} />}
            {confiurationOption === 'advanced' && <AzureStorageMountsAddEditAdvanced {...props} {...formProps} />}
            <Field
              name={'mountPath'}
              label={t('mountPath')}
              component={TextField}
              id={`azure-storage-mounts-path`}
              errorMessage={formProps.errors && formProps.errors.mountPath}
              styles={{
                root: formElementStyle,
              }}
              {...formProps}
            />
            <ActionBar
              id="handler-mappings-edit-footer"
              primaryButton={actionBarPrimaryButtonProps}
              secondaryButton={actionBarSecondaryButtonProps}
              validating={formProps.isValidating}
            />
          </form>
        );
      }}
    />
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    storageAccounts: state.azureStorageAccounts,
  };
};
export default compose<AzureStorageMountsAddEditPropsCombined, AzureStorageMountsAddEditProps>(
  translate('translation'),
  connect(mapStateToProps)
)(AzureStorageMountsAddEdit);
