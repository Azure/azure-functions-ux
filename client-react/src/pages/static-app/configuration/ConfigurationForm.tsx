import { MessageBarType } from '@fluentui/react';
import { Formik, FormikActions, FormikProps } from 'formik';
import { sortBy } from 'lodash-es';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../ApiHelpers/ArmHelper';
import EnvironmentService from '../../../ApiHelpers/static-site/EnvironmentService';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { PortalContext } from '../../../PortalContext';
import { CommonConstants } from '../../../utils/CommonConstants';
import { getTelemetryInfo } from '../StaticSiteUtility';
import ConfigurationData from './Configuration.data';
import { commandBarSticky } from './Configuration.styles';
import {
  applicableEnvironmentsMode,
  ConfigurationFormData,
  ConfigurationFormProps,
  EnvironmentVariable,
  PasswordProtectionTypes,
  SecretState,
} from './Configuration.types';
import ConfigurationCommandBar from './ConfigurationCommandBar';
import ConfigurationPivot from './ConfigurationPivot';

const ConfigurationForm: React.FC<ConfigurationFormProps> = (props: ConfigurationFormProps) => {
  const {
    fetchEnvironmentVariables,
    formData,
    hasWritePermissions,
    isLoading,
    location,
    refresh,
    resourceId,
    selectedEnvironmentVariableResponse,
    validationSchema,
  } = props;

  const [isDiscardConfirmDialogVisible, setIsDiscardConfirmDialogVisible] = useState(false);
  const [isRefreshConfirmDialogVisible, setIsRefreshConfirmDialogVisible] = useState(false);

  const { t } = useTranslation();

  const portalContext = useContext(PortalContext);

  const onKeyDown: React.KeyboardEventHandler<HTMLElement> = useCallback(e => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  const getApplicableEnvironments = useCallback((passwordProtection: PasswordProtectionTypes) => {
    switch (passwordProtection) {
      case PasswordProtectionTypes.AllEnvironments:
        return applicableEnvironmentsMode.AllEnvironments;
      case PasswordProtectionTypes.StagingEnvironments:
        return applicableEnvironmentsMode.StagingEnvironments;
      default:
        return applicableEnvironmentsMode.SpecifiedEnvironments;
    }
  }, []);

  const getSecretState = useCallback((passwordProtection: PasswordProtectionTypes, isPasswordKVReference: boolean) => {
    if (passwordProtection === PasswordProtectionTypes.Disabled) {
      return SecretState.None;
    }
    return isPasswordKVReference ? SecretState.SecretUrl : SecretState.Password;
  }, []);

  const getBasicAuthRequestBody = useCallback(
    (values: ConfigurationFormData) => {
      const isPasswordKVReference = !!values.visitorPassword && CommonConstants.isKeyVaultSecretUrl(values.visitorPassword);
      return {
        name: 'basicAuth',
        type: 'Microsoft.Web/staticSites/basicAuth',
        properties: {
          environments: values.passwordProtectionEnvironments,
          password: !isPasswordKVReference ? values.visitorPassword : '',
          secretUrl: isPasswordKVReference ? values.visitorPassword : '',
          applicableEnvironmentsMode: getApplicableEnvironments(values.passwordProtection),
          secretState: getSecretState(values.passwordProtection, isPasswordKVReference),
        },
      };
    },
    [getApplicableEnvironments, getSecretState]
  );

  const updateGeneralSettings = useCallback(
    async (values: ConfigurationFormData) => {
      if (values.isGeneralSettingsDirty) {
        const notificationId = portalContext.startNotification(
          t('staticSite_generalSettingsUpdate'),
          t('staticSite_generalSettingsUpdate')
        );
        const basicAuthRequestBody = getBasicAuthRequestBody(values);
        const [passwordProtectionResponse, siteResponse] = await Promise.all([
          StaticSiteService.putStaticSiteBasicAuth(resourceId, basicAuthRequestBody),
          StaticSiteService.putStaticSite(resourceId, {
            location,
            properties: {
              allowConfigFileUpdates: values.allowConfigFileUpdates ?? false,
            },
          }),
        ]);

        if (passwordProtectionResponse.metadata.success && siteResponse.metadata.success) {
          portalContext.stopNotification(notificationId, true, t('staticSite_generalSettingsUpdateWithSuccess'));
        } else {
          const errorMessages = [
            getErrorMessageOrStringify(passwordProtectionResponse.metadata.error),
            getErrorMessageOrStringify(siteResponse.metadata.error),
          ].join('\n');
          portalContext.log(getTelemetryInfo('error', 'putStaticSite', 'failed', { error: errorMessages }));
          portalContext.stopNotification(notificationId, false, t('staticSite_generalSettingsUpdateWithFailure').format(errorMessages));
        }

        return passwordProtectionResponse.metadata.success && siteResponse.metadata.success;
      }

      return true;
    },
    [getBasicAuthRequestBody, location, portalContext, resourceId, t]
  );

  const saveEnvironmentVariables = useCallback(
    async (
      environmentResourceId: string,
      environmentVariables: EnvironmentVariable[],
      formikActions: FormikActions<ConfigurationFormData>
    ) => {
      if (selectedEnvironmentVariableResponse) {
        const updatedEnvironmentVariablesObject = ConfigurationData.convertEnvironmentVariablesArrayToObject(environmentVariables);

        const updatedEnvironmentVariableRequest = selectedEnvironmentVariableResponse;
        updatedEnvironmentVariableRequest.properties = updatedEnvironmentVariablesObject;

        const environmentSettingsResponse = await EnvironmentService.saveEnvironmentVariables(
          environmentResourceId,
          updatedEnvironmentVariableRequest
        );

        const notificationId = portalContext.startNotification(t('staticSite_configUpdating'), t('staticSite_configUpdating'));

        if (environmentSettingsResponse.metadata.success) {
          portalContext.stopNotification(notificationId, true, t('staticSite_configUpdateSuccess'));
          formikActions.setFieldValue('isAppSettingsDirty', false);
        } else {
          const errorMessage = getErrorMessageOrStringify(environmentSettingsResponse.metadata.error);

          portalContext.log(
            getTelemetryInfo('error', 'saveEnvironmentSettings', 'failed', {
              error: `Failed to save environment settings: ${errorMessage}`,
            })
          );

          portalContext.stopNotification(
            notificationId,
            false,
            errorMessage
              ? t('staticSite_configUpdateFailure').format(errorMessage)
              : t('staticSite_generalSettingsUpdateWithFailureNoMessage')
          );
        }

        return environmentSettingsResponse.metadata.success;
      }

      return true;
    },
    [portalContext, selectedEnvironmentVariableResponse, t]
  );

  const submitEnvironmentVariables = useCallback(
    async (values: ConfigurationFormData, formikActions: FormikActions<ConfigurationFormData>) => {
      if (!!values.selectedEnvironment && values.isAppSettingsDirty) {
        return await saveEnvironmentVariables(values.selectedEnvironment.id, values.environmentVariables, formikActions);
      }

      return true;
    },
    [saveEnvironmentVariables]
  );

  const onSubmit = useCallback(
    async (values: ConfigurationFormData, formikActions: FormikActions<ConfigurationFormData>) => {
      portalContext.log(getTelemetryInfo('info', 'onSubmitCodeForm', 'submit'));

      formikActions.setSubmitting(true);

      const [generalSettingsSuccess, appSettingsSuccess] = await Promise.all([
        updateGeneralSettings(values),
        submitEnvironmentVariables(values, formikActions),
      ]);

      formikActions.setSubmitting(false);

      portalContext.updateDirtyState(false);

      if (generalSettingsSuccess && appSettingsSuccess) {
        refresh(values.selectedEnvironment);
      } else if (appSettingsSuccess && !!values.selectedEnvironment) {
        fetchEnvironmentVariables(values.selectedEnvironment.id);
      } else if (generalSettingsSuccess) {
        formikActions.setFieldValue('visitorPassword', '');
        formikActions.setFieldValue('visitorPasswordConfirm', '');
        formikActions.setFieldValue('isGeneralSettingsDirty', false);
      }
    },
    [fetchEnvironmentVariables, portalContext, refresh, submitEnvironmentVariables, updateGeneralSettings]
  );

  const hideDiscardConfirmDialog = useCallback(() => {
    setIsDiscardConfirmDialogVisible(false);
  }, []);

  const discard = useCallback(
    (formProps: FormikProps<ConfigurationFormData>) => {
      formProps.resetForm();

      const initialEnvironmentVariables = selectedEnvironmentVariableResponse
        ? sortBy(ConfigurationData.convertEnvironmentVariablesObjectToArray(selectedEnvironmentVariableResponse.properties), e =>
            e.name.toLocaleLowerCase()
          )
        : [];
      formProps.setFieldValue('environmentVariables', [...initialEnvironmentVariables]);

      hideDiscardConfirmDialog();

      portalContext.updateDirtyState(false);
    },
    [hideDiscardConfirmDialog, portalContext, selectedEnvironmentVariableResponse]
  );

  const refreshForm = useCallback(
    (formProps: FormikProps<ConfigurationFormData>) => {
      setIsRefreshConfirmDialogVisible(false);
      refresh();
      formProps.resetForm();
      portalContext.updateDirtyState(false);
    },
    [portalContext, refresh]
  );

  const hideRefreshConfirmDialog = useCallback(() => {
    setIsRefreshConfirmDialogVisible(false);
  }, []);

  const showDiscardConfirmDialog = useCallback(() => {
    setIsDiscardConfirmDialogVisible(true);
  }, []);

  return (
    <Formik
      initialValues={formData}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={validationSchema}>
      {(formProps: FormikProps<ConfigurationFormData>) => (
        <form onKeyDown={onKeyDown}>
          <div className={commandBarSticky}>
            <ConfigurationCommandBar
              dirty={formProps.values.isAppSettingsDirty || formProps.values.isGeneralSettingsDirty}
              isLoading={isLoading}
              refresh={() => {
                if (formProps.values.isAppSettingsDirty || formProps.values.isGeneralSettingsDirty) {
                  setIsRefreshConfirmDialogVisible(true);
                } else {
                  refreshForm(formProps);
                }
              }}
              save={formProps.submitForm}
              showDiscardConfirmDialog={showDiscardConfirmDialog}
            />

            {!hasWritePermissions && <CustomBanner message={t('staticSite_readOnlyRbac')} type={MessageBarType.info} />}

            <>
              <ConfirmDialog
                content={t('staticSite_discardChangesMesssage').format(
                  formProps.values?.selectedEnvironment ? ConfigurationData.getEnvironmentName(formProps.values.selectedEnvironment) : ''
                )}
                defaultActionButton={{
                  title: t('cancel'),
                  onClick: hideDiscardConfirmDialog,
                }}
                hidden={!isDiscardConfirmDialogVisible}
                onDismiss={hideDiscardConfirmDialog}
                primaryActionButton={{
                  title: t('ok'),
                  onClick: () => {
                    discard(formProps);
                  },
                }}
                title={t('discardChangesTitle')}
              />

              <ConfirmDialog
                content={t('staticSite_refreshConfirmMessage')}
                defaultActionButton={{
                  title: t('cancel'),
                  onClick: hideRefreshConfirmDialog,
                }}
                hidden={!isRefreshConfirmDialogVisible}
                onDismiss={hideRefreshConfirmDialog}
                primaryActionButton={{
                  title: t('ok'),
                  onClick: () => {
                    refreshForm(formProps);
                  },
                }}
                title={t('staticSite_refreshConfirmTitle')}
              />
            </>
          </div>
          <div>
            <ConfigurationPivot {...props} isLoading={isLoading || formProps.isSubmitting} formProps={formProps} />
          </div>
        </form>
      )}
    </Formik>
  );
};

export default ConfigurationForm;
