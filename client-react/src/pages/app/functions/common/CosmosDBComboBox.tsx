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
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const dbAcctName = formProps.values.connectionStringSetting.split('_')[0];
    const dbAcctType = formProps.status.dbAcctType;

    if (setting.name === 'databaseName') {
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
  }, [formProps.values.connectionStringSetting]);

  // TODO: Handle 'resource does not exist' error a little more nicely (big error in console)
  useEffect(() => {
    const dbAcctName = formProps.values.connectionStringSetting.split('_')[0];
    const dbAcctType = formProps.status.dbAcctType;

    if (setting.name === 'collectionName') {
      // TODO: try to use newDatabaseName as check?
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
  }, [formProps.values.databaseName]);

  useEffect(() => {
    if (setting.name === 'databaseName') {
      formProps.setStatus({ ...formProps.status, isNewDatabase: !!newDatabaseName });
    }
  }, [newDatabaseName]);

  useEffect(() => {
    if (setting.name === 'collectionName') {
      formProps.setStatus({ ...formProps.status, isNewContainer: !!newContainerName });
    }
  }, [newContainerName]);

  const onChange = (
    option: IComboBoxOption | undefined,
    customValue: string | undefined,
    formProps: FormikProps<CreateFunctionFormValues>,
    field: { name: string; value: any }
  ) => {
    if (option) {
      const dbOrContName = option.key as string;
      formProps.setFieldValue(field.name, dbOrContName);
    }
  };

  const getDatabasesOrContainers = (): IComboBoxOption[] => {
    if (setting.name === 'databaseName') {
      const result: IComboBoxOption[] = newDatabaseName ? [{ key: newDatabaseName, text: `(new) ${newDatabaseName}` }] : [];

      if (databases) {
        databases.forEach(database => {
          result.push({ key: database.name, text: database.name });
        });
      }

      return result;
    } else if (setting.name === 'collectionName') {
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

  // TODO: consider moving these two functions into DocumentDBService
  const getNewDatabaseArmTemplate = (databaseName: string) => {
    const dbAcctName = formProps.values.connectionStringSetting.split('_')[0];

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

    if (formProps.status.dbAcctType === 'MongoDB') {
      databaseTemplate.type = 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases';
    }

    armResources.forEach(rsc => {
      if (rsc.type === 'Microsoft.DocumentDB/databaseAccounts') {
        databaseTemplate.dependsOn = [`[resourceId('Microsoft.DocumentDB/databaseAccounts', '${dbAcctName}')]`];
        return;
      }
    });

    return databaseTemplate;
  };

  const getNewContainerArmTemplate = (containerName: string) => {
    const dbAcctName = formProps.values.connectionStringSetting.split('_')[0];
    const databaseName = formProps.values.databaseName;

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

    armResources.forEach(rsc => {
      if (rsc.type === 'Microsoft.DocumentDB/databaseAccounts') {
        containerTemplate.dependsOn = [
          `[resourceId('Microsoft.DocumentDB/databaseAccounts/sqlDatabases', '${dbAcctName}', '${databaseName}')]`,
        ];
        return;
      }
    });

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

  const handleCalloutSubmit = (formValues: FormikValues) => {
    setIsDialogVisible(false);
    if (setting.name === 'databaseName') {
      setSelectedItem({ key: formValues.newDatabaseName, text: formValues.newDatabaseName });
      setNewDatabaseName(formValues.newDatabaseName);

      setArmResources([...armResources, getNewDatabaseArmTemplate(formValues.newDatabaseName)]);
    } else if (setting.name === 'collectionName') {
      setSelectedItem({ key: formValues.newContainerName, text: formValues.newContainerName });
      setNewContainerName(formValues.newContainerName);

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
  if (setting.name === 'databaseName') {
    if (!databases) {
      placeholder = '(new) Database';
    } else {
      placeholder = 'Select a database';
    }
  } else if (setting.name === 'collectionName') {
    if (!containers) {
      placeholder = '(new) Container';
    } else {
      placeholder = 'Select a container';
    }
  }

  return (
    <>
      <ComboBox
        allowFreeform={false}
        onChange={(_e, option, index, customValue) => onChange(option, customValue, formProps, field)}
        autoComplete="on"
        options={options}
        defaultSelectedKey={formProps.values.repo}
        {...props}
        placeholder={placeholder}
      />

      {!isDisabled ? (
        <div style={linkPaddingStyle}>
          <Link id={setting.name === 'databaseName' ? 'dbComboBoxLink' : 'contComboBoxLink'} onClick={() => setIsDialogVisible(true)}>
            {setting.name === 'databaseName' ? 'Create a database' : 'Create a container'}
          </Link>

          <Callout
            onDismiss={() => setIsDialogVisible(false)}
            target={setting.name === 'databaseName' ? '#dbComboBoxLink' : '#contComboBoxLink'}
            hidden={!isDialogVisible}
            style={calloutStyleField}>
            <h3>{setting.name === 'databaseName' ? 'Create a database' : 'Create a container'}</h3>

            <Formik
              initialValues={setting.name === 'databaseName' ? { databaseName: '' } : { containerName: '' }}
              onSubmit={handleCalloutSubmit}>
              {(formProps: FormikProps<CreateDatabaseFormValues | CreateContainerFormValues>) => (
                <Form>
                  <Field
                    name={setting.name === 'databaseName' ? 'newDatabaseName' : 'newContainerName'}
                    id={setting.name === 'databaseName' ? 'newDatabaseName' : 'newContainerName'}
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
  );
};

export default CosmosDBComboBox;
