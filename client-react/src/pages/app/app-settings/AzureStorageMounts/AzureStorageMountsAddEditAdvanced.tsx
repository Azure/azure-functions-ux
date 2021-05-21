import React, { useContext } from 'react';
import { AzureStorageMountsAddEditPropsCombined } from './AzureStorageMountsAddEdit';
import { FormikProps, Field } from 'formik';
import { FormAzureStorageMounts } from '../AppSettings.types';
import TextField from '../../../../components/form-controls/TextField';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { useTranslation } from 'react-i18next';
import { StorageType } from '../../../../models/site/config';
import { MessageBarType } from 'office-ui-fabric-react';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { Links } from '../../../../utils/FwLinks';
import { SiteContext } from '../Contexts';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';

const AzureStorageMountsAddEditAdvanced: React.FC<FormikProps<FormAzureStorageMounts> & AzureStorageMountsAddEditPropsCombined> = props => {
  const { errors, values } = props;
  const { t } = useTranslation();
  const site = useContext(SiteContext);
  const scenarioService = new ScenarioService(t);

  const showWarningBanner = scenarioService.checkScenario(ScenarioIds.showAzureStorageMountWarningBanner, { site }).status === 'enabled';

  return (
    <>
      <Field
        component={TextField}
        name="accountName"
        label={t('storageAccounts')}
        id="azure-storage-mounts-account-name"
        errorMessage={errors.accountName}
        required={true}
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
          },
          {
            key: 'AzureFiles',
            text: t('azureFiles'),
          },
        ]}
      />
      {values.type === StorageType.azureBlob && showWarningBanner && (
        <CustomBanner
          id="azure-storage-mount-blob-warning"
          message={t('readonlyBlobStorageWarning')}
          learnMoreLink={Links.byosBlobReadonlyLearnMore}
          type={MessageBarType.warning}
          undocked={true}
        />
      )}
      <Field
        component={TextField}
        name="shareName"
        label={t('shareName')}
        id="azure-storage-mounts-share-name"
        errorMessage={errors.shareName}
        required={true}
      />
      <Field
        component={TextField}
        name="accessKey"
        label={t('accessKey')}
        id="azure-storage-mounts-access-key"
        multiline
        rows={4}
        errorMessage={errors.accessKey}
        required={true}
      />
    </>
  );
};

export default AzureStorageMountsAddEditAdvanced;
