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

// TODO: CommonConstants all necessary stuff in here (setting names, CosmosDB account types)
// TODO: Handle 'resource does not exist' error for database/container fetch a little more nicely (big error in console)

interface CreateDatabaseFormValues {
  databaseName: string;
}

interface CreateContainerFormValues {
  containerName: string;
}

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
      formProps.setFieldValue('databaseName', 'CosmosDatabase');
      formProps.setFieldValue('collectionName', 'CosmosContainer');

      formProps.setStatus({ ...formProps.status, isNewDatabase: true, isNewContainer: true });
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
        setDatabases(r.data.value);
      });
    }
  }, [formProps.values.connectionStringSetting, formProps.status.isNewDbAcct]);

  // If new database, set new container
  useEffect(() => {
    if (formProps.status && formProps.status.isNewDatabase) {
      formProps.setFieldValue('collectionName', 'CosmosContainer');
      formProps.setStatus({ ...formProps.status, isNewContainer: true });
      setNewContainerName(undefined);
    }
  }, [formProps.status.isNewDatabase]);

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
        setContainers(r.data.value);
      });
    }
  }, [formProps.values.databaseName, formProps.status.isNewDatabase]);

  // Set the partitionKeyPath in the container template
  useEffect(() => {
    if (formProps.status && formProps.status.dbAcctType !== 'GlobalDocumentDB') return;

    // Find the container template, and set partitionKeyPath from current pkp value
    let modifiableArmResources = armResources;
    armResources.forEach((armRsc, index) => {
      // We don't search for 'collections' too here because we don't set this for MongoDB
      if (!!armRsc.type && armRsc.type.toLowerCase().includes('containers')) {
        if (!!armRsc.properties.resource.partitionKey) {
          modifiableArmResources[index].properties.resource.partitionKey.paths = [formProps.values.partitionKeyPath];
          setArmResources(modifiableArmResources);
        }
      }
    });
  }, [formProps.values.partitionKeyPath]);

  // If dbAcct changes (causing database name change), update database
  useEffect(() => {
    // Had to set this as the arm templates wouldn't generate on load otherwise
    if (isDatabase() && formProps.values.databaseName === 'CosmosDatabase') {
      console.log('Should generate DB template');
      setArmResources(prevRscs => [...prevRscs, getNewDatabaseArmTemplate('CosmosDatabase')]);
    }
  }, [formProps.values.databaseName]);

  // If database changes, update container
  useEffect(() => {
    if (isContainer() && formProps.values.collectionName === 'CosmosContainer') {
      setArmResources(prevRscs => [...prevRscs, getNewContainerArmTemplate('CosmosContainer')]);
    }
  }, [formProps.values.databaseName]);

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

      if (!selectedItem) {
        // Find & store into storedArmTemplate, then delete template from armResources
        let modifiableArmResources = armResources;
        if (isDatabase()) {
          armResources.forEach((armRsc, index) => {
            if (armRsc.type.toLowerCase().includes('databases') && armRsc.name.split('/').length === 2) {
              setStoredArmTemplate(armResources[index]);
              modifiableArmResources.splice(index, 1);
              setArmResources(modifiableArmResources);
            }
          });
        } else {
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
          armResources.forEach((armRsc, index) => {
            if (armRsc.type.toLowerCase().includes('databases') && armRsc.name.split('/').length === 2) {
              isTemplateFound = true;
            }
          });
        } else {
          armResources.forEach((armRsc, index) => {
            if (armRsc.type.toLowerCase().includes('containers') || armRsc.type.toLowerCase().includes('collections')) {
              isTemplateFound = true;
            }
          });
        }

        if (isTemplateFound && !!storedArmTemplate) {
          setArmResources([...armResources, storedArmTemplate]);
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
      const databaseArmTemplate = getNewDatabaseArmTemplate(value);
      setArmResources([...armResources, databaseArmTemplate]);
    } else if (isContainer()) {
      const containerArmTemplate = getNewContainerArmTemplate(value);
      setArmResources([...armResources, containerArmTemplate]);

      // Set PKP value back to default (/id) so that we don't accidentally NOT set it in the template
      // (user is forced to change it thereby applying the new partitionKeyPath)
      formProps.setFieldValue('partitionKeyPath', '/id');
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

  const getNewDatabaseArmTemplate = (databaseName: string) => {
    const dbAcctName = formProps.values.connectionStringSetting.split('_')[0];

    // Make sure the template doesn't already exist (in case we go from creating one in the textfield to creating one through the callout)
    removeCurrentDatabaseArmTemplate();

    let databaseTemplate: any = {
      type: 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases',
      apiVersion: '2021-04-15',
      name: `${dbAcctName}/${databaseName}`,
      properties: {
        resource: {
          id: `${databaseName}`,
        },
      },
    };

    // Handle MongoDB CosmosDB stuff (in addition to SQL)
    if (formProps.status.dbAcctType === 'MongoDB') {
      databaseTemplate.type = 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases';
    }

    // If we're creating a new DB account, make sure to dependsOn it
    armResources.forEach(rsc => {
      if (rsc.type === 'Microsoft.DocumentDB/databaseAccounts') {
        databaseTemplate.dependsOn = [`[resourceId('Microsoft.DocumentDB/databaseAccounts', '${dbAcctName}')]`];
        return;
      }
    });

    return databaseTemplate;
  };

  const removeCurrentDatabaseArmTemplate = () => {
    // Find and, if found, remove the template
    let modifiableArmResources = armResources;
    armResources.forEach((armRsc, index) => {
      if (armRsc.type.toLowerCase().includes('databases') && armRsc.name.split('/').length === 2) {
        setStoredArmTemplate(armResources[index]);
        modifiableArmResources.splice(index, 1);
        setArmResources(modifiableArmResources);
      }
    });
  };

  const getNewContainerArmTemplate = (containerName: string) => {
    const dbAcctName = formProps.values.connectionStringSetting.split('_')[0];
    const databaseName = formProps.values.databaseName;

    // Make sure the template doesn't already exist (in case we go from creating one in the textfield to creating one through the callout)
    removeCurrentContainerArmTemplate();

    let containerTemplate: any = {
      type: 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers',
      apiVersion: '2021-04-15',
      name: `${dbAcctName}/${databaseName}/${containerName}`,
      properties: {
        resource: {
          id: `${containerName}`,
          partitionKey: {
            paths: ['/id'],
            kind: 'Hash',
          },
        },
      },
    };

    // If we're creating a new DB account and/or database, make sure to dependsOn it
    armResources.forEach(rsc => {
      if (rsc.type === 'Microsoft.DocumentDB/databaseAccounts') {
        containerTemplate.dependsOn = [
          `[resourceId('Microsoft.DocumentDB/databaseAccounts/sqlDatabases', '${dbAcctName}', '${databaseName}')]`,
        ];
        return;
      }
    });

    // Handle MongoDB CosmosDB stuff (in addition to SQL)
    if (formProps.status.dbAcctType === 'MongoDB') {
      containerTemplate.type = 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases/collections';
      delete containerTemplate.properties.resource.partitionKey;
      if (containerTemplate.dependsOn) {
        containerTemplate.dependsOn = [
          `[resourceId('Microsoft.DocumentDB/databaseAccounts/mongodbDatabases', '${dbAcctName}', '${databaseName}')`,
        ];
      }
    }

    return containerTemplate;
  };

  const removeCurrentContainerArmTemplate = () => {
    // Find and, if found, remove the template
    let modifiableArmResources = armResources;
    armResources.forEach((armRsc, index) => {
      if (armRsc.type.toLowerCase().includes('containers') || armRsc.type.toLowerCase().includes('collections')) {
        setStoredArmTemplate(armResources[index]);
        modifiableArmResources.splice(index, 1);
        setArmResources(modifiableArmResources);
      }
    });
  };

  const handleCalloutSubmit = (formValues: FormikValues) => {
    setIsDialogVisible(false);
    if (isDatabase()) {
      setSelectedItem({ key: formValues.newDatabaseName, text: formValues.newDatabaseName });
      setNewDatabaseName(formValues.newDatabaseName);
      formProps.setStatus({ ...formProps.status, isNewDatabase: true });

      setArmResources([...armResources, getNewDatabaseArmTemplate(formValues.newDatabaseName)]);
    } else if (isContainer()) {
      setSelectedItem({ key: formValues.newContainerName, text: formValues.newContainerName });
      setNewContainerName(formValues.newContainerName);
      formProps.setStatus({ ...formProps.status, isNewContainer: true });

      setArmResources([...armResources, getNewContainerArmTemplate(formValues.newContainerName)]);
    }
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
      placeholder = 'Select a database';
    }
  } else if (isContainer()) {
    if (containers) {
      placeholder = 'Select a container';
    }
  }

  return (
    <>
      {console.log(formProps.values)}
      {console.log(formProps.status)}
      {console.log(armResources)}
      {(isDatabase() && !formProps.status.isNewDbAcct) || (isContainer() && !formProps.status.isNewDatabase) ? (
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
                {isDatabase() ? 'Create a database' : 'Create a container'}
              </Link>

              <Callout
                onDismiss={() => setIsDialogVisible(false)}
                target={isDatabase() ? '#dbComboBoxLink' : '#contComboBoxLink'}
                hidden={!isDialogVisible}
                style={calloutStyleField}>
                <h3>{isDatabase() ? 'Create a database' : 'Create a container'}</h3>

                <Formik initialValues={isDatabase() ? { databaseName: '' } : { containerName: '' }} onSubmit={handleCalloutSubmit}>
                  {(formProps: FormikProps<CreateDatabaseFormValues | CreateContainerFormValues>) => (
                    <Form>
                      <Field
                        name={isDatabase() ? 'newDatabaseName' : 'newContainerName'}
                        id={isDatabase() ? 'newDatabaseName' : 'newContainerName'}
                        component={TextField}
                        required
                      />

                      <Stack horizontal verticalAlign="center" /*className={}*/>
                        <PrimaryButton
                          //className={buttonStyle(theme, true)}
                          onClick={formProps.submitForm}
                          //disabled={}
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
