import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { FormikProps } from 'formik';
import RuntimeVersion from '../FunctionRuntimeSettings/RuntimeVersion';
import { isEqual } from 'lodash-es';
import { PermissionsContext } from '../Contexts';
import DailyUsageQuota from '../FunctionRuntimeSettings/DailyUsageQuota';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import RuntimeScaleMonitoring from '../FunctionRuntimeSettings/RuntimeScaleMonitoring';
import { findFormAppSetting } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { messageBannerStyle } from '../AppSettings.styles';
import { ThemeContext } from '../../../../ThemeContext';
import CurrentRuntimeVersion from '../FunctionRuntimeSettings/CurrentRuntimeVersion';

/*

!write_app


!exactRuntimeVersion && !runtimeVersion
	Banner: '{0}' application setting is missing from your app. Without this setting you will always be running the latest version of the runtime even across major version updates which might contain breaking changes. It is advised to set that value to a specific major version (e.g. ~2) and you will get notified with newer versions for update.
	Current Runtime Version: Loading... | Failed to load.

!exactRuntimeVersion && !!runtimeVersion && isValid
	Banner: ''
	Current Runtime Version: Loading... | Failed to load.

!exactRuntimeVersion && !!runtimeVersion && !isValid -> Can't determine this?
	Banner: Your custom runtime version ({0}) is not supported. As a result the latest runtime version is being used.
	Current Runtime Version: Loading... | Failed to load.


!!exactRuntimeVersion && !runtimeVersion
	Banner: '{0}' application setting is missing from your app. Without this setting you will always be running the latest version of the runtime even across major version updates which might contain breaking changes. It is advised to set that value to a specific major version (e.g. ~2) and you will get notified with newer versions for update.
	Current Runtime Version: Loading... | {exactRuntimeVersion}

!!exactRuntimeVersion && !!runtimeVersion && isValid && !needsUpdate
	Banner: ''
	Current Runtime Version: Loading... | {exactRuntimeVersion}

!!exactRuntimeVersion && !!runtimeVersion && isValid && needsUpdate
	Banner: You are currently pinned to runtime version: {{exactExtensionVersion}}. You may update to unpin and use the latest: ({{latestExtensionVersion}}).
	Current Runtime Version: Loading... | {exactRuntimeVersion}

!!exactRuntimeVersion && !!runtimeVersion && !isValid
	Banner: Your custom runtime version ({0}) is not supported. As a result the latest runtime version ({1}) is being used.
	Current Runtime Version: Loading... | {exactRuntimeVersion}
*/

const FunctionRuntimeSettingsPivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();
  const scenarioChecker = new ScenarioService(t);
  const { app_write, editable } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);
  const site = props.initialValues.site;

  if (!site) {
    return null;
  }

  return (
    <>
      <div id="function-runtime-settings">
        {(!app_write || !editable) && (
          <div id="function-runtime-settings-rbac-message">
            <MessageBar
              isMultiline={false}
              className={messageBannerStyle(theme, MessageBarType.warning)}
              messageBarType={MessageBarType.warning}>
              {t('readWritePermissionsRequired')}
            </MessageBar>
          </div>
        )}

        <CurrentRuntimeVersion {...props} />

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
