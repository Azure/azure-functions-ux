import React from 'react';
import { AzureStorageMountsAddEditPropsCombined, messageBanner } from './AzureStorageMountsAddEdit';
import { FormikProps, Field } from 'formik';
import { FormAzureStorageMounts } from '../AppSettings.types';
import TextField from '../../../../components/form-controls/TextField';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { useTranslation } from 'react-i18next';
import { StorageType } from '../../../../models/site/config';
import { MessageBar, MessageBarType, Link } from 'office-ui-fabric-react';
import { CommonConstants } from '../../../../utils/CommonConstants';

const AzureStorageMountsAddEditAdvanced: React.FC<FormikProps<FormAzureStorageMounts> & AzureStorageMountsAddEditPropsCombined> = props => {
  const { errors, values } = props;
  const { t } = useTranslation();

  return (
    <>
      <Field
        component={TextField}
        name="accountName"
        label={t('storageAccount')}
        id="azure-storage-mounts-account-name"
        errorMessage={errors.accountName}
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
      {values.type === StorageType.azureBlob && (
        <MessageBar
          id="azure-storage-mount-blob-warning"
          className={messageBanner}
          isMultiline={false}
          messageBarType={MessageBarType.warning}>
          {t('readonlyBlobStorageWarning')}
          <Link href={CommonConstants.Links.byosBlobReadonlyLearnMore} target="_blank">
            {t('learnMore')}
          </Link>
        </MessageBar>
      )}
      <Field
        component={TextField}
        name="shareName"
        label={t('shareName')}
        id="azure-storage-mounts-share-name"
        errorMessage={errors.shareName}
      />
      <Field
        component={TextField}
        name="accessKey"
        label={t('accessKey')}
        id="azure-storage-mounts-access-key"
        multiline
        rows={4}
        errorMessage={errors.accessKey}
      />
    </>
  );
};

export default AzureStorageMountsAddEditAdvanced;
