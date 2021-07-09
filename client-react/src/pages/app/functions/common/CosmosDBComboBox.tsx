import React, { useState, useEffect } from 'react';
import ComboBox from '../../../../components/form-controls/ComboBox';
import { IComboBoxOption, Link, PrimaryButton, DefaultButton, Stack, Callout } from 'office-ui-fabric-react';
import DocumentDBService from '../../../../ApiHelpers/DocumentDBService';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';
import { CreateFunctionFormValues } from './CreateFunctionFormBuilder';
import { FormikProps, Formik, Form, Field, FormikValues } from 'formik';
import { calloutStyleField, linkPaddingStyle } from './callout/Callout.styles';
import TextField from '../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import { CommonConstants } from '../../../../utils/CommonConstants';

interface CreateDatabaseFormValues {
  databaseName: string;
}

interface CreateContainerFormValues {
  containerName: string;
}

export const removeCurrentDatabaseArmTemplate = (armResources, setArmResources, setStoredArmTemplate: any = null) => {
  // Find and, if found, remove the template
  let modifiableArmResources = armResources;
  armResources.forEach((armRsc, index) => {
    if (armRsc.type.toLowerCase().includes('databases') && armRsc.name.split('/').length === 2) {
      if (!!setStoredArmTemplate) {
        setStoredArmTemplate(armResources[index]);
      }
      modifiableArmResources.splice(index, 1);
      setArmResources(modifiableArmResources);
    }
  });
};

export const removeCurrentContainerArmTemplate = (armResources, setArmResources, setStoredArmTemplate: any = null) => {
  // Find and, if found, remove the template
  let modifiableArmResources = armResources;
  armResources.forEach((armRsc, index) => {
    if (armRsc.type.toLowerCase().includes('containers') || armRsc.type.toLowerCase().includes('collections')) {
      if (!!setStoredArmTemplate) {
        setStoredArmTemplate(armResources[index]);
      }
      modifiableArmResources.splice(index, 1);
      setArmResources(modifiableArmResources);
    }
  });
};

const CosmosDBComboBox = props => {
  const { setting, resourceId, form: formProps, field, isDisabled, setArmResources, armResources } = props;
  const [databases, setDatabases] = useState<any>(undefined);
  const [newDatabaseName, setNewDatabaseName] = useState<string | undefined>(undefined);
  const [containers, setContainers] = useState<any>(undefined);
  const [newContainerName, setNewContainerName] = useState<string | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<IComboBoxOption | undefined>(undefined);
  const [storedArmTemplate, setStoredArmTemplate] = useState<any>(undefined);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const { t } = useTranslation();

  // If new DB account, automatically set new database/container
  useEffect(() => {
    if (formProps.status && formProps.status.isNewDbAcct) {
      setNewDatabaseName(undefined);
      setNewContainerName(undefined);
    }
  }, [formProps.status.isNewDbAcct]);

  useEffect(() => {
    const dbAcctName = formProps.values.connectionStringSetting.split('_')[0];
    const dbAcctType = formProps.status.dbAcctType;

    if (isDatabase()) {
      if (formProps.status && formProps.status.isNewDbAcct) {
        setDatabases(undefined);
        return;
      }

      DocumentDBService.fetchDatabases(resourceId, dbAcctName, dbAcctType).then(r => {
        if (!r.metadata.success) {
          LogService.error(
            LogCategories.bindingResource,
            'getCDbDatabases',
            `Failed to get Cosmos DB databases: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
          return;
        }
        setDatabases(r.data.value.length === 0 ? undefined : r.data.value);

        if (r.data.value.length === 0) {
          formProps.setStatus({ ...formProps.status, isNewDatabase: true, isNewContainer: true });
          formProps.setFieldValue('databaseName', CommonConstants.CosmosDbDefaults.databaseName);
          formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);

          removeCurrentDatabaseArmTemplate(armResources, setArmResources);
          removeCurrentContainerArmTemplate(armResources, setArmResources);
          const newDatabaseTemplate = DocumentDBService.getNewDatabaseArmTemplate(
            CommonConstants.CosmosDbDefaults.databaseName,
            formProps,
            armResources
          );
          const newContainerTemplate = DocumentDBService.getNewContainerArmTemplate(
            CommonConstants.CosmosDbDefaults.containerName,
            formProps,
            armResources,
            undefined,
            CommonConstants.CosmosDbDefaults.databaseName
          );

          setArmResources(prevArmResources => [...prevArmResources, newDatabaseTemplate, newContainerTemplate]);
        } else {
          formProps.setStatus({ ...formProps.status, isNewDatabase: false, isNewContainer: false });
          formProps.setFieldValue('databaseName', '');
          formProps.setFieldValue('collectionName', '');
          removeCurrentDatabaseArmTemplate(armResources, setArmResources);
          removeCurrentContainerArmTemplate(armResources, setArmResources);
        }
      });
    }
  }, [formProps.values.connectionStringSetting, formProps.status.isNewDbAcct]);

  // Anytime database value updates, either set containers as empty (if db is new) or fetch existing ones
  useEffect(() => {
    const dbAcctName = formProps.values.connectionStringSetting.split('_')[0];
    const dbAcctType = formProps.status.dbAcctType;

    if (isContainer()) {
      if (formProps.status && formProps.status.isNewDatabase) {
        setContainers(undefined);
        return;
      }

      DocumentDBService.fetchContainers(resourceId, dbAcctName, dbAcctType, formProps.values.databaseName).then(r => {
        if (!r.metadata.success) {
          LogService.error(
            LogCategories.bindingResource,
            'getCDbContainers',
            `Failed to get Cosmos DB containers: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
          return;
        }
        setContainers(r.data.value.length === 0 ? undefined : r.data.value);

        if (r.data.value.length === 0) {
          formProps.setStatus({ ...formProps.status, isNewContainer: true });
          formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);

          removeCurrentContainerArmTemplate(armResources, setArmResources);
          const newContainerTemplate = DocumentDBService.getNewContainerArmTemplate(
            CommonConstants.CosmosDbDefaults.containerName,
            formProps,
            armResources,
            undefined,
            CommonConstants.CosmosDbDefaults.databaseName
          );

          setArmResources(prevArmResources => [...prevArmResources, newContainerTemplate]);
        } else {
          formProps.setStatus({ ...formProps.status, isNewContainer: false });
          formProps.setFieldValue('collectionName', '');
          removeCurrentContainerArmTemplate(armResources, setArmResources);
        }
      });
    }
  }, [formProps.values.databaseName, formProps.status.isNewDatabase]);

  // Set the partitionKeyPath in the container template
  useEffect(() => {
    if (formProps.status && formProps.status.dbAcctType !== CommonConstants.CosmosDbTypes.globalDocumentDb) return;

    let updatedPkpValue: string = formProps.values.partitionKeyPath;
    if (updatedPkpValue[0] !== '/') {
      updatedPkpValue = `/${updatedPkpValue}`;
      formProps.setFieldValue('partitionKeyPath', updatedPkpValue);
    }

    // Find the container template, and set partitionKeyPath from current pkp value
    let modifiableArmResources = armResources;
    armResources.forEach((armRsc, index) => {
      // We don't search for 'collections' too here because we don't set this for MongoDB
      if (!!armRsc.type && armRsc.type.toLowerCase().includes('containers')) {
        if (!!armRsc.properties.resource.partitionKey) {
          modifiableArmResources[index].properties.resource.partitionKey.paths = [updatedPkpValue];
          setArmResources(modifiableArmResources);
        }
      }
    });
  }, [formProps.values.partitionKeyPath]);

  const isDatabase = () => setting.name === 'databaseName';
  const isContainer = () => setting.name === 'collectionName';

  const onChange = (
    option: IComboBoxOption | undefined,
    customValue: string | undefined,
    formProps: FormikProps<CreateFunctionFormValues>,
    field: { name: string; value: any }
  ) => {
    if (option) {
      const dbOrContName = option.key as string;
      formProps.setFieldValue(field.name, dbOrContName);

      if (
        !selectedItem &&
        formProps.status &&
        ((isDatabase() && formProps.status.isNewDatabase) || (isContainer() && formProps.status.isNewContainer))
      ) {
        // Find & store into storedArmTemplate, then delete template from armResources
        if (isDatabase()) {
          removeCurrentContainerArmTemplate(armResources, setArmResources);
          formProps.setStatus({ ...formProps.status, isNewDatabase: false, isNewContainer: false });
          formProps.setFieldValue('collectionName', '');
          let modifiableArmResources = armResources;

          armResources.forEach((armRsc, index) => {
            if (armRsc.type.toLowerCase().includes('databases') && armRsc.name.split('/').length === 2) {
              setStoredArmTemplate(armResources[index]);
              modifiableArmResources.splice(index, 1);
              setArmResources(modifiableArmResources);
            }
          });
        } else if (isContainer()) {
          formProps.setStatus({ ...formProps.status, isNewContainer: false });
          let modifiableArmResources = armResources;

          armResources.forEach((armRsc, index) => {
            if (armRsc.type.toLowerCase().includes('containers') || armRsc.type.toLowerCase().includes('collections')) {
              setStoredArmTemplate(armResources[index]);
              modifiableArmResources.splice(index, 1);
              setArmResources(modifiableArmResources);
            }
          });
        }
      } else if (option.text.includes('(new)')) {
        // If template already in armResources (should mean user generated new one) don't do anything, otherwise reinstate storedArmTemplate to armResources
        let isTemplateFound = false;

        if (isDatabase()) {
          formProps.setStatus({ ...formProps.status, isNewDatabase: true, isNewContainer: true });
          formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);

          removeCurrentContainerArmTemplate(armResources, setArmResources);
          const newContainerTemplate = DocumentDBService.getNewContainerArmTemplate(
            CommonConstants.CosmosDbDefaults.containerName,
            formProps,
            armResources,
            undefined,
            option.key as string
          );

          armResources.forEach((armRsc, index) => {
            if (armRsc.type.toLowerCase().includes('databases') && armRsc.name.split('/').length === 2) {
              isTemplateFound = true;
            }
          });

          if (!isTemplateFound && !!storedArmTemplate) {
            setArmResources([...armResources, storedArmTemplate, newContainerTemplate]);
          }
        } else if (isContainer()) {
          formProps.setStatus({ ...formProps.status, isNewContainer: true });

          armResources.forEach((armRsc, index) => {
            if (armRsc.type.toLowerCase().includes('containers') || armRsc.type.toLowerCase().includes('collections')) {
              isTemplateFound = true;
            }
          });

          if (!isTemplateFound && !!storedArmTemplate) {
            setArmResources([...armResources, storedArmTemplate]);
          }
        }
      }
    }
  };

  const onTextFieldChange = (
    value: string | undefined,
    formProps: FormikProps<CreateFunctionFormValues>,
    field: { name: string; value: any }
  ) => {
    if (!value) return;

    // Generate a new template each time value is changed (this is similar to fusion-controls functionality)
    if (isDatabase()) {
      formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);
      removeCurrentDatabaseArmTemplate(armResources, setArmResources, setStoredArmTemplate);
      removeCurrentContainerArmTemplate(armResources, setArmResources);
      const databaseArmTemplate = DocumentDBService.getNewDatabaseArmTemplate(value, formProps, armResources);
      const containerArmTemplate = DocumentDBService.getNewContainerArmTemplate(
        CommonConstants.CosmosDbDefaults.containerName,
        formProps,
        armResources,
        undefined,
        value
      );

      setArmResources([...armResources, databaseArmTemplate, containerArmTemplate]);
    } else if (isContainer()) {
      removeCurrentContainerArmTemplate(armResources, setArmResources, setStoredArmTemplate);
      const containerArmTemplate = DocumentDBService.getNewContainerArmTemplate(value, formProps, armResources);
      setArmResources([...armResources, containerArmTemplate]);

      // Set PKP value back to default (/id) so that we don't accidentally NOT set it in the template
      // (user is forced to change it thereby applying the new partitionKeyPath)
      formProps.setFieldValue('partitionKeyPath', CommonConstants.CosmosDbDefaults.partitionKeyPath);
    }

    formProps.setFieldValue(field.name, value);
  };

  const getDatabasesOrContainers = (): IComboBoxOption[] => {
    if (isDatabase()) {
      const result: IComboBoxOption[] = newDatabaseName ? [{ key: newDatabaseName, text: `(new) ${newDatabaseName}` }] : [];

      if (databases) {
        databases.forEach(database => {
          result.push({ key: database.name, text: database.name });
        });
      }

      return result;
    } else if (isContainer()) {
      const result: IComboBoxOption[] = newContainerName ? [{ key: newContainerName, text: `(new) ${newContainerName}` }] : [];

      if (containers) {
        containers.forEach(container => {
          result.push({ key: container.name, text: container.name });
        });
      }

      return result;
    } else {
      return [];
    }
  };

  const handleCalloutSubmit = (formValues: FormikValues) => {
    setIsDialogVisible(false);
    if (isDatabase()) {
      setSelectedItem({ key: formValues.newDatabaseName, text: formValues.newDatabaseName });
      setNewDatabaseName(formValues.newDatabaseName);
      formProps.setStatus({ ...formProps.status, isNewDatabase: true });

      removeCurrentDatabaseArmTemplate(armResources, setArmResources, setStoredArmTemplate);
      removeCurrentContainerArmTemplate(armResources, setArmResources);
      const newDatabaseTemplate = DocumentDBService.getNewDatabaseArmTemplate(formValues.newDatabaseName, formProps, armResources);
      const newContainerTemplate = DocumentDBService.getNewContainerArmTemplate(
        CommonConstants.CosmosDbDefaults.containerName,
        formProps,
        armResources,
        undefined,
        formValues.newDatabaseName
      );
      formProps.setStatus({ ...formProps.status, isNewDatabase: true, isNewContainer: true });
      formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);

      setArmResources([...armResources, newDatabaseTemplate, newContainerTemplate]);
    } else if (isContainer()) {
      setSelectedItem({ key: formValues.newContainerName, text: formValues.newContainerName });
      setNewContainerName(formValues.newContainerName);
      formProps.setStatus({ ...formProps.status, isNewContainer: true });

      removeCurrentContainerArmTemplate(armResources, setArmResources, setStoredArmTemplate);
      const newContainerTemplate = DocumentDBService.getNewContainerArmTemplate(formValues.newContainerName, formProps, armResources);
      setArmResources([...armResources, newContainerTemplate]);
    }
  };

  const validateDatabaseOrContainerName = (value: string) => {
    let error: string | undefined;
    if (!value) {
      error = t('fieldRequired');
      return error;
    }

    // Validate against existing databases/containers
    if (isDatabase() && !!databases) {
      databases.forEach(database => {
        if (value === database.name) {
          error = t('databaseAlreadyExists');
        }
      });
    } else if (isContainer() && !!containers) {
      containers.forEach(container => {
        if (value === container.name) {
          error = t('containerAlreadyExists');
        }
      });
    }

    // Regex validation: no special characters && no space(s) at end
    if (!value.match('^[^/\\\\#?]+$')) {
      error = isDatabase() ? t('databaseNameCharacters') : t('containerNameCharacters');
    } else if (!value.match('[^\\s]+$')) {
      error = isDatabase() ? t('databaseNameSpace') : t('containerNameSpace');
    }

    return error;
  };

  const options = getDatabasesOrContainers();

  // Set the value when coming back from the callout
  if (selectedItem) {
    onChange(selectedItem, undefined, formProps, field);
    setSelectedItem(undefined);
  }

  let placeholder: string | undefined = undefined;
  if (isDatabase()) {
    if (databases) {
      placeholder = t('selectADatabase');
    }
  } else if (isContainer()) {
    if (containers) {
      placeholder = t('selectAContainer');
    }
  }

  return (
    <>
      {(isDatabase() && !formProps.status.isNewDbAcct && !!databases) ||
      (isContainer() && !formProps.status.isNewDatabase && !!containers) ? (
        <>
          <ComboBox
            allowFreeform={false}
            onChange={(_e, option, index, customValue) => onChange(option, customValue, formProps, field)}
            autoComplete="on"
            options={options}
            {...props}
            placeholder={placeholder}
          />

          {!isDisabled ? (
            <div style={linkPaddingStyle}>
              <Link id={isDatabase() ? 'dbComboBoxLink' : 'contComboBoxLink'} onClick={() => setIsDialogVisible(true)}>
                {isDatabase() ? t('createADatabase') : t('createAContainer')}
              </Link>

              <Callout
                onDismiss={() => setIsDialogVisible(false)}
                target={isDatabase() ? '#dbComboBoxLink' : '#contComboBoxLink'}
                hidden={!isDialogVisible}
                style={calloutStyleField}>
                <h3>{isDatabase() ? t('createADatabase') : t('createAContainer')}</h3>

                <Formik initialValues={isDatabase() ? { databaseName: '' } : { containerName: '' }} onSubmit={handleCalloutSubmit}>
                  {(formProps: FormikProps<CreateDatabaseFormValues | CreateContainerFormValues>) => (
                    <Form>
                      <Field
                        name={isDatabase() ? 'newDatabaseName' : 'newContainerName'}
                        id={isDatabase() ? 'newDatabaseName' : 'newContainerName'}
                        component={TextField}
                        required
                        validate={validateDatabaseOrContainerName}
                      />

                      <Stack horizontal verticalAlign="center" /*className={}*/>
                        <PrimaryButton
                          //className={buttonStyle(theme, true)}
                          onClick={formProps.submitForm}
                          disabled={Object.keys(formProps.errors).length > 0}
                          //styles={primaryButtonStyle(theme)}
                        >
                          {t('create')}
                        </PrimaryButton>

                        <DefaultButton /*className={buttonStyle(theme, false)}*/ onClick={() => setIsDialogVisible(false)}>
                          {t('cancel')}
                        </DefaultButton>
                      </Stack>
                    </Form>
                  )}
                </Formik>
              </Callout>
            </div>
          ) : (
            undefined
          )}
        </>
      ) : (
        <TextField {...props} onChange={(e, value) => onTextFieldChange(value, formProps, field)} />
      )}
    </>
  );
};

export default CosmosDBComboBox;
