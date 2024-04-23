import React, { useRef, useMemo } from 'react';
import Platform from '../GeneralSettings/Platform';
import SlotAutoSwap from '../GeneralSettings/SlotAutoSwap';
import Stacks from '../GeneralSettings/Stacks';
import { settingsWrapper } from '../AppSettingsForm';
import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { FormikProps } from 'formik';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import DebuggingWindows from '../GeneralSettings/DebuggingWindows';
import DebuggingLinux from '../GeneralSettings/DebuggingLinux';
import { isEqual } from 'lodash-es';
import ClientCert from '../GeneralSettings/ClientCert/ClientCert';
import { DeploymentCenterConstants } from '../../deployment-center/DeploymentCenterConstants';
import StringUtils from '../../../../utils/string';

const GeneralSettings: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { values } = props;
  const { site } = values;
  const { t } = useTranslation();
  const scenarioCheckerRef = useRef(new ScenarioService(t));
  const scenarioChecker = scenarioCheckerRef.current!;

  const getDebuggingRender = () => {
    if (scenarioChecker.checkScenario(ScenarioIds.windowsRemoteDebuggingSupported, { site }).status !== 'disabled') {
      return <DebuggingWindows {...props} />;
    }
    if (scenarioChecker.checkScenario(ScenarioIds.linuxRemoteDebuggingSupported, { site }).status === 'enabled') {
      return <DebuggingLinux {...props} />;
    }
    return null;
  };

  const isSiteContainer = useMemo(() => {
    return values.config?.properties.linuxFxVersion
      ? StringUtils.equalsIgnoreCase(values.config?.properties.linuxFxVersion, DeploymentCenterConstants.sitecontainers)
      : false;
  }, [values.config?.properties.linuxFxVersion]);

  return (
    <>
      {!isSiteContainer && <Stacks {...props} />}
      {/* NOTE (krmitta): Need to hide platform settings except TLS settings for KubeApp as elements within are not shown */}
      <>
        <h3>{t('platformSettings')}</h3>
        <div className={settingsWrapper}>
          <Platform {...props} />
        </div>
      </>
      {getDebuggingRender()}
      <SlotAutoSwap {...props} />
      <ClientCert {...props} />
    </>
  );
};

const autoSwapDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.config.properties.autoSwapSlotName, initialValues.config.properties.autoSwapSlotName);
};
const remoteDebuggingDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return (
    !isEqual(values.config.properties.remoteDebuggingEnabled, initialValues.config.properties.remoteDebuggingEnabled) ||
    !isEqual(values.config.properties.remoteDebuggingVersion, initialValues.config.properties.remoteDebuggingVersion)
  );
};
const platformDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return (
    !isEqual(values.config.properties.use32BitWorkerProcess, initialValues.config.properties.use32BitWorkerProcess) ||
    !isEqual(values.config.properties.managedPipelineMode, initialValues.config.properties.managedPipelineMode) ||
    !isEqual(values.config.properties.ftpsState, initialValues.config.properties.ftpsState) ||
    !isEqual(values.config.properties.http20Enabled, initialValues.config.properties.http20Enabled) ||
    !isEqual(values.config.properties.http20ProxyFlag, initialValues.config.properties.http20ProxyFlag) ||
    !isEqual(values.config.properties.alwaysOn, initialValues.config.properties.alwaysOn) ||
    !isEqual(values.site.properties.clientAffinityEnabled, initialValues.site.properties.clientAffinityEnabled) ||
    !isEqual(values.config.properties.webSocketsEnabled, initialValues.config.properties.webSocketsEnabled) ||
    !isEqual(values.config.properties.minTlsCipherSuite, initialValues.config.properties.minTlsCipherSuite) ||
    !isEqual(!!values.site.properties.endToEndEncryptionEnabled, !!initialValues.site.properties.endToEndEncryptionEnabled)
  );
};

const stackDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return (
    !isEqual(values.currentlySelectedStack, initialValues.currentlySelectedStack) ||
    !isEqual(values.config.properties.pythonVersion, initialValues.config.properties.pythonVersion) ||
    !isEqual(values.config.properties.javaContainer, initialValues.config.properties.javaContainer) ||
    !isEqual(values.config.properties.javaContainerVersion, initialValues.config.properties.javaContainerVersion) ||
    !isEqual(values.config.properties.javaVersion, initialValues.config.properties.javaVersion) ||
    !isEqual(values.config.properties.netFrameworkVersion, initialValues.config.properties.netFrameworkVersion) ||
    !isEqual(values.config.properties.phpVersion, initialValues.config.properties.phpVersion) ||
    !isEqual(values.config.properties.linuxFxVersion, initialValues.config.properties.linuxFxVersion) ||
    !isEqual(values.config.properties.appCommandLine, initialValues.config.properties.appCommandLine)
  );
};
export const generalSettingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return (
    stackDirty(values, initialValues) ||
    platformDirty(values, initialValues) ||
    remoteDebuggingDirty(values, initialValues) ||
    autoSwapDirty(values, initialValues)
  );
};

// Error state only really needs to check for validatable properties, most properties can't error
const stackError = (errors: any) => {
  const javaContainer = errors && errors.config && errors.config.properties && errors.config.properties.javaContainer;
  const javaContainerVersion = errors && errors.config && errors.config.properties && errors.config.properties.javaContainerVersion;
  const javaVersion = errors && errors.config && errors.config.properties && errors.config.properties.javaVersion;
  return !!javaContainer || !!javaContainerVersion || !!javaVersion;
};
export const generalSettingsError = (errors: any) => {
  return stackError(errors);
};

export default GeneralSettings;
