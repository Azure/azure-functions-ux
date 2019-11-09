import React from 'react';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { isEqual } from 'lodash-es';
import DailyUsageQuota from '../FunctionRuntimeSettings/DailyUsageQuota';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { style } from 'typestyle';

const tabContainerStyle = style({
  marginTop: '15px',
});

const FunctionRuntimeSettingsPivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();
  const scenarioChecker = new ScenarioService(t);
  const site = props.initialValues.site;

  if (!site) {
    return null;
  }

  return (
    <>
      <div id="function-runtime-settings" className={tabContainerStyle}>
        {scenarioChecker.checkScenario(ScenarioIds.dailyUsageQuotaSupported, { site }).status === 'enabled' && (
          <DailyUsageQuota {...props} />
        )}
      </div>
    </>
  );
};

const dailyMemoryTimeQuotaDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.site.properties.dailyMemoryTimeQuota, initialValues.site.properties.dailyMemoryTimeQuota);
};

export const functionRuntimeSettingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return dailyMemoryTimeQuotaDirty(values, initialValues);
};

export default FunctionRuntimeSettingsPivot;
