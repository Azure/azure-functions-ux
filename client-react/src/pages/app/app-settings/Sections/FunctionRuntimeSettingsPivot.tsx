import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { isEqual } from 'lodash-es';
import { style } from 'typestyle';
import { AppSettingsFormValues, AppSettingsFormProps } from '../AppSettings.types';
import { findFormAppSettingValue } from '../AppSettingsFormData';
import DailyUsageQuota from '../FunctionRuntimeSettings/DailyUsageQuota';
import HostJsonConfiguration from '../FunctionRuntimeSettings/HostJsonConfiguration';
import RuntimeVersion from '../FunctionRuntimeSettings/RuntimeVersion';
import RuntimeVersionBanner from '../FunctionRuntimeSettings/RuntimeVersionBanner';
import RuntimeScaleMonitoring from '../FunctionRuntimeSettings/RuntimeScaleMonitoring';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { PermissionsContext } from '../Contexts';
import { ThemeContext } from '../../../../ThemeContext';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { messageBannerStyle } from '../AppSettings.styles';
import { SiteStateContext } from '../../../../SiteState';

const tabContainerStyle = style({
  marginTop: '15px',
});

const FunctionRuntimeSettingsPivot: React.FC<AppSettingsFormProps> = props => {
  const siteStateContext = useContext(SiteStateContext);
  const { app_write, editable } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const scenarioChecker = new ScenarioService(t);
  const site = props.initialValues.site;

  return (
    <div id="function-runtime-settings" className={tabContainerStyle}>
      {(!app_write || !editable) && (
        <MessageBar
          id="function-runtime-settings-rbac-message"
          isMultiline={true}
          className={messageBannerStyle(theme, MessageBarType.warning)}
          messageBarType={MessageBarType.warning}>
          {t('readWritePermissionsRequired')}
        </MessageBar>
      )}

      {siteStateContext.stopped ? (
        <MessageBar
          isMultiline={true}
          className={messageBannerStyle(theme, MessageBarType.warning)}
          messageBarType={MessageBarType.warning}>
          {t('noRuntimeVersionWhileFunctionAppStopped')}
        </MessageBar>
      ) : (
        <>
          <RuntimeVersionBanner {...props} />
          <RuntimeVersion {...props} />
        </>
      )}

      {scenarioChecker.checkScenario(ScenarioIds.runtimeScaleMonitoringSupported, { site }).status === 'enabled' && (
        <RuntimeScaleMonitoring {...props} />
      )}

      {scenarioChecker.checkScenario(ScenarioIds.dailyUsageQuotaSupported, { site }).status === 'enabled' && <DailyUsageQuota {...props} />}

      <HostJsonConfiguration {...props} />
    </div>
  );
};

const runtimeVersionDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
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
