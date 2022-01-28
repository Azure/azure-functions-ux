import React, { useContext, useState, useEffect } from 'react';
import { Formik, FormikProps, FormikActions } from 'formik';
import {
  ConfigurationFormData,
  ConfigurationFormProps,
  PasswordProtectionTypes,
  SecretState,
  applicableEnvironmentsMode,
} from './Configuration.types';
import { KeyCodes } from '@fluentui/react';
import { getTelemetryInfo, isKeyVaultReference } from '../StaticSiteUtility';
import { PortalContext } from '../../../PortalContext';
import { commandBarSticky } from './Configuration.styles';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import ConfigurationCommandBar from './ConfigurationCommandBar';
import { MessageBarType } from '@fluentui/react';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { useTranslation } from 'react-i18next';
import ConfigurationPivot from './ConfigurationPivot';
//import ConfigurationData from './Configuration.data';

const ConfigurationForm: React.FC<ConfigurationFormProps> = props => {
  const { resourceId, hasWritePermissions, isLoading, selectedEnvironmentVariableResponse } = props;
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
    const isPasswordKVReference = !!values.visiorPassword && isKeyVaultReference(values.visiorPassword);
    const basicAuthRequestBody = {
      name: 'basicAuth',
      type: 'Microsoft.Web/staticSites/basicAuth',
      properties: {
        environments: values.passwordProtectionEnvironments,
        password: !isPasswordKVReference ? values.visiorPassword : '',
        secretUrl: isPasswordKVReference ? values.visiorPassword : '',
        applicableEnvironmentsMode: getApplicableEnvironments(values.passwordProtection),
        secretState: getSecretState(values.passwordProtection, isPasswordKVReference),
      },
    };
    const passwordProtectionResponse = await StaticSiteService.putStaticSiteBasicAuth(resourceId, basicAuthRequestBody);

    if (passwordProtectionResponse.metadata.success) {
    } else {
      portalContext.log(getTelemetryInfo('error', 'getStaticSite', 'failed', { error: passwordProtectionResponse.metadata.error }));
    }
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

  const submitEnvironmentVariables = async () => {
    // if (!!selectedEnvironment) {
    //   saveEnvironmentVariables(selectedEnvironment.id, environmentVariables);
    // }
  };

  const onSubmit = async (values: ConfigurationFormData, formikActions: FormikActions<ConfigurationFormData>) => {
    portalContext.log(getTelemetryInfo('info', 'onSubmitCodeForm', 'submit'));

    await Promise.all([updatePasswordProtection(values), submitEnvironmentVariables()]);

    formikActions.setSubmitting(false);
    portalContext.updateDirtyState(false);
  };

  const hideDiscardConfirmDialog = () => {
    setIsDiscardConfirmDialogVisible(false);
  };
  const getBanner = () => {
    const bannerInfo = { message: '', type: MessageBarType.info };
    if (!hasWritePermissions) {
      bannerInfo.message = t('staticSite_readOnlyRbac');
    }
    return !!bannerInfo.message ? <CustomBanner message={bannerInfo.message} type={bannerInfo.type} /> : <></>;
  };

  const discard = () => {
    initEnvironmentVariables();
    hideDiscardConfirmDialog();
  };

  const initEnvironmentVariables = () => {
    //setEnvironmentVariables([...getInitialEnvironmentVariables()]);
  };

  const refresh = () => {
    setIsRefreshConfirmDialogVisible(false);
    //setSelectedEnvironment(undefined);
    //setFilter('');
    props.refresh();
  };

  const hideRefreshConfirmDialog = () => {
    setIsRefreshConfirmDialogVisible(false);
  };

  // const getInitialEnvironmentVariables = () => {
  //   if (!!selectedEnvironmentVariableResponse) {
  //     return sort(ConfigurationData.convertEnvironmentVariablesObjectToArray(selectedEnvironmentVariableResponse.properties));
  //   } else {
  //     return [];
  //   }
  // };

  useEffect(() => {
    initEnvironmentVariables();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEnvironmentVariableResponse]);

  const getConfirmDialogs = () => {
    return (
      <>
        <ConfirmDialog
          primaryActionButton={{
            title: t('ok'),
            onClick: discard,
          }}
          defaultActionButton={{
            title: t('cancel'),
            onClick: hideDiscardConfirmDialog,
          }}
          title={t('discardChangesTitle')}
          content={t('staticSite_discardChangesMesssage')}
          //   .format(
          //     !!selectedEnvironment ? ConfigurationData.getEnvironmentName(selectedEnvironment) : ''
          //   )}
          hidden={!isDiscardConfirmDialogVisible}
          onDismiss={hideDiscardConfirmDialog}
        />

        <ConfirmDialog
          primaryActionButton={{
            title: t('ok'),
            onClick: refresh,
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
              dirty={false}
              isLoading={isLoading}
              showDiscardConfirmDialog={() => setIsDiscardConfirmDialogVisible(true)}
              refresh={() => {
                if (true) {
                  setIsRefreshConfirmDialogVisible(true);
                } else {
                  refresh();
                }
              }}
            />
            {getBanner()}
            {getConfirmDialogs()}
          </div>
          <div>
            <ConfigurationPivot {...props} formProps={formProps} />
          </div>
        </form>
      )}
    </Formik>
  );
};

export default ConfigurationForm;
