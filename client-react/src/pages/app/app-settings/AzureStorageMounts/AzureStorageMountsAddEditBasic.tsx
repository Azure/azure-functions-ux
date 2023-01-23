import React, { useEffect, useState, useContext } from 'react';
import { FormAzureStorageMounts } from '../AppSettings.types';
import { AzureStorageMountsAddEditPropsCombined } from './AzureStorageMountsAddEdit';
import MakeArmCall from '../../../../ApiHelpers/ArmHelper';
import { formElementStyle } from '../AppSettings.styles';
import { FormikProps, Field } from 'formik';
import ComboBox from '../../../../components/form-controls/ComboBox';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { useTranslation } from 'react-i18next';
import { StorageAccountsContext } from '../Contexts';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { MessageBarType } from '@fluentui/react';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { Links } from '../../../../utils/FwLinks';
import { StorageType } from '../../../../models/site/config';
import StorageService from '../../../../ApiHelpers/StorageService';
import { PortalContext } from '../../../../PortalContext';
import { FileShareEnabledProtocols } from '../../../../models/storage-account';
import { SiteStateContext } from '../../../../SiteState';

const storageKinds = {
  StorageV2: 'StorageV2',
  BlobStorage: 'BlobStorage',
  Storage: 'Storage',
};

interface StorageContainerErrorSchema {
  blobsContainerIsEmpty: boolean;
  filesContainerIsEmpty: boolean;
  getBlobsFailure: boolean;
  getFilesFailure: boolean;
}

const initializeStorageContainerErrorSchemaValue = (): StorageContainerErrorSchema => {
  return {
    blobsContainerIsEmpty: false,
    filesContainerIsEmpty: false,
    getBlobsFailure: false,
    getFilesFailure: false,
  };
};

const AzureStorageMountsAddEditBasic: React.FC<FormikProps<FormAzureStorageMounts> &
  AzureStorageMountsAddEditPropsCombined & {
    fileShareInfoBubbleMessage?: string;
  }> = props => {
  const { errors, values, initialValues, fileShareInfoBubbleMessage, setValues, setFieldValue, validateForm } = props;
  const [accountSharesFiles, setAccountSharesFiles] = useState([]);
  const [accountSharesBlob, setAccountSharesBlob] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [storageContainerErrorSchema, setStorageContainerErrorSchema] = useState<StorageContainerErrorSchema>(
    initializeStorageContainerErrorSchemaValue()
  );
  const storageAccounts = useContext(StorageAccountsContext);
  const { site } = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);

  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);

  const supportsBlobStorage = scenarioService.checkScenario(ScenarioIds.azureBlobMount, { site }).status !== 'disabled';
  const accountOptions = storageAccounts.value
    .filter(val => supportsBlobStorage || val.kind !== storageKinds.BlobStorage)
    .map(val => ({ key: val.name, text: val.name, data: val }));

  const validateStorageContainer = (value: string): string | undefined => {
    const emptyListError = validateNoStorageContainerAvailable();
    const notSelectedError = validateNoStorageContainerSelected(value);
    return emptyListError ? emptyListError : notSelectedError;
  };

  const validateNoStorageContainerSelected = (value: string): string | undefined => {
    if (
      sharesLoading ||
      (value && values.type === StorageType.azureBlob
        ? blobContainerOptions.find(x => x.key === value)
        : filesContainerOptions.find(x => x.key === value))
    ) {
      return undefined;
    }

    return t('validation_requiredError');
  };

  const validateNoStorageContainerAvailable = (): string | undefined => {
    return accountError ?? undefined;
  };

  const getAccessKey = (key: string): string => {
    return initialValues.accountName === values.accountName && !!initialValues.accessKey ? initialValues.accessKey : key;
  };

  const updateStorageContainerErrorMessage = (): void => {
    const storageType = values.type;
    const blobsContainerIsEmpty = storageContainerErrorSchema.blobsContainerIsEmpty;
    const filesContainerIsEmpty = storageContainerErrorSchema.filesContainerIsEmpty;
    const getBlobsFailure = storageContainerErrorSchema.getBlobsFailure;
    const getFilesFailure = storageContainerErrorSchema.getFilesFailure;
    if (storageType === StorageType.azureBlob && blobsContainerIsEmpty) {
      setAccountError(getBlobsFailure ? t('storageAccountDetailsFetchFailure') : t('noBlobs'));
    } else if (storageType === StorageType.azureFiles && filesContainerIsEmpty) {
      setAccountError(getFilesFailure ? t('storageAccountDetailsFetchFailure') : t('noFileShares'));
    } else {
      setAccountError('');
    }
  };

  const storageAccount = storageAccounts.value.find(x => x.name === values.accountName);

  useEffect(() => {
    setAccountError('');
    setStorageContainerErrorSchema(initializeStorageContainerErrorSchemaValue());
    if (storageAccount) {
      setAccountSharesBlob([]);
      setAccountSharesFiles([]);
      setSharesLoading(true);
      MakeArmCall({ resourceId: `${storageAccount.id}/listKeys`, commandName: 'listStorageKeys', method: 'POST' })
        .then(async ({ data }: any) => {
          const setAccessKey = (accessKey: string) => {
            setValues({ ...values, accessKey });
          };

          // Keep the original key if there is one, otherwise assign data.keys[0] to access key.
          // Add check on keys in case keys property is undefined or empty
          const retrievedKey = data?.keys?.[0]?.value ?? '';
          const key = getAccessKey(retrievedKey);
          setAccessKey(key);

          try {
            let blobsCall: any = {
              data: [],
            };

            if (supportsBlobStorage) {
              blobsCall = StorageService.fetchStorageBlobContainers(storageAccount.id);
            }

            let filesCall: any = {
              data: [],
            };

            if (storageAccount.kind !== storageKinds.BlobStorage) {
              filesCall = StorageService.fetchStorageFileShareContainers(storageAccount.id);
            }

            const [blobs, files] = await Promise.all([blobsCall, filesCall]);

            // add null check on blobs.metadata and files.metadata
            const blobsMetaData = blobs && blobs.metadata;
            const filesMetaData = files && files.metadata;

            const [blobsFailure, filesFailure] = [!(blobsMetaData && blobsMetaData.success), !(filesMetaData && filesMetaData.success)];

            let blobData = [];
            let filesData = [];
            const errorSchema: StorageContainerErrorSchema = initializeStorageContainerErrorSchemaValue();

            if (blobsFailure && supportsBlobStorage) {
              portalContext.log({
                action: 'getStorageContainers',
                actionModifier: 'failed',
                resourceId: site?.id ?? '',
                logLevel: 'error',
                data: {
                  error: blobsMetaData?.error,
                  message: 'Failed to fetch storage containers',
                },
              });
              errorSchema.blobsContainerIsEmpty = true;
              errorSchema.getBlobsFailure = true;
            } else {
              blobData = blobs.data.value || [];
              errorSchema.blobsContainerIsEmpty = blobData.length === 0;
            }

            if (filesFailure) {
              portalContext.log({
                action: 'getStorageFileShares',
                actionModifier: 'failed',
                resourceId: site?.id ?? '',
                logLevel: 'error',
                data: {
                  error: filesMetaData?.error,
                  message: 'Failed to fetch storage file shares',
                },
              });
              errorSchema.filesContainerIsEmpty = true;
              errorSchema.getFilesFailure = true;
            } else {
              filesData = (files.data.value || []).filter(
                file => file.properties.enabledProtocols.toLocaleLowerCase() === FileShareEnabledProtocols.SMB.toLocaleLowerCase()
              );
              errorSchema.filesContainerIsEmpty = filesData.length === 0;
            }

            setSharesLoading(false);
            setAccountSharesFiles(filesData);
            setAccountSharesBlob(blobData);
            setStorageContainerErrorSchema(errorSchema);
            if (!supportsBlobStorage) {
              setFieldValue('type', StorageType.azureFiles);
            }
          } catch (err) {
            setAccountError(t('noWriteAccessStorageAccount'));
          }
        })
        .catch(() => {
          setAccountError(t('noWriteAccessStorageAccount'));
        });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.accountName]);

  useEffect(() => {
    validateForm();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountError]);

  useEffect(() => {
    updateStorageContainerErrorMessage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.type, storageContainerErrorSchema]);

  const blobContainerOptions = accountSharesBlob.map((x: any) => ({ key: x.name, text: x.name }));
  const filesContainerOptions = accountSharesFiles.map((x: any) => ({ key: x.name, text: x.name }));

  const showStorageTypeOption = supportsBlobStorage && (!storageAccount || storageAccount.kind !== storageKinds.BlobStorage);

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
        infoBubbleMessage={t('byos_storageAccountInfoMessage')}
        learnMoreLink={Links.byosStorageAccountLearnMore}
        required={true}
      />
      {showStorageTypeOption && (
        <Field
          component={RadioButton}
          name="type"
          id="azure-storage-mounts-name"
          label={t('storageType')}
          options={[
            {
              key: StorageType.azureBlob,
              text: t('azureBlob'),
            },
            {
              key: StorageType.azureFiles,
              text: t('azureFiles'),
            },
          ]}
        />
      )}
      {values.type === StorageType.azureBlob && supportsBlobStorage && (
        <CustomBanner
          id="azure-storage-mount-blob-warning"
          message={t('readonlyBlobStorageWarning')}
          learnMoreLink={Links.byosBlobReadonlyLearnMore}
          type={MessageBarType.info}
          undocked={true}
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
        validate={(value: any) => {
          return validateStorageContainer(value);
        }}
        infoBubbleMessage={fileShareInfoBubbleMessage}
        errorMessage={errors.shareName}
        required={true}
      />
    </>
  );
};

export default AzureStorageMountsAddEditBasic;
