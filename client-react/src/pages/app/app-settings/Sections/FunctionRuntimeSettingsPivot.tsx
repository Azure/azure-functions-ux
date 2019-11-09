import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues, AppSettingsFormProps } from '../AppSettings.types';
import RuntimeVersion from '../FunctionRuntimeSettings/RuntimeVersion';
import { isEqual } from 'lodash-es';
import DailyUsageQuota from '../FunctionRuntimeSettings/DailyUsageQuota';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import RuntimeScaleMonitoring from '../FunctionRuntimeSettings/RuntimeScaleMonitoring';
import { findFormAppSetting } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';

const FunctionRuntimeSettingsPivot: React.FC<AppSettingsFormProps> = props => {
  const { t } = useTranslation();
  const scenarioChecker = new ScenarioService(t);
  const site = props.initialValues.site;

  if (!site) {
    return null;
  }

  return (
    <>
      <div id="function-runtime-settings">
        {site.properties.state && site.properties.state.toLocaleLowerCase() === CommonConstants.SiteStates.running.toLocaleLowerCase() && (
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

export default FunctionRuntimeSettingsPivot;
