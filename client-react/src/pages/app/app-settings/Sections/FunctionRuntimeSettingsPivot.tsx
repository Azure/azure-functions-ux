import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues, FunctionsRuntimeMajorVersions } from '../AppSettings.types';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { FormikProps } from 'formik';
import RuntimeVersion from '../FunctionRuntimeSettings/RuntimeVersion';
import { isEqual } from 'lodash-es';
import { PermissionsContext } from '../Contexts';
import DailyUsageQuota from '../FunctionRuntimeSettings/DailyUsageQuota';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import RuntimeScaleMonitoring from '../FunctionRuntimeSettings/RuntimeScaleMonitoring';
import { getFunctionsRuntimeMajorVersion, findFormAppSetting } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';

const FunctionRuntimeSettingsPivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();
  const scenarioChecker = new ScenarioService(t);
  const { app_write, editable } = useContext(PermissionsContext);
  const site = props.initialValues.site;

  if (!site) {
    return null;
  }

  return (
    <>
      <div id="function-runtime-settings">
        {(!app_write || !editable) && (
          <div id="function-runtime-settings-rbac-message">
            <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
              {t('applicationSettingsNoPermission')}
            </MessageBar>
          </div>
        )}

        {site.properties.state && site.properties.state.toLocaleLowerCase() === 'Running'.toLocaleLowerCase() && (
          <RuntimeVersion {...props} />
        )}

        {scenarioChecker.checkScenario(ScenarioIds.runtimeScaleMonitoringSupported, { site }).status === 'enabled' && (
          <RuntimeScaleMonitoring {...props} />
        )}

        {scenarioChecker.checkScenario(ScenarioIds.dailyUsageQuotaSupported, { site }).status === 'enabled' && (
          <DailyUsageQuota {...props} />
        )}
      </div>
    </>
  );
};

const runtimeVersionDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  const current = findFormAppSetting(values.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
  const initial = findFormAppSetting(initialValues.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);

  const currentValue = (current && current.value) || '';
  const initialValue = (initial && initial.value) || '';
  return !isEqual(currentValue, initialValue);
};

const dailyMemoryTimeQuotaDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.site.properties.dailyMemoryTimeQuota, initialValues.site.properties.dailyMemoryTimeQuota);
};

const runtimeScaleMonitoringDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(
    values.config.properties.functionsRuntimeScaleMonitoringEnabled,
    initialValues.config.properties.functionsRuntimeScaleMonitoringEnabled
  );
};

export const functionRuntimeSettingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return (
    runtimeVersionDirty(values, initialValues) ||
    dailyMemoryTimeQuotaDirty(values, initialValues) ||
    runtimeScaleMonitoringDirty(values, initialValues)
  );
};

export const functionRuntimeSettingsError = (values: AppSettingsFormValues) => {
  return (
    values.functionsRuntimeVersionInfo.isCustom &&
    getFunctionsRuntimeMajorVersion(values.functionsRuntimeVersionInfo.latestCustomValue) !== FunctionsRuntimeMajorVersions.custom
  );
};

export default FunctionRuntimeSettingsPivot;
