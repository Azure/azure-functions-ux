import { Link } from '@fluentui/react';
import { Formik, FormikProps } from 'formik';
import { useCallback, useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PortalContext } from '../../../../../PortalContext';
import { IArmResourceTemplate, TSetArmResourceTemplates } from '../../../../../utils/ArmTemplateHelper';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import {
  getNewContainerArmTemplate,
  getNewDatabaseArmTemplate,
  removeCurrentContainerArmTemplate,
  removeCurrentDatabaseAccountArmTemplate,
  removeCurrentDatabaseArmTemplate,
} from '../../../../../utils/CosmosDbArmTemplateHelper';
import BindingCalloutContent from '../callout-content/BindingCalloutContent';
import { CosmosDbCreator, CreateCosmosDbFormValues } from '../callout-content/documentdb/CosmosDbCreator';
import { getTelemetryInfo } from '../FunctionsUtility';

interface SelectedItem {
  data: string;
  key: string;
  text: string;
}

interface NewCosmosDBAccountCalloutProps {
  armResources: IArmResourceTemplate[];
  form: FormikProps<unknown>;
  resourceId: string;
  setArmResources: TSetArmResourceTemplates;
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setNewDatabaseAccountName: React.Dispatch<React.SetStateAction<string>>;
  setNewDbAcctType: React.Dispatch<React.SetStateAction<string>>;
  setSelectedItem: React.Dispatch<React.SetStateAction<SelectedItem>>;
}

const NewCosmosDbAccountCallout: React.FC<NewCosmosDBAccountCalloutProps> = (props: NewCosmosDBAccountCalloutProps) => {
  const {
    armResources,
    form: formProps,
    setArmResources,
    setIsDialogVisible,
    setNewDatabaseAccountName,
    setNewDbAcctType,
    setSelectedItem,
  } = props;
  const [cosmosDbTemplate, setCosmosDbTemplate] = useState('');
  const formRef = useRef<Formik>(null);
  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);

  const initialValues: CreateCosmosDbFormValues = {
    accountName: '',
  };

  const handleCreate = useCallback(() => {
    const cdbTemplateObj = JSON.parse(cosmosDbTemplate);
    setNewDatabaseAccountName(cdbTemplateObj.name);
    setNewDbAcctType(cdbTemplateObj.kind);
    setSelectedItem({ key: `${cdbTemplateObj.name}_COSMOSDB`, text: cdbTemplateObj.name, data: cdbTemplateObj.kind });

    if (setArmResources) {
      formProps.setStatus({ ...formProps.status, isNewDbAcct: true, isNewDatabase: true, isNewContainer: true });
      formProps.setFieldValue('databaseName', CommonConstants.CosmosDbDefaults.databaseName);
      formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);

      removeCurrentDatabaseAccountArmTemplate(armResources, setArmResources);
      removeCurrentDatabaseArmTemplate(armResources, setArmResources);
      removeCurrentContainerArmTemplate(armResources, setArmResources);

      const databaseAccountName = cdbTemplateObj.name;
      const databaseName = CommonConstants.CosmosDbDefaults.databaseName;
      setArmResources(prevArmResources => [
        ...prevArmResources,
        cdbTemplateObj,
        getNewDatabaseArmTemplate(databaseName, armResources, databaseAccountName),
        getNewContainerArmTemplate(CommonConstants.CosmosDbDefaults.containerName, armResources, databaseAccountName, databaseName),
      ]);
    }

    setIsDialogVisible(false);

    portalCommunicator.log(getTelemetryInfo('info', 'cosmos-db-database-account', 'create'));
  }, [
    armResources,
    cosmosDbTemplate,
    formProps,
    portalCommunicator,
    setArmResources,
    setIsDialogVisible,
    setNewDatabaseAccountName,
    setNewDbAcctType,
    setSelectedItem,
  ]);

  const handleCancel = useCallback(() => {
    setIsDialogVisible(false);

    formRef.current?.resetForm();

    portalCommunicator.log(getTelemetryInfo('info', 'cosmos-db-database-account', 'cancel'));
  }, [portalCommunicator, setIsDialogVisible]);

  return (
    <BindingCalloutContent
      description={
        <>
          <span>{t('cosmosDb_newAccountDialog_description')}</span>
          <Link href="https://aka.ms/AAd5pzp" target="_blank" rel="noopener noreferrer">
            {t('cosmosDb_newAccountDialog_link')}
          </Link>
        </>
      }
      formRef={formRef}
      header={t('cosmosDb_newAccountDialog_title')}
      initialValues={initialValues}
      onCancel={handleCancel}
      onCreate={handleCreate}
      onRenderCreator={(formProps: FormikProps<CreateCosmosDbFormValues>) => (
        <CosmosDbCreator formProps={formProps} setTemplate={setCosmosDbTemplate} template={cosmosDbTemplate} />
      )}
    />
  );
};

export default NewCosmosDbAccountCallout;
