import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues, FormAppSetting } from '../AppSettings.types';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { FormikProps } from 'formik';
import RuntimeVersion from '../FunctionRuntimeSettings/RuntimeVersion';
import { isEqual } from 'lodash-es';
import { PermissionsContext } from '../Contexts';
import DailyUsageQuota from '../FunctionRuntimeSettings/DailyUsageQuota';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import RuntimeScaleMonitoring from '../FunctionRuntimeSettings/RuntimeScaleMonitoring';

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

        <RuntimeVersion {...props} />

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

const getSettingValue = (name: string, appSettings: FormAppSetting[]): string | null => {
  const index = !name ? -1 : appSettings.findIndex(x => x.name.toLowerCase() === name.toLowerCase());
  return index === -1 ? null : appSettings[index].value;
};

const runtimeVersionDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  const value = getSettingValue('FUNCTIONS_EXTENSION_VERSION', values.appSettings);
  const initialValue = getSettingValue('FUNCTIONS_EXTENSION_VERSION', initialValues.appSettings);
  // const clean = (value === null && initialValue === null) || value === initialValue;
  // return !clean;
  return !isEqual(value, initialValue);
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
