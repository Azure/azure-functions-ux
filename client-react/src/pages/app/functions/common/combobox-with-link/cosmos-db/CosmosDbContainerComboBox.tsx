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
  removeCurrentContainerArmTemplate,
  removeTemplateConditionally,
} from '../../../../../../utils/CosmosDbArmTemplateHelper';
import { LogCategories } from '../../../../../../utils/LogCategories';
import LogService from '../../../../../../utils/LogService';
import { CreateFunctionFormValues } from '../../CreateFunctionFormBuilder';
import { useStyles } from '../ComboBoxWithLink.styles';

interface CreateContainerFormValues {
  containerName: string;
}

type CosmosDbContainerComboBoxWithLinkProps = Props & FieldProps;

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

const CosmosDbContainerComboBoxWithLink: React.FC<CosmosDbContainerComboBoxWithLinkProps> = (
  props: CosmosDbContainerComboBoxWithLinkProps
) => {
  const { armResources, field, form: formProps, isDisabled, layout, resourceId, setArmResources } = props;
  const [containers, setContainers] = useState<{ name: string }[]>();
  const [newContainerName, setNewContainerName] = useState<string>();
  const [selectedItem, setSelectedItem] = useState<IComboBoxOption>();
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const styles = useStyles(layout);

  const { t } = useTranslation();

  // Reset the container name for new database accounts.
  useEffect(() => {
    if (formProps.status?.isNewDbAcct) {
      setNewContainerName(undefined);
    }
  }, [formProps.status?.isNewDbAcct]);

  // Set containers to empty (for new databases) or fetch containers (for existing databases).
  useEffect(() => {
    if (formProps.status?.isNewDatabase) {
      setContainers(undefined);
    } else {
      const dbAcctName = getDatabaseAccountNameFromConnectionString(formProps);
      const dbAcctId = formProps.status?.dbAcctId ?? resourceId;
      const dbAcctType = formProps.status?.dbAcctType;

      DocumentDBService.fetchContainers(dbAcctId, dbAcctName, dbAcctType, formProps.values.databaseName).then(r => {
        if (!r.metadata.success) {
          LogService.error(
            LogCategories.bindingResource,
            'getCDbContainers',
            `Failed to get Cosmos DB containers: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
        } else {
          setContainers(r.data.value.length === 0 ? undefined : r.data.value);

          if (r.data.value.length === 0) {
            formProps.setStatus({ ...formProps.status, isNewContainer: true });
            formProps.setFieldValue('collectionName', CommonConstants.CosmosDbDefaults.containerName);

            removeCurrentContainerArmTemplate(armResources, setArmResources);

            setArmResources(prevArmResources => [
              ...prevArmResources,
              getNewContainerArmTemplate(
                CommonConstants.CosmosDbDefaults.containerName,
                armResources,
                getDatabaseAccountNameFromConnectionString(formProps),
                CommonConstants.CosmosDbDefaults.databaseName
              ),
            ]);
          } else {
            formProps.setStatus({ ...formProps.status, isNewContainer: false });
            formProps.setFieldValue('collectionName', '');
            removeCurrentContainerArmTemplate(armResources, setArmResources);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.status?.isNewDatabase, formProps.values.databaseName]);

  // Set the partition key path in the container template when it changes.
  useEffect(() => {
    if (formProps.status && formProps.status.dbAcctType !== CommonConstants.CosmosDbTypes.globalDocumentDb) {
      return;
    }

    let updatedPkpValue: string = formProps.values.partitionKeyPath;
    if (updatedPkpValue[0] !== '/') {
      updatedPkpValue = `/${updatedPkpValue}`;
      formProps.setFieldValue('partitionKeyPath', updatedPkpValue);
    }

    // Find the container template, and set partitionKeyPath from current pkp value
    const modifiableArmResources = [...armResources];
    for (const resource of modifiableArmResources) {
      if (resource.type?.toLowerCase().includes('containers') && !!resource.properties?.resource.partitionKey) {
        resource.properties = {
          ...resource.properties,
          resource: {
            ...resource.properties.resource,
            partitionKey: {
              ...resource.properties.resource.partitionKey,
              paths: [updatedPkpValue],
            },
          },
        };
        setArmResources(modifiableArmResources);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.partitionKeyPath]);

  const options = useMemo((): IComboBoxOption[] => {
    const result: IComboBoxOption[] = newContainerName
      ? [{ key: newContainerName, text: `${t('new_parenthesized')} ${newContainerName}` }]
      : [];

    if (containers) {
      result.push(...containers.map(container => ({ key: container.name, text: container.name })));
    }

    return result;
  }, [containers, newContainerName, t]);

  const placeholder = containers ? t('cosmosDb_placeholder_selectAContainer') : undefined;

  const onChange = (
    option: IComboBoxOption | undefined,
    _: string | undefined,
    formProps: FormikProps<CreateFunctionFormValues>,
    field: { name: string; value: unknown }
  ) => {
    if (option) {
      const containerName = option.key as string;
      formProps.setFieldValue(field.name, containerName);

      if (!selectedItem && !!formProps.status?.isNewContainer) {
        // Find & store into storedArmTemplate, then delete template from armResources
        formProps.setStatus({ ...formProps.status, isNewContainer: false });

        removeTemplateConditionally(
          armResources,
          setArmResources,
          armResource => armResource.type.toLowerCase().includes('containers') || armResource.type.toLowerCase().includes('collections')
        );

        /** @todo (joechung): #14260766 - Log telemetry. */
      } else if (option.text.includes(t('new_parenthesized'))) {
        // If template already in armResources (should mean user generated new one) don't do anything, otherwise reinstate storedArmTemplate to armResources
        formProps.setStatus({ ...formProps.status, isNewContainer: true });

        const isTemplateFound = armResources.find(
          armResource => armResource.type.toLowerCase().includes('containers') || armResource.type.toLowerCase().includes('collections')
        );

        if (!isTemplateFound) {
          // Regenerate the container template in case the database was changed
          setArmResources([
            ...armResources,
            getNewContainerArmTemplate(
              option.key as string,
              armResources,
              getDatabaseAccountNameFromConnectionString(formProps),
              formProps.values.databaseName
            ),
          ]);

          /** @todo (joechung): #14260766 - Log telemetry. */
        }
      } else {
        /** @todo (joechung): #14260766 - Log telemetry. */
      }
    }
  };

  const onTextFieldChange = (
    value: string | undefined,
    formProps: FormikProps<CreateFunctionFormValues>,
    field: { name: string; value: unknown }
  ) => {
    if (value) {
      // Generate a new template each time value is changed.
      removeCurrentContainerArmTemplate(armResources, setArmResources);
      setArmResources([
        ...armResources,
        getNewContainerArmTemplate(
          value,
          armResources,
          getDatabaseAccountNameFromConnectionString(formProps),
          formProps.values.databaseName
        ),
      ]);

      // Set partition key path back to its default (/id) so we don't accidentally forget to set it in the template.
      formProps.setFieldValue('partitionKeyPath', CommonConstants.CosmosDbDefaults.partitionKeyPath);
      formProps.setFieldValue(field.name, value);
    }
  };

  const handleCalloutSubmit = (formValues: FormikValues) => {
    const { newContainerName } = formValues;
    setIsDialogVisible(false);
    setSelectedItem({ key: newContainerName, text: newContainerName });
    setNewContainerName(newContainerName);

    formProps.setStatus({ ...formProps.status, isNewContainer: true });

    removeCurrentContainerArmTemplate(armResources, setArmResources);

    setArmResources([
      ...armResources,
      getNewContainerArmTemplate(
        formValues.newContainerName,
        armResources,
        getDatabaseAccountNameFromConnectionString(formProps),
        formProps.values.databaseName
      ),
    ]);

    /** @todo (joechung): #14260766 - Log telemetry when dialog is confirmed. */
  };

  const validateContainerName = (value: string) => {
    if (!value) {
      return t('cosmosDb_error_fieldRequired');
    }

    // Validate against existing databases/containers
    for (const container of containers ?? []) {
      if (value === container.name) {
        return t('cosmosDb_error_containerAlreadyExists');
      }
    }

    // Regex validation: no special characters
    if (!ValidationRegex.specialCharacters.test(value)) {
      return t('cosmosDb_error_containerNameCharacters');
    }

    // Regex validation: no space(s) at end
    if (!ValidationRegex.noSpacesAtEnd.test(value)) {
      return t('cosmosDb_error_containerNameSpace');
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
      {!formProps.status?.isNewDatabase && !!containers ? (
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
              <Link id="contComboBoxLink" onClick={() => setIsDialogVisible(true)}>
                {t('cosmosDb_label_createAContainer')}
              </Link>
              <Callout
                className={styles.callout}
                hidden={!isDialogVisible}
                onDismiss={() => setIsDialogVisible(false)}
                setInitialFocus
                target="#contComboBoxLink">
                <Formik initialValues={{ containerName: '' }} validateOnBlur={false} onSubmit={handleCalloutSubmit}>
                  {(formProps: FormikProps<CreateContainerFormValues>) => (
                    <section className={styles.section}>
                      <h1 className={styles.header}>{t('cosmosDb_label_createAContainer')}</h1>
                      <Form>
                        <Field
                          component={TextField}
                          id="newContainerName"
                          label={t('cosmosDb_label_container')}
                          layout={Layout.Vertical}
                          name="newContainerName"
                          required
                          validate={validateContainerName}
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

export default CosmosDbContainerComboBoxWithLink;
