import { Callout, DefaultButton, IComboBoxOption, Link, PrimaryButton } from '@fluentui/react';
import { Field, FieldProps, Form, Formik, FormikProps, FormikValues } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../../../../ApiHelpers/ArmHelper';
import DocumentDBService from '../../../../../../ApiHelpers/DocumentDBService';
import ComboBox from '../../../../../../components/form-controls/ComboBox';
import { Layout } from '../../../../../../components/form-controls/ReactiveFormControl';
import TextField from '../../../../../../components/form-controls/TextField';
import { BindingSetting } from '../../../../../../models/functions/binding';
import { IArmResourceTemplate, TSetArmResourceTemplates } from '../../../../../../utils/ArmTemplateHelper';
import { CommonConstants } from '../../../../../../utils/CommonConstants';
import { ValidationRegex } from '../../../../../../utils/constants/ValidationRegex';
import {
  getDatabaseAccountNameFromConnectionString,
  getNewContainerArmTemplate,
  getNewDatabaseArmTemplate,
  removeCurrentContainerArmTemplate,
  removeCurrentDatabaseArmTemplate,
  removeTemplateConditionally,
} from '../../../../../../utils/CosmosDbArmTemplateHelper';
import { LogCategories } from '../../../../../../utils/LogCategories';
import LogService from '../../../../../../utils/LogService';
import { CreateFunctionFormValues } from '../../CreateFunctionFormBuilder';
import { useStyles } from '../ComboBoxWithLink.styles';

interface CreateDatabaseFormValues {
  databaseName: string;
}

type CosmosDbDatabaseComboBoxWithLinkProps = Props & FieldProps;

interface Props {
  armResources: IArmResourceTemplate[];
  id: string;
  isDisabled: boolean;
  label: string;
  layout: Layout;
  resourceId: string;
  setArmResources: TSetArmResourceTemplates;
  setting: BindingSetting;
  value: string;
}

const CosmosDbDatabaseComboBoxWithLink: React.FC<CosmosDbDatabaseComboBoxWithLinkProps> = (
  props: CosmosDbDatabaseComboBoxWithLinkProps
) => {
  const { armResources, field, form: formProps, isDisabled, layout, resourceId, setArmResources } = props;
  const [databases, setDatabases] = useState<{ name: string }[]>();
  const [newDatabaseName, setNewDatabaseName] = useState<string>();
  const [selectedItem, setSelectedItem] = useState<IComboBoxOption>();
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const styles = useStyles(layout);

  const { t } = useTranslation();

  // If new DB account, automatically set new database/container
  useEffect(() => {
    if (formProps.status?.isNewDbAcct) {
      setNewDatabaseName(undefined);
    }
  }, [formProps.status?.isNewDbAcct]);

  useEffect(() => {
    if (formProps.status?.isNewDbAcct) {
      setDatabases(undefined);
    } else {
      const dbAcctName = getDatabaseAccountNameFromConnectionString(formProps);
      const dbAcctId = formProps.status?.dbAcctId ?? resourceId;
      const dbAcctType = formProps.status?.dbAcctType;

      DocumentDBService.fetchDatabases(dbAcctId, dbAcctName, dbAcctType).then(r => {
        if (!r.metadata.success) {
          LogService.error(
            LogCategories.bindingResource,
            'getCDbDatabases',
            `Failed to get Cosmos DB databases: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
        } else {
          setDatabases(r.data.value.length === 0 ? undefined : r.data.value);

          if (r.data.value.length === 0) {
            formProps.setStatus({ ...formProps.status, isNewDatabase: true, isNewContainer: true });
            formProps.setFieldValue('databaseName', CommonConstants.CosmosDbDefaults.databaseName);
            formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);

            removeCurrentDatabaseArmTemplate(armResources, setArmResources);
            removeCurrentContainerArmTemplate(armResources, setArmResources);

            const databaseName = CommonConstants.CosmosDbDefaults.databaseName;
            const databaseAccountName = getDatabaseAccountNameFromConnectionString(formProps);
            setArmResources(prevArmResources => [
              ...prevArmResources,
              getNewDatabaseArmTemplate(databaseName, armResources, databaseAccountName),
              getNewContainerArmTemplate(CommonConstants.CosmosDbDefaults.containerName, armResources, databaseAccountName, databaseName),
            ]);
          } else {
            formProps.setStatus({ ...formProps.status, isNewDatabase: false, isNewContainer: false });
            formProps.setFieldValue('databaseName', '');
            formProps.setFieldValue('collectionName', '');
            removeCurrentDatabaseArmTemplate(armResources, setArmResources);
            removeCurrentContainerArmTemplate(armResources, setArmResources);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.status?.isNewDbAcct, formProps.values.connectionStringSetting]);

  const options = useMemo((): IComboBoxOption[] => {
    const result: IComboBoxOption[] = newDatabaseName
      ? [{ key: newDatabaseName, text: `${t('new_parenthesized')} ${newDatabaseName}` }]
      : [];

    if (databases) {
      result.push(...databases.map(database => ({ key: database.name, text: database.name })));
    }

    return result;
  }, [databases, newDatabaseName, t]);

  const placeholder = databases ? t('cosmosDb_placeholder_selectADatabase') : undefined;

  const onChange = (
    option: IComboBoxOption | undefined,
    _: string | undefined,
    formProps: FormikProps<CreateFunctionFormValues>,
    field: { name: string; value: unknown }
  ) => {
    if (option) {
      const databaseName = option.key as string;
      formProps.setFieldValue(field.name, databaseName);

      if (!selectedItem && !!formProps.status?.isNewDatabase) {
        removeCurrentContainerArmTemplate(armResources, setArmResources);

        formProps.setStatus({ ...formProps.status, isNewDatabase: false, isNewContainer: false });
        formProps.setFieldValue('collectionName', '');

        removeTemplateConditionally(
          armResources,
          setArmResources,
          armResource => armResource.type.toLowerCase().includes('databases') && armResource.name.split('/').length === 2
        );

        /** @todo (joechung): #14260766 - Log telemetry when a new database is created. */
      } else if (option.text.includes(t('new_parenthesized'))) {
        formProps.setStatus({ ...formProps.status, isNewDatabase: true, isNewContainer: true });
        formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);

        removeCurrentContainerArmTemplate(armResources, setArmResources);

        const isTemplateFound = !!armResources.find(
          armResource => armResource.type.toLowerCase().includes('databases') && armResource.name.split('/').length === 2
        );

        if (!isTemplateFound) {
          // Regenerate the database template in case the database account was changed
          const databaseAccountName = getDatabaseAccountNameFromConnectionString(formProps);
          const databaseName = option.key as string;
          setArmResources([
            ...armResources,
            getNewDatabaseArmTemplate(databaseName, armResources, databaseAccountName),
            getNewContainerArmTemplate(CommonConstants.CosmosDbDefaults.containerName, armResources, databaseAccountName, databaseName),
          ]);

          /** @todo (joechung): #14260766 - Log telemetry when a newly created database is selected. */
        }
      } else {
        /** @todo (joechung): #14260766 - Log telemetry when an existing database is selected. */
      }
    }
  };

  const onTextFieldChange = (
    value: string | undefined,
    formProps: FormikProps<CreateFunctionFormValues>,
    field: { name: string; value: unknown }
  ) => {
    if (value) {
      // Generate new templates each time the value is changed.
      formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);

      removeCurrentDatabaseArmTemplate(armResources, setArmResources);
      removeCurrentContainerArmTemplate(armResources, setArmResources);

      const databaseAccountName = getDatabaseAccountNameFromConnectionString(formProps);
      setArmResources([
        ...armResources,
        getNewDatabaseArmTemplate(value, armResources, databaseAccountName),
        getNewContainerArmTemplate(CommonConstants.CosmosDbDefaults.containerName, armResources, databaseAccountName, value),
      ]);

      formProps.setFieldValue(field.name, value);
    }
  };

  const handleCalloutSubmit = (formValues: FormikValues) => {
    const { newDatabaseName } = formValues;
    setIsDialogVisible(false);
    setSelectedItem({ key: newDatabaseName, text: newDatabaseName });
    setNewDatabaseName(newDatabaseName);

    formProps.setStatus({ ...formProps.status, isNewDatabase: true, isNewContainer: true });
    formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);

    removeCurrentDatabaseArmTemplate(armResources, setArmResources);
    removeCurrentContainerArmTemplate(armResources, setArmResources);

    const databaseAccountName = getDatabaseAccountNameFromConnectionString(formProps);
    setArmResources([
      ...armResources,
      getNewDatabaseArmTemplate(newDatabaseName, armResources, databaseAccountName),
      getNewContainerArmTemplate(CommonConstants.CosmosDbDefaults.containerName, armResources, databaseAccountName, newDatabaseName),
    ]);

    /** @todo (joechung): #14260766 - Log telemetry when dialog is confirmed. */
  };

  const validateDatabaseName = (value: string) => {
    if (!value) {
      return t('cosmosDb_error_fieldRequired');
    }

    // Validate against existing databases/containers
    for (const database of databases ?? []) {
      if (value === database.name) {
        return t('cosmosDb_error_databaseAlreadyExists');
      }
    }

    // Regex validation: no special characters
    if (!ValidationRegex.specialCharacters.test(value)) {
      return t('cosmosDb_error_databaseNameCharacters');
    }

    // Regex validation: no space(s) at end
    if (!ValidationRegex.noSpacesAtEnd.test(value)) {
      return t('cosmosDb_error_databaseNameSpace');
    }

    return undefined;
  };

  // Set the value when coming back from the callout
  useEffect(() => {
    if (selectedItem) {
      onChange(selectedItem, undefined, formProps, field);
      setSelectedItem(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <>
      {!formProps.status?.isNewDbAcct && !!databases ? (
        <div className={styles.container}>
          <ComboBox
            allowFreeform={false}
            autoComplete="on"
            onChange={(_, option, __, customValue) => onChange(option, customValue, formProps, field)}
            options={options}
            {...props}
            overrideLoadingComboboxStyles={styles.overrideLoadingComboboxStyles}
            placeholder={placeholder}
          />
          {!isDisabled ? (
            <div className={styles.calloutContainer}>
              <Link id="dbComboBoxLink" onClick={() => setIsDialogVisible(true)}>
                {t('cosmosDb_label_createADatabase')}
              </Link>
              <Callout
                className={styles.callout}
                hidden={!isDialogVisible}
                onDismiss={() => setIsDialogVisible(false)}
                setInitialFocus
                target="#dbComboBoxLink">
                <Formik initialValues={{ databaseName: '' }} validateOnBlur={false} onSubmit={handleCalloutSubmit}>
                  {(formProps: FormikProps<CreateDatabaseFormValues>) => (
                    <section className={styles.section}>
                      <h1 className={styles.header}>{t('cosmosDb_label_createADatabase')}</h1>
                      <Form>
                        <Field
                          component={TextField}
                          id="newDatabaseName"
                          label={t('cosmosDb_label_database')}
                          layout={Layout.Vertical}
                          name="newDatabaseName"
                          required
                          validate={validateDatabaseName}
                          validateOnFocusOut
                        />
                        <div className={styles.buttonContainer}>
                          <PrimaryButton disabled={!formProps.isValid} onClick={formProps.submitForm}>
                            {t('create')}
                          </PrimaryButton>
                          <DefaultButton onClick={() => setIsDialogVisible(false)}>{t('cancel')}</DefaultButton>
                        </div>
                      </Form>
                    </section>
                  )}
                </Formik>
              </Callout>
            </div>
          ) : null}
        </div>
      ) : (
        <TextField {...props} onChange={(_, value) => onTextFieldChange(value, formProps, field)} />
      )}
    </>
  );
};

export default CosmosDbDatabaseComboBoxWithLink;
