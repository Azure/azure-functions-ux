import { Formik, FormikProps } from 'formik';
import React, { useContext, useRef, useState } from 'react';
import { AppSettingsFormValues } from './AppSettings.types';
import AppSettingsCommandBar from './AppSettingsCommandBar';
import AppSettingsDataLoader from './AppSettingsDataLoader';
import AppSettingsForm from './AppSettingsForm';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import { useTranslation } from 'react-i18next';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import i18n from 'i18next';
import { PermissionsContext, SiteContext } from './Contexts';
import { commandBarSticky, formStyle } from './AppSettings.styles';
import UpsellBanner from '../../../components/UpsellBanner/UpsellBanner';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { MessageBarType } from '@fluentui/react';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { ServiceLinkerBladeResponse } from '../../../models/service-linker';
import { PortalContext } from '../../../PortalContext';
import { updateWebAppConfigForServiceLinker } from './AppSettings.utils';
import { BladeCloseReason, IBladeResult } from '../../../models/portal-models';
import { SiteStateContext } from '../../../SiteState';

const validate = (values: AppSettingsFormValues | null, t: i18n.TFunction, scenarioChecker: ScenarioService, site: ArmObj<Site>) => {
  if (!values) {
    return {};
  }

  const duplicateDefaultDocumentsValidation = (value: string) => {
    return values.config.properties.defaultDocuments.filter(v => v === value).length > 1 ? t('fieldMustBeUnique') : null;
  };

  const hasDuplicates = array => {
    return new Set(array).size !== array.length;
  };

  const isJavaApp = values.currentlySelectedStack === 'java';
  const defaultDocumentsEnabled =
    scenarioChecker.checkScenario(ScenarioIds.defaultDocumentsSupported, { site: values.site }).status !== 'disabled';
  let hasAnyError = false;

  const errors = {
    config: {
      properties: {} as any,
    },
  };

  if (scenarioChecker.checkScenario(ScenarioIds.skipStackValidation, { site }).status !== 'disabled') {
    if (isJavaApp && !values.config.properties.javaContainer) {
      hasAnyError = true;
      errors.config.properties.javaContainer = 'required';
    }
    if (isJavaApp && !values.config.properties.javaContainerVersion) {
      hasAnyError = true;
      errors.config.properties.javaContainerVersion = 'required';
    }
    if (isJavaApp && !values.config.properties.javaVersion) {
      hasAnyError = true;
      errors.config.properties.javaVersion = 'required';
    }
  }
  if (defaultDocumentsEnabled && hasDuplicates(values.config.properties.defaultDocuments)) {
    hasAnyError = true;
    errors.config.properties.defaultDocuments = values.config.properties.defaultDocuments.map(value => {
      return duplicateDefaultDocumentsValidation(value);
    });
  }

  return hasAnyError ? errors : {};
};

interface AppSettingsProps {
  resourceId: string;
  tab?: string;
}

const AppSettings: React.FC<AppSettingsProps> = props => {
  const { resourceId } = props;
  const { t } = useTranslation();
  const scenarioCheckerRef = useRef(new ScenarioService(t));
  const scenarioChecker = scenarioCheckerRef.current!;
  const [showRefreshConfirmDialog, setShowRefreshConfirmDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);

  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);

  const closeRefreshConfirmDialog = () => {
    setShowRefreshConfirmDialog(false);
  };

  const closeSaveConfirmDialog = () => {
    setShowSaveConfirmDialog(false);
  };

  const isServiceLinkerBladeResponseSucceeded = (response?: IBladeResult<ServiceLinkerBladeResponse>) => {
    return !!response && response.reason !== BladeCloseReason.userNavigation && !!response.data && response.data['isSucceeded'];
  };

  const onResourceConnectionClick = async (
    initialValues: AppSettingsFormValues | null,
    setInitialValues: (values: AppSettingsFormValues | null) => void,
    currentValues: AppSettingsFormValues,
    setCurrentValues: (values: AppSettingsFormValues) => void
  ) => {
    const response = await portalContext.openBlade<ServiceLinkerBladeResponse>({
      detailBlade: 'CreateLinkerBlade',
      detailBladeInputs: {
        sourceResourceId: resourceId,
      },
      extension: 'ServiceLinkerExtension',
      openAsContextBlade: true,
    });
    if (isServiceLinkerBladeResponseSucceeded(response)) {
      const webAppConfig = response.data['webAppConfiguration'];
      if (!!webAppConfig && !!initialValues) {
        updateWebAppConfigForServiceLinker(webAppConfig, initialValues, setInitialValues, setCurrentValues, currentValues);
      }
    }
  };

  const onServiceLinkerUpdateClick = async (
    settingName: string,
    initialValues: AppSettingsFormValues | null,
    setInitialValues: (values: AppSettingsFormValues | null) => void,
    currentValues: AppSettingsFormValues,
    setCurrentValues: (values: AppSettingsFormValues) => void
  ) => {
    const response = await portalContext.openBlade<ServiceLinkerBladeResponse>({
      detailBlade: 'UpdateLinkerBlade',
      detailBladeInputs: {
        sourceResourceId: resourceId,
        configName: settingName,
      },
      extension: 'ServiceLinkerExtension',
      openAsContextBlade: true,
    });
    if (isServiceLinkerBladeResponseSucceeded(response)) {
      const webAppConfig = response.data['webAppConfiguration'];
      if (!!webAppConfig && !!initialValues) {
        updateWebAppConfigForServiceLinker(webAppConfig, initialValues, setInitialValues, setCurrentValues, currentValues);
      }
    }
  };

  const onServiceLinkerDeleteClick = async (
    settingName: string,
    initialValues: AppSettingsFormValues | null,
    setInitialValues: (values: AppSettingsFormValues | null) => void,
    currentValues: AppSettingsFormValues,
    setCurrentValues: (values: AppSettingsFormValues) => void
  ) => {
    const response = await portalContext.openBlade<ServiceLinkerBladeResponse>({
      detailBlade: 'DeleteLinkerBlade',
      detailBladeInputs: {
        sourceResourceId: resourceId,
        configName: settingName,
      },
      extension: 'ServiceLinkerExtension',
      openAsContextBlade: true,
    });
    if (isServiceLinkerBladeResponseSucceeded(response)) {
      const webAppConfig = response.data['webAppConfiguration'];
      if (!!webAppConfig && !!initialValues) {
        updateWebAppConfigForServiceLinker(webAppConfig, initialValues, setInitialValues, setCurrentValues, currentValues, true);
      }
    }
  };

  const onEnvironmentVariablesMenuLinkClick = () => {
    portalContext.switchMenuItem({ menuItemId: 'environmentVariables' });
  };

  return (
    <AppSettingsDataLoader resourceId={resourceId}>
      {({ initialFormValues, onSubmit, scaleUpPlan, refreshAppSettings, setInitialValues, asyncData }) => (
        <PermissionsContext.Consumer>
          {permissions => {
            return (
              <SiteContext.Consumer>
                {site => {
                  return (
                    <Formik
                      initialValues={initialFormValues}
                      onSubmit={onSubmit}
                      enableReinitialize={true}
                      validate={values => validate(values, t, scenarioChecker, site)}
                      validateOnBlur={false}
                      validateOnChange={false}>
                      {(formProps: FormikProps<AppSettingsFormValues>) => (
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                          }}>
                          <div className={commandBarSticky}>
                            <AppSettingsCommandBar
                              onSave={() => setShowSaveConfirmDialog(true)}
                              resetForm={formProps.resetForm}
                              refreshAppSettings={() => setShowRefreshConfirmDialog(true)}
                              disabled={permissions.saving}
                              dirty={formProps.dirty}
                              onResourceConnectionClick={() =>
                                onResourceConnectionClick(initialFormValues, setInitialValues, formProps.values, formProps.setValues)
                              }
                            />
                            <ConfirmDialog
                              primaryActionButton={{
                                title: t('continue'),
                                onClick: () => {
                                  closeRefreshConfirmDialog();
                                  refreshAppSettings();
                                },
                              }}
                              defaultActionButton={{
                                title: t('cancel'),
                                onClick: closeRefreshConfirmDialog,
                              }}
                              title={t('refreshAppSettingsTitle')}
                              content={t('refreshAppSettingsMessage')}
                              hidden={!showRefreshConfirmDialog}
                              onDismiss={closeRefreshConfirmDialog}
                            />
                            <ConfirmDialog
                              primaryActionButton={{
                                title: t('continue'),
                                onClick: () => {
                                  closeSaveConfirmDialog();
                                  formProps.submitForm();
                                },
                              }}
                              defaultActionButton={{
                                title: t('cancel'),
                                onClick: closeSaveConfirmDialog,
                              }}
                              title={t('saveAppSettingsTitle')}
                              content={t('saveAppSettingsMessage')}
                              hidden={!showSaveConfirmDialog}
                              onDismiss={closeSaveConfirmDialog}
                            />
                            {!!initialFormValues &&
                              (scenarioChecker.checkScenario(ScenarioIds.showAppSettingsUpsell, { site }).status === 'enabled' ||
                                (scenarioChecker.checkScenario(ScenarioIds.enableCustomErrorPages, { site }).status !== 'disabled' &&
                                  scenarioChecker.checkScenario(ScenarioIds.enableCustomErrorPagesOverlay, { site }).status !==
                                    'disabled')) && (
                                <UpsellBanner
                                  onClick={scaleUpPlan}
                                  bannerMessage={
                                    scenarioChecker.checkScenario(ScenarioIds.showAppSettingsUpsell, { site }).status === 'enabled'
                                      ? t('appSettingsUpsellBannerMessage')
                                      : t('customErrorPageUpsellBannerMessage')
                                  }
                                />
                              )}

                            {!!initialFormValues &&
                              initialFormValues.references &&
                              !initialFormValues.references.appSettings &&
                              !siteStateContext.isKubeApp && (
                                <CustomBanner
                                  id="appSettings-keyvault-error"
                                  message={t('appSettingKeyvaultAPIError')}
                                  type={MessageBarType.error}
                                />
                              )}
                          </div>
                          {initialFormValues ? (
                            <>
                              <CustomBanner
                                type={MessageBarType.info}
                                message={t('directToEnvironmentVariablesInfoMessage')}
                                learnMoreText={t('directToEnvironmentVariablesLink')}
                                learnMoreLinkAriaLabel={t('directToEnvironmentVariablesLink')}
                                onClickLearnMoreLink={onEnvironmentVariablesMenuLinkClick}
                              />
                              <div className={formStyle}>
                                <AppSettingsForm
                                  asyncData={asyncData}
                                  tab={props.tab}
                                  onServiceLinkerUpdateClick={(settingName: string) =>
                                    onServiceLinkerUpdateClick(
                                      settingName,
                                      initialFormValues,
                                      setInitialValues,
                                      formProps.values,
                                      formProps.setValues
                                    )
                                  }
                                  onServiceLinkerDeleteClick={(settingName: string) =>
                                    onServiceLinkerDeleteClick(
                                      settingName,
                                      initialFormValues,
                                      setInitialValues,
                                      formProps.values,
                                      formProps.setValues
                                    )
                                  }
                                  {...formProps}
                                />
                              </div>
                            </>
                          ) : (
                            <CustomBanner message={t('configLoadFailure')} type={MessageBarType.error} />
                          )}
                        </form>
                      )}
                    </Formik>
                  );
                }}
              </SiteContext.Consumer>
            );
          }}
        </PermissionsContext.Consumer>
      )}
    </AppSettingsDataLoader>
  );
};

export default AppSettings;
