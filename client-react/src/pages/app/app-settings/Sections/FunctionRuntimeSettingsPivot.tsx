import { MessageBarType } from '@fluentui/react';
import { isEqual } from 'lodash';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';

import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { SiteStateContext } from '../../../../SiteState';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { AppSettingsFormProps, AppSettingsFormValues } from '../AppSettings.types';
import { findFormAppSettingValue } from '../AppSettingsFormData';
import { PermissionsContext } from '../Contexts';
import DailyUsageQuota from '../FunctionRuntimeSettings/DailyUsageQuota';
import RuntimeScaleMonitoring from '../FunctionRuntimeSettings/RuntimeScaleMonitoring';
import RuntimeVersionNew from '../FunctionRuntimeSettings/RuntimeVersionNew';

const tabContainerStyle = style({
  marginTop: '15px',
});

const FunctionRuntimeSettingsPivot: React.FC<AppSettingsFormProps> = props => {
  const siteStateContext = useContext(SiteStateContext);
  const { app_write, editable } = useContext(PermissionsContext);
  const { t } = useTranslation();
  const scenarioChecker = new ScenarioService(t);
  const site = props.initialValues.site;

  const getRuntimeVersionComponent = () => {
    return <RuntimeVersionNew {...props} />;
  };

  return (
    <div id="function-runtime-settings" className={tabContainerStyle}>
      {(!app_write || !editable) && (
        <CustomBanner
          id="function-runtime-settings-rbac-message"
          message={t('readWritePermissionsRequired')}
          type={MessageBarType.warning}
        />
      )}

      {scenarioChecker.checkScenario(ScenarioIds.showRuntimeVersionSetting, { site }).status !== 'disabled' &&
        (siteStateContext.stopped ? (
          <CustomBanner message={t('noRuntimeVersionWhileFunctionAppStopped')} type={MessageBarType.warning} undocked={true} />
        ) : (
          getRuntimeVersionComponent()
        ))}

      {scenarioChecker.checkScenario(ScenarioIds.runtimeScaleMonitoringSupported, { site }).status === 'enabled' && (
        <RuntimeScaleMonitoring {...props} />
      )}

      {scenarioChecker.checkScenario(ScenarioIds.dailyUsageQuotaSupported, { site }).status === 'enabled' && <DailyUsageQuota {...props} />}
    </div>
  );
};

export const runtimeVersionDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  const currentValue = findFormAppSettingValue(values.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion) || '';
  const initialValue = findFormAppSettingValue(initialValues.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion) || '';
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
