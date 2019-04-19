import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { FormikProps } from 'formik';
import ApplicationSettings from '../ApplicationSettings/ApplicationSettings';
import ConnectionStrings from '../ConnectionStrings/ConnectionStrings';
import { isEqual } from 'lodash-es';
import { PermissionsContext } from '../Contexts';

const ApplicationSettingsPivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();
  const { app_write } = useContext(PermissionsContext);
  return (
    <>
      <h3>{t('applicationSettings')}</h3>
      {app_write ? (
        <div id="app-settings-application-settings-table">
          <ApplicationSettings {...props} />
        </div>
      ) : (
        <div id="app-settings-app-settings-rbac-message">
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
            {t('applicationSettingsNoPermission')}
          </MessageBar>
        </div>
      )}
      <h3>{t('connectionStrings')}</h3>
      {app_write ? (
        <div id="app-settings-connection-strings-table">
          <ConnectionStrings {...props} />
        </div>
      ) : (
        <div id="app-settings-connection-strings-rbac-message">
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
            {t('connectionStringsNoPermissions')}
          </MessageBar>
        </div>
      )}
    </>
  );
};

export const applicationSettingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.connectionStrings, initialValues.connectionStrings) || !isEqual(values.appSettings, initialValues.appSettings);
};
export default ApplicationSettingsPivot;
