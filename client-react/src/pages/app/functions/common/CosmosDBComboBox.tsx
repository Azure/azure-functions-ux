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

    // TODO: Don't do this if creating new dbAcct
    if (setting.name === 'databaseName') {
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

    if (setting.name === 'collectionName' && !newDatabaseName) {
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

  const onChange = (
    option: IComboBoxOption | undefined,
    customValue: string | undefined,
    formProps: FormikProps<CreateFunctionFormValues>,
    field: { name: string; value: any }
  ) => {
    if (option) {
      const dbAcctConnectionSettingKey = option.key as string; // Format: `${dbAcctName}_DOCUMENTDB`
      const dbAcctName = dbAcctConnectionSettingKey.split('_')[0];
      formProps.setFieldValue(field.name, dbAcctConnectionSettingKey);

      // Always add the appsetting for CDB to simplify between new/existing DB accounts (FunctionsService deploy handles setting overlaps)
      let newAppSettings = {
        properties: {},
      };

      newAppSettings.properties[
        dbAcctConnectionSettingKey
      ] = `[listConnectionStrings(resourceId('Microsoft.DocumentDB/databaseAccounts', '${dbAcctName}'), '2019-12-12').connectionStrings[0].connectionString]`;
      formProps.setFieldValue('newAppSettings', newAppSettings);
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
          // TODO: Get the partition key to use 'formProps.values.partitionKeyPath'
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

  return (
    <>
      <ComboBox
        allowFreeform={false}
        onChange={(_e, option, index, customValue) => onChange(option, customValue, formProps, field)}
        autoComplete="on"
        options={options}
        defaultSelectedKey={formProps.values.repo}
        {...props}
      />

      {console.log(formProps.values)}

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
