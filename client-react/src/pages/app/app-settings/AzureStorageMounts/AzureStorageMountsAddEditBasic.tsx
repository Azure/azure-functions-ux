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
const AzureStorageMountsAddEditBasic: React.FC<FormikProps<FormAzureStorageMounts> & AzureStorageMountsAddEditPropsCombined> = props => {
  const { errors } = props;
  const [accountSharesFiles, setAccountSharesFiles] = useState([]);
  const [accountSharesBlob, setAccountSharesBlob] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const storageAccounts = useContext(StorageAccountsContext);
  const accountOptions = storageAccounts.value.map(val => ({ key: val.name, text: val.name }));
  const { t } = useTranslation();
  const setAccessKey = (accessKey: string) => {
    props.setValues({ ...props.values, accessKey });
  };
  useEffect(
    () => {
      const storageAccountId = storageAccounts.value.find(x => x.name === props.values.accountName);
      setAccountError('');
      if (storageAccountId) {
        setAccountSharesBlob([]);
        setAccountSharesFiles([]);
        setSharesLoading(true);
        MakeArmCall({ resourceId: `${storageAccountId.id}/listKeys`, commandName: 'listStorageKeys', method: 'POST' })
          .then(async ({ data }: any) => {
            setAccessKey(data.keys[0].value);
            const payload = {
              accountName: props.values.accountName,
              accessKey: data.keys[0].value,
            };
            try {
              const blobCall = axios.post(
                `https://functions.azure.com/api/getStorageContainers?accountName=${props.values.accountName}`,
                payload
              );

              const filesCall = axios.post(
                `https://functions.azure.com/api/getStorageFileShares?accountName=${props.values.accountName}`,
                payload
              );

              const [blobs, files] = await Promise.all([blobCall, filesCall]);
              setSharesLoading(false);
              setAccountSharesFiles(files.data);
              setAccountSharesBlob(blobs.data);
              if (files.data.length === 0 && blobs.data.length === 0) {
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
    },
    [props.values.accountName]
  );
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
      <Field
        component={ComboBox}
        name="shareName"
        options={props.values.type === 'AzureBlob' ? blobContainerOptions : filesContainerOptions}
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
            props.values.type === 'AzureBlob'
              ? blobContainerOptions.find(x => x.key === val)
              : filesContainerOptions.find(x => x.key === val);
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
