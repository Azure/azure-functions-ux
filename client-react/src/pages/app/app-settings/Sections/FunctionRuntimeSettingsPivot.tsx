import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues, FormAppSetting } from '../AppSettings.types';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { FormikProps } from 'formik';
import FunctionRuntimeSettings from '../FunctionRuntimeSettings/FunctionRuntimeSettings';
import { isEqual } from 'lodash-es';
import { PermissionsContext } from '../Contexts';

const FunctionRuntimeSettingsPivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();
  const { app_write } = useContext(PermissionsContext);

  return (
    <>
      {app_write ? (
        <div id="function-runtime-settings">
          <FunctionRuntimeSettings {...props} />
        </div>
      ) : (
        <div id="function-runtime-settings-rbac-message">
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
            {t('applicationSettingsNoPermission')}
          </MessageBar>
        </div>
      )}
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
  const clean = (value === null && initialValue === null) || value === initialValue;
  return !clean;
};

const editModeDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  const value = getSettingValue('FUNCTION_APP_EDIT_MODE', values.appSettings);
  const initialValue = getSettingValue('FUNCTION_APP_EDIT_MODE', initialValues.appSettings);
  const clean = (value === null && initialValue === null) || value === initialValue;
  return !clean;
};

const dailyMemoryTimeQuotaDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.site.properties.dailyMemoryTimeQuota, initialValues.site.properties.dailyMemoryTimeQuota);
};

export const functionRuntimeSettingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return (
    runtimeVersionDirty(values, initialValues) || editModeDirty(values, initialValues) || dailyMemoryTimeQuotaDirty(values, initialValues)
  );
};
export default FunctionRuntimeSettingsPivot;
