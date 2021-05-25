import React, { useEffect, useState, useContext } from 'react';
import { FormAzureStorageMounts } from '../AppSettings.types';
import { AzureStorageMountsAddEditPropsCombined } from './AzureStorageMountsAddEdit';
import MakeArmCall, { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';
import { formElementStyle } from '../AppSettings.styles';
import { FormikProps, Field } from 'formik';
import ComboBox from '../../../../components/form-controls/ComboBox';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { useTranslation } from 'react-i18next';
import { StorageAccountsContext, SiteContext } from '../Contexts';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { MessageBarType } from 'office-ui-fabric-react';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { Links } from '../../../../utils/FwLinks';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { HttpConstants } from '../../../../utils/constants/HttpConstants';
import { StorageType } from '../../../../models/site/config';

const storageKinds = {
  StorageV2: 'StorageV2',
  BlobStorage: 'BlobStorage',
  Storage: 'Storage',
};

class StorageContainerErrorSchema {
  public blobsContainerIsEmpty: boolean;
  public filesContainerIsEmpty: boolean;
  public getBlobsFailure: boolean;
  public getFilesFailure: boolean;
  public isVnetRestrictionError: boolean;
}

const AzureStorageMountsAddEditBasic: React.FC<FormikProps<FormAzureStorageMounts> & AzureStorageMountsAddEditPropsCombined> = props => {
  const { errors, values, setValues, setFieldValue, validateForm } = props;
  const [accountSharesFiles, setAccountSharesFiles] = useState([]);
  const [accountSharesBlob, setAccountSharesBlob] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [storageContainerErrorSchema, setStorageContainerErrorSchema] = useState<StorageContainerErrorSchema>(
    new StorageContainerErrorSchema()
  );
  const storageAccounts = useContext(StorageAccountsContext);
  const site = useContext(SiteContext);
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);

  const supportsBlobStorage = scenarioService.checkScenario(ScenarioIds.azureBlobMount, { site }).status !== 'disabled';
  const accountOptions = storageAccounts.value
    .filter(val => supportsBlobStorage || val.kind !== storageKinds.BlobStorage)
    .map(val => ({ key: val.name, text: val.name }));

  const validateStorageContainer = (value: string): string | undefined => {
    const emptyListError = validateNoStorageContainerAvailable();
    const notSelectedError = validateNoStorageContainerSelected(value);
    const error = emptyListError ? emptyListError : notSelectedError;
    return error;
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
    if (accountError) {
      return accountError;
    }
    return undefined;
  };

  const storageAccount = storageAccounts.value.find(x => x.name === values.accountName);

  useEffect(() => {
    setAccountError('');
    setStorageContainerErrorSchema(new StorageContainerErrorSchema());
    if (storageAccount) {
      setAccountSharesBlob([]);
      setAccountSharesFiles([]);
      setSharesLoading(true);
      MakeArmCall({ resourceId: `${storageAccount.id}/listKeys`, commandName: 'listStorageKeys', method: 'POST' })
        .then(async ({ data }: any) => {
          const setAccessKey = (accessKey: string) => {
            setValues({ ...values, accessKey });
          };

          setAccessKey(data.keys[0].value);
          const payload = {
            accountName: values.accountName,
            accessKey: data.keys[0].value,
          };
          try {
            let blobsCall: any = {
              data: [],
            };

            if (supportsBlobStorage) {
              blobsCall = FunctionsService.getStorageContainers(values.accountName, payload);
            }

            let filesCall: any = {
              data: [],
            };

            if (storageAccount.kind !== storageKinds.BlobStorage) {
              filesCall = FunctionsService.getStorageFileShares(values.accountName, payload);
            }

            const [blobs, files] = await Promise.all([blobsCall, filesCall]);

            // add null check on blobs.metadata and files.metadata
            const blobsMetaData = blobs && blobs.metadata;
            const filesMetaData = files && files.metadata;

            const [blobsFailure, filesFailure] = [!(blobsMetaData && blobsMetaData.success), !(filesMetaData && filesMetaData.success)];

            let blobData = [];
            let filesData = [];
            const errorSchema: StorageContainerErrorSchema = new StorageContainerErrorSchema();

            if (blobsFailure && supportsBlobStorage) {
              const errorMessage = getErrorMessageOrStringify(!!blobsMetaData && !!blobsMetaData.error ? blobsMetaData.error : '');
              LogService.error(LogCategories.appSettings, 'getStorageContainers', `Failed to get storage containers: ${errorMessage}`);
              errorSchema.blobsContainerIsEmpty = true;
              errorSchema.getBlobsFailure = true;
              if (errorMessage.toLocaleLowerCase() === HttpConstants.statusCodeMap['500'].toLocaleLowerCase()) {
                errorSchema.isVnetRestrictionError = true;
              }
            } else {
              blobData = blobs.data || [];
              errorSchema.blobsContainerIsEmpty = blobData.length === 0;
            }

            if (filesFailure) {
              const errorMessage = getErrorMessageOrStringify(!!filesMetaData && !!filesMetaData.error ? filesMetaData.error : '');
              LogService.error(LogCategories.appSettings, 'getStorageFileShares', `Failed to get storage file shares: ${errorMessage}`);
              errorSchema.filesContainerIsEmpty = true;
              errorSchema.getFilesFailure = true;
              if (errorMessage.toLocaleLowerCase() === HttpConstants.statusCodeMap['500'].toLocaleLowerCase()) {
                errorSchema.isVnetRestrictionError = true;
              }
            } else {
              filesData = files.data || [];
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
  }, [accountError]);

  useEffect(() => {
    const storageType = values.type;
    const blobsContainerIsEmpty = storageContainerErrorSchema.blobsContainerIsEmpty;
    const filesContainerIsEmpty = storageContainerErrorSchema.filesContainerIsEmpty;
    const isVnetRestrictionError = storageContainerErrorSchema.isVnetRestrictionError;
    const getBlobsFailure = storageContainerErrorSchema.getBlobsFailure;
    const getFilesFailure = storageContainerErrorSchema.getFilesFailure;
    if (storageType === StorageType.azureBlob && blobsContainerIsEmpty) {
      setAccountError(
        getBlobsFailure ? (isVnetRestrictionError ? `${t('blobsFailure')} ${t('switchToAdvancedMode')}` : t('blobsFailure')) : t('noBlobs')
      );
    } else if (storageType === StorageType.azureFiles && filesContainerIsEmpty) {
      setAccountError(
        getFilesFailure
          ? isVnetRestrictionError
            ? `${t('fileSharesFailure')} ${t('switchToAdvancedMode')}`
            : t('fileSharesFailure')
          : t('noFileShares')
      );
    } else {
      setAccountError('');
    }
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
          type={MessageBarType.warning}
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
        errorMessage={errors.shareName}
        required={true}
      />
    </>
  );
};

export default AzureStorageMountsAddEditBasic;
