import React, { useContext, useState } from 'react';
import { Formik, FormikProps, FormikActions } from 'formik';
import {
  ConfigurationFormData,
  ConfigurationFormProps,
  PasswordProtectionTypes,
  SecretState,
  applicableEnvironmentsMode,
  EnvironmentVariable,
} from './Configuration.types';
import { KeyCodes } from '@fluentui/react';
import { getTelemetryInfo } from '../StaticSiteUtility';
import { PortalContext } from '../../../PortalContext';
import { commandBarSticky } from './Configuration.styles';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import ConfigurationCommandBar from './ConfigurationCommandBar';
import { MessageBarType } from '@fluentui/react';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { useTranslation } from 'react-i18next';
import ConfigurationPivot from './ConfigurationPivot';
import ConfigurationData from './Configuration.data';
import { sortBy } from 'lodash-es';
import EnvironmentService from '../../../ApiHelpers/static-site/EnvironmentService';
import { getErrorMessageOrStringify } from '../../../ApiHelpers/ArmHelper';
import { CommonConstants } from '../../../utils/CommonConstants';

const ConfigurationForm: React.FC<ConfigurationFormProps> = props => {
  const { resourceId, hasWritePermissions, isLoading, selectedEnvironmentVariableResponse, fetchEnvironmentVariables } = props;
  const [isDiscardConfirmDialogVisible, setIsDiscardConfirmDialogVisible] = useState(false);
  const [isRefreshConfirmDialogVisible, setIsRefreshConfirmDialogVisible] = useState(false);

  const { t } = useTranslation();

  const portalContext = useContext(PortalContext);

  const onKeyDown = keyEvent => {
    if ((keyEvent.charCode || keyEvent.keyCode) === KeyCodes.enter) {
      keyEvent.preventDefault();
    }
  };

  const updatePasswordProtection = async (values: ConfigurationFormData) => {
    if (values.isGeneralSettingsDirty) {
      const notificationId = portalContext.startNotification(t('staticSite_generalSettingsUpdate'), t('staticSite_generalSettingsUpdate'));
      const basicAuthRequestBody = getBasicAuthRequestBody(values);
      const passwordProtectionResponse = await StaticSiteService.putStaticSiteBasicAuth(resourceId, basicAuthRequestBody);

      if (passwordProtectionResponse.metadata.success) {
        portalContext.stopNotification(notificationId, true, t('staticSite_generalSettingsUpdateWithSuccess'));
      } else {
        const errorMessage = getErrorMessageOrStringify(passwordProtectionResponse.metadata.error);
        portalContext.log(getTelemetryInfo('error', 'getStaticSite', 'failed', { error: errorMessage }));
        portalContext.stopNotification(notificationId, false, t('staticSite_generalSettingsUpdateWithFailure').format(errorMessage));
      }
      return passwordProtectionResponse.metadata.success;
    }
    return true;
  };

  const getBasicAuthRequestBody = (values: ConfigurationFormData) => {
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
  };

  const getApplicableEnvironments = (passwordProtection: PasswordProtectionTypes) => {
    switch (passwordProtection) {
      case PasswordProtectionTypes.AllEnvironments:
        return applicableEnvironmentsMode.AllEnvironments;
      case PasswordProtectionTypes.StagingEnvironments:
        return applicableEnvironmentsMode.StagingEnvironments;
      default:
        return applicableEnvironmentsMode.SpecifiedEnvironments;
    }
  };

  const getSecretState = (passwordProtection: PasswordProtectionTypes, isPasswordKVReference: boolean) => {
    if (passwordProtection === PasswordProtectionTypes.Disabled) {
      return SecretState.None;
    }
    return isPasswordKVReference ? SecretState.SecretUrl : SecretState.Password;
  };

  const saveEnvironmentVariables = async (
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
          getTelemetryInfo('error', 'saveEnvironmentSettings', 'failed', { error: `Failed to save environment settings: ${errorMessage}` })
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
  };

  const submitEnvironmentVariables = async (values: ConfigurationFormData, formikActions: FormikActions<ConfigurationFormData>) => {
    if (!!values.selectedEnvironment && values.isAppSettingsDirty) {
      return await saveEnvironmentVariables(values.selectedEnvironment.id, values.environmentVariables, formikActions);
    }
    return true;
  };

  const onSubmit = async (values: ConfigurationFormData, formikActions: FormikActions<ConfigurationFormData>) => {
    portalContext.log(getTelemetryInfo('info', 'onSubmitCodeForm', 'submit'));
    formikActions.setSubmitting(true);
    const [passwordSuccess, appSettingsSuccess] = await Promise.all([
      updatePasswordProtection(values),
      submitEnvironmentVariables(values, formikActions),
    ]);
    formikActions.setSubmitting(false);
    portalContext.updateDirtyState(false);

    if (passwordSuccess && appSettingsSuccess) {
      props.refresh(values.selectedEnvironment);
      formikActions.resetForm();
    } else if (appSettingsSuccess && !!values.selectedEnvironment) {
      fetchEnvironmentVariables(values.selectedEnvironment.id);
    } else if (passwordSuccess) {
      formikActions.setFieldValue('visitorPassword', '');
      formikActions.setFieldValue('visitorPasswordConfirm', '');
      formikActions.setFieldValue('isGeneralSettingsDirty', false);
    }
  };

  const hideDiscardConfirmDialog = () => {
    setIsDiscardConfirmDialogVisible(false);
  };

  const getBanner = () => {
    const bannerInfo = { message: '', type: MessageBarType.info };
    if (!hasWritePermissions) {
      bannerInfo.message = t('staticSite_readOnlyRbac');
    }
    return bannerInfo.message ? <CustomBanner message={bannerInfo.message} type={bannerInfo.type} /> : <></>;
  };

  const discard = (formProps: FormikProps<ConfigurationFormData>) => {
    formProps.resetForm();
    formProps.setFieldValue('environmentVariables', [...getInitialEnvironmentVariables()]);
    hideDiscardConfirmDialog();
    portalContext.updateDirtyState(false);
  };

  const refresh = (formProps: FormikProps<ConfigurationFormData>) => {
    setIsRefreshConfirmDialogVisible(false);
    props.refresh();
    formProps.resetForm();
    portalContext.updateDirtyState(false);
  };

  const hideRefreshConfirmDialog = () => {
    setIsRefreshConfirmDialogVisible(false);
  };

  const sort = (environmentVariables: EnvironmentVariable[]) => {
    return sortBy(environmentVariables, e => e.name.toLocaleLowerCase());
  };

  const getInitialEnvironmentVariables = () => {
    if (selectedEnvironmentVariableResponse) {
      return sort(ConfigurationData.convertEnvironmentVariablesObjectToArray(selectedEnvironmentVariableResponse.properties));
    } else {
      return [];
    }
  };

  const getConfirmDialogs = (formProps: FormikProps<ConfigurationFormData>) => {
    return (
      <>
        <ConfirmDialog
          primaryActionButton={{
            title: t('ok'),
            onClick: () => {
              discard(formProps);
            },
          }}
          defaultActionButton={{
            title: t('cancel'),
            onClick: hideDiscardConfirmDialog,
          }}
          title={t('discardChangesTitle')}
          content={t('staticSite_discardChangesMesssage').format(
            !!formProps.values && !!formProps.values.selectedEnvironment
              ? ConfigurationData.getEnvironmentName(formProps.values.selectedEnvironment)
              : ''
          )}
          hidden={!isDiscardConfirmDialogVisible}
          onDismiss={hideDiscardConfirmDialog}
        />

        <ConfirmDialog
          primaryActionButton={{
            title: t('ok'),
            onClick: () => {
              refresh(formProps);
            },
          }}
          defaultActionButton={{
            title: t('cancel'),
            onClick: hideRefreshConfirmDialog,
          }}
          title={t('staticSite_refreshConfirmTitle')}
          content={t('staticSite_refreshConfirmMessage')}
          hidden={!isRefreshConfirmDialogVisible}
          onDismiss={hideRefreshConfirmDialog}
        />
      </>
    );
  };

  return (
    <Formik
      initialValues={props.formData}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={props.validationSchema}>
      {(formProps: FormikProps<ConfigurationFormData>) => (
        <form onKeyDown={onKeyDown}>
          <div className={commandBarSticky}>
            <ConfigurationCommandBar
              save={formProps.submitForm}
              dirty={formProps.values.isAppSettingsDirty || formProps.values.isGeneralSettingsDirty}
              isLoading={isLoading}
              showDiscardConfirmDialog={() => setIsDiscardConfirmDialogVisible(true)}
              refresh={() => {
                if (formProps.values.isAppSettingsDirty || formProps.values.isGeneralSettingsDirty) {
                  setIsRefreshConfirmDialogVisible(true);
                } else {
                  refresh(formProps);
                }
              }}
            />
            {getBanner()}
            {getConfirmDialogs(formProps)}
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
