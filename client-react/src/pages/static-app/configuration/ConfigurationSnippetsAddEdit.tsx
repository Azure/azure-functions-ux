import { useEffect, useState, useMemo, useContext } from 'react';
import { IDropdownOption, MessageBarType } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import {
  ApplicableEnvironmentsMode,
  ConfigurationSnippetsAddEditFormData,
  ConfigurationSnippetsAddEditProps,
  ConfigurationSnippetsYupValidationSchemaType,
  SnippetLocation,
} from './Configuration.types';
import ConfigurationData from './Configuration.data';
import { Form, FormikProps, Formik } from 'formik';
import { StatusMessage } from '../../../components/ActionBar';
import ConfigurationSnippetsAddEditForm from './ConfigurationSnippetAddEditForm';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import { PortalContext } from '../../../PortalContext';
import { getTelemetryInfo } from '../StaticSiteUtility';
import * as Yup from 'yup';
import { CommonConstants } from '../../../utils/CommonConstants';

const ConfigurationSnippetsAddEdit: React.FC<ConfigurationSnippetsAddEditProps> = ({
  hasWritePermissions,
  refresh,
  resourceId,
  isLoading,
  formProps,
  disabled,
  dismissPanel,
  selectedSnippet,
}: ConfigurationSnippetsAddEditProps) => {
  const { t } = useTranslation();
  const portalContext = useContext(PortalContext);

  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>(undefined);
  const [defaultInputFormValues, setDefaultInputFormValues] = useState<ConfigurationSnippetsAddEditFormData>({
    snippetName: '',
    snippetLocation: SnippetLocation.Head,
    snippetContent: `<!--${t('staticSite_snippetContentPlaceholder')}-->`,
    snippetInsertBottom: true,
    snippetApplicableEnvironmentsMode: ApplicableEnvironmentsMode.AllEnvironments,
    snippetEnvironments: [],
    isSnippetsDirty: false,
  });

  useEffect(() => {
    if (selectedSnippet) {
      setDefaultInputFormValues({
        snippetName: selectedSnippet.name,
        snippetLocation: selectedSnippet.location,
        snippetContent: selectedSnippet.content,
        snippetInsertBottom: selectedSnippet.insertBottom,
        snippetApplicableEnvironmentsMode: selectedSnippet.applicableEnvironmentsMode,
        snippetEnvironments: selectedSnippet.environments,
        isSnippetsDirty: false,
      });
    }
  }, [selectedSnippet]);

  const snippetEnvironmentDropdownOptions = useMemo<IDropdownOption[]>(() => {
    const options: IDropdownOption[] = [];
    formProps.values.environments.forEach(environment => {
      options.push({
        key: environment.name,
        text: ConfigurationData.getEnvironmentName(environment),
        data: '',
        selected: false,
      });
    });
    return options;
  }, [formProps.values.environments]);

  const atSnippetsLimit = useMemo<boolean>(() => {
    return !selectedSnippet && (formProps.values.snippets?.length ?? 0) >= 10;
  }, [selectedSnippet, formProps.values.snippets]);

  const validateForm = (values: ConfigurationSnippetsAddEditFormData) => {
    if (values.snippetApplicableEnvironmentsMode === ApplicableEnvironmentsMode.SpecifiedEnvironments) {
      if (values.snippetEnvironments?.length > 10) {
        setStatusMessage({
          message: t('staticSite_snippetEnvironmentsErrorMessage'),
          level: MessageBarType.error,
        });
        return;
      }
      if (values.snippetEnvironments?.length === 0) {
        setStatusMessage({
          message: t('staticSite_snippetNoEnvironmentsErrorMessage'),
          level: MessageBarType.error,
        });
        return;
      }
    }
    if (!values.snippetContent) {
      setStatusMessage({
        message: t('staticSite_snippetNoContentError'),
        level: MessageBarType.error,
      });
      return;
    }

    if (values.snippetContent && !CommonConstants.snippetsContentRegEx.test(values.snippetContent)) {
      setStatusMessage({
        message: t('staticSite_snippetContentError'),
        level: MessageBarType.error,
      });
      return;
    }
    setStatusMessage(undefined);
  };

  const yupValidationSchema: ConfigurationSnippetsYupValidationSchemaType = useMemo(() => {
    //note(stpelleg): Environments/Moncaco editor are handled differently
    return Yup.object().shape({
      isSnippetsDirty: Yup.mixed().notRequired(),
      snippetName: Yup.mixed().required(t('staticSite_snippetNameRequired')),
      snippetLocation: Yup.mixed().required(t('staticSite_snippetLocationRequired')),
      snippetInsertBottom: Yup.mixed().required(t('staticSite_snippetInsertionLocationRequired')),
      snippetApplicableEnvironmentsMode: Yup.mixed().required(t('staticSite_snippetEnironmentRequired')),
      snippetEnvironments: Yup.mixed().notRequired(),
      snippetContent: Yup.mixed().notRequired(),
    });
  }, []);

  const addOrUpdateSnippet = async (values: ConfigurationSnippetsAddEditFormData) => {
    if (values) {
      const name = values.snippetName;
      const snippetBody = {
        properties: {
          name,
          location: values.snippetLocation,
          applicableEnvironmentsMode: values.snippetApplicableEnvironmentsMode,
          content: btoa(values.snippetContent),
          insertBottom: values.snippetInsertBottom,
          environments:
            values.snippetApplicableEnvironmentsMode === ApplicableEnvironmentsMode.SpecifiedEnvironments ? values.snippetEnvironments : [],
        },
      };
      const addingSnippet = !selectedSnippet;
      const notificationMessage = addingSnippet ? t('staticSite_addingSnippet').format(name) : t('staticSite_updatingSnippet').format(name);
      const notificationId = portalContext.startNotification(notificationMessage, notificationMessage);
      const snippetResponse = await StaticSiteService.putStaticSiteSnippet(resourceId, values.snippetName, snippetBody);
      if (snippetResponse.metadata.success) {
        const successMessage = addingSnippet
          ? t('staticSite_addingSnippetSuccess').format(name)
          : t('staticSite_updatingSnippetSuccess').format(name);
        portalContext.stopNotification(notificationId, true, successMessage);
        dismissPanel();
        refresh();
      } else {
        let failureMessage = '';
        if (snippetResponse.metadata.error?.Message) {
          failureMessage = addingSnippet
            ? t('staticSite_addingSnippetFailureWithMessage').format(name, snippetResponse.metadata.error.Message)
            : t('staticSite_updatingSnippetFailureWithMessage').format(name, snippetResponse.metadata.error.Message);
        } else {
          failureMessage = addingSnippet
            ? t('staticSite_addingSnippetFailure').format(name)
            : t('staticSite_updatingSnippetFailure').format(name);
        }
        portalContext.log(
          getTelemetryInfo('error', 'deleteStaticSiteSnippet', 'failed', {
            error: snippetResponse.metadata.error,
            name: values.snippetName,
          })
        );
        portalContext.stopNotification(notificationId, false, failureMessage);
      }
    }
  };

  return (
    <Formik
      initialValues={defaultInputFormValues}
      onSubmit={addOrUpdateSnippet}
      enableReinitialize={true}
      validate={validateForm}
      validateOnBlur={false}
      validateOnChange={true}
      validationSchema={yupValidationSchema}
      render={(formProps: FormikProps<ConfigurationSnippetsAddEditFormData>) => {
        return (
          <Form>
            <ConfigurationSnippetsAddEditForm
              hasWritePermissions={hasWritePermissions}
              dismissPanel={dismissPanel}
              formProps={formProps}
              disabled={formProps.isSubmitting || disabled || atSnippetsLimit}
              environmentDropdownOptions={snippetEnvironmentDropdownOptions}
              isLoading={isLoading}
              statusMessage={statusMessage}
              atSnippetsLimit={atSnippetsLimit}
            />
          </Form>
        );
      }}
    />
  );
};

export default ConfigurationSnippetsAddEdit;
