import React from 'react';
import { AzureStorageMountsAddEditPropsCombined } from './AzureStorageMountsAddEdit';
import { formElementStyle } from '../AppSettings.styles';
import { FormikProps, Field } from 'formik';
import { FormAzureStorageMounts } from '../AppSettings.types';
import TextField from '../../../../components/form-controls/TextField';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { useTranslation } from 'react-i18next';
const AzureStorageMountsAddEditAdvanced: React.FC<FormikProps<FormAzureStorageMounts> & AzureStorageMountsAddEditPropsCombined> = props => {
  const { errors } = props;
  const { t } = useTranslation();
  return (
    <>
      <Field
        component={TextField}
        name="accountName"
        label={t('storageAccount')}
        id="azure-storage-mounts-account-name"
        errorMessage={errors.accountName}
        styles={{
          root: formElementStyle,
        }}
      />
      <Field
        component={RadioButton}
        name="type"
        label={t('storageType')}
        options={[
          {
            key: 'AzureBlob',
            text: t('azureBlob'),
          },
          {
            key: 'AzureFiles',
            text: t('azureFiles'),
          },
        ]}
      />
      <Field
        component={TextField}
        name="shareName"
        label={t('shareName')}
        id="azure-storage-mounts-share-name"
        styles={{
          root: formElementStyle,
        }}
        errorMessage={errors.shareName}
      />
      <Field
        component={TextField}
        name="accessKey"
        label={t('accessKey')}
        id="azure-storage-mounts-access-key"
        styles={{
          root: formElementStyle,
        }}
        multiline
        rows={4}
        errorMessage={errors.accessKey}
      />
    </>
  );
};
export default AzureStorageMountsAddEditAdvanced;
