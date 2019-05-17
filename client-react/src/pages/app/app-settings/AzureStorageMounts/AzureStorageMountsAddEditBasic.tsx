import React, { useEffect, useState, useContext } from 'react';
import { FormAzureStorageMounts } from '../AppSettings.types';
import { AzureStorageMountsAddEditPropsCombined } from './AzureStorageMountsAddEdit';
import MakeArmCall from '../../../../ApiHelpers/ArmHelper';
import axios from 'axios';
import { formElementStyle } from '../AppSettings.styles';
import { FormikProps, Field } from 'formik';
import ComboBox from '../../../../components/form-controls/ComboBox';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { useTranslation } from 'react-i18next';
import { StorageAccountsContext } from '../Contexts';

const storageKinds = {
  StorageV2: 'StorageV2',
  BlobStorage: 'BlobStorage',
  Storage: 'Storage',
};
const AzureStorageMountsAddEditBasic: React.FC<FormikProps<FormAzureStorageMounts> & AzureStorageMountsAddEditPropsCombined> = props => {
  const { errors, values, setValues, setFieldValue } = props;
  const [accountSharesFiles, setAccountSharesFiles] = useState([]);
  const [accountSharesBlob, setAccountSharesBlob] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const storageAccounts = useContext(StorageAccountsContext);
  const accountOptions = storageAccounts.value.map(val => ({ key: val.name, text: val.name }));
  const { t } = useTranslation();
  const setAccessKey = (accessKey: string) => {
    setValues({ ...values, accessKey });
  };
  const storageAccount = storageAccounts.value.find(x => x.name === values.accountName);
  useEffect(() => {
    setAccountError('');
    if (storageAccount) {
      setAccountSharesBlob([]);
      setAccountSharesFiles([]);
      setSharesLoading(true);
      MakeArmCall({ resourceId: `${storageAccount.id}/listKeys`, commandName: 'listStorageKeys', method: 'POST' })
        .then(async ({ data }: any) => {
          setAccessKey(data.keys[0].value);
          const payload = {
            accountName: values.accountName,
            accessKey: data.keys[0].value,
          };
          try {
            const blobCall = axios.post(`/api/getStorageContainers?accountName=${values.accountName}`, payload);

            let filesCall: any = {
              data: [],
            };
            if (storageAccount.kind !== storageKinds.BlobStorage) {
              filesCall = axios.post(`/api/getStorageFileShares?accountName=${values.accountName}`, payload);
            }

            const [blobs, files] = await Promise.all([blobCall, filesCall]);
            setSharesLoading(false);
            const filesData = files.data || [];
            const blobData = blobs.data || [];
            setAccountSharesFiles(filesData);
            setAccountSharesBlob(blobData);
            if (filesData.length === 0) {
              setFieldValue('type', 'AzureBlob');
            } else if (blobData.length === 0) {
              setFieldValue('type', 'AzureFiles');
            }
            if (filesData.length === 0 && blobData.length === 0) {
              setAccountError(t('noBlobsOrFilesShares'));
            }
          } catch (err) {
            setAccountError(t('noWriteAccessStorageAccount'));
          }
        })
        .catch(err => {
          setAccountError(t('noWriteAccessStorageAccount'));
        });
    }
  }, [values.accountName]);
  const blobContainerOptions = accountSharesBlob.map((x: any) => ({ key: x.name, text: x.name }));
  const filesContainerOptions = accountSharesFiles.map((x: any) => ({ key: x.name, text: x.name }));

  return (
    <>
      <Field
        component={ComboBox}
        id="azure-storage-account-name"
        name="accountName"
        options={accountOptions}
        label={t('storageAccounts')}
        allowFreeform
        autoComplete="on"
        styles={{
          root: formElementStyle,
        }}
        errorMessage={errors.accountName}
        validate={() => {
          if (accountError) {
            throw accountError;
          }
        }}
      />
      {(!storageAccount || storageAccount.kind !== storageKinds.BlobStorage) && (
        <Field
          component={RadioButton}
          name="type"
          id="azure-storage-mounts-name"
          label={t('storageType')}
          options={[
            {
              key: 'AzureBlob',
              text: t('azureBlob'),
              disabled: blobContainerOptions.length === 0,
            },
            {
              key: 'AzureFiles',
              text: t('azureFiles'),
              disabled: filesContainerOptions.length === 0,
            },
          ]}
        />
      )}
      <Field
        component={ComboBox}
        name="shareName"
        options={values.type === 'AzureBlob' ? blobContainerOptions : filesContainerOptions}
        label={t('storageContainer')}
        allowFreeform
        autoComplete="on"
        placeholder={sharesLoading ? t('loading') : t('selectAnOption')}
        styles={{
          root: formElementStyle,
        }}
        validate={val => {
          if (sharesLoading) {
            return;
          }
          if (!val) {
            throw t('required');
          }
          const foundVal =
            values.type === 'AzureBlob' ? blobContainerOptions.find(x => x.key === val) : filesContainerOptions.find(x => x.key === val);
          if (!foundVal) {
            throw t('required');
          }
        }}
        errorMessage={errors.shareName}
      />
    </>
  );
};

export default AzureStorageMountsAddEditBasic;
