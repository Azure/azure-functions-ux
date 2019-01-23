import React from 'react';

import { translate, InjectedTranslateProps } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { FormikProps } from 'formik';
import ApplicationSettings from '../ApplicationSettings/ApplicationSettings';
import ConnectionStrings from '../ConnectionStrings/ConnectionStrings';
import { isEqual } from 'lodash-es';

const ApplicationSettingsPivot: React.FC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps> = props => {
  const { t, values } = props;

  return (
    <>
      <h3>{t('applicationSettings')}</h3>
      {values.siteWritePermission ? (
        <div id="app-settings-application-settings-table">
          <ApplicationSettings {...props} />
        </div>
      ) : (
        <div id="app-settings-app-settings-rbac-message">
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
            You do not have permission to view application settings on this web app //TODO: GET BETTER STRING
          </MessageBar>
        </div>
      )}
      <h3>{t('connectionStrings')}</h3>
      {values.siteWritePermission ? (
        <div id="app-settings-connection-strings-table">
          <ConnectionStrings {...props} />
        </div>
      ) : (
        <div id="app-settings-connection-strings-rbac-message">
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
            You do not have permission to view connection strings on this web app //TODO: GET BETTER STRING
          </MessageBar>
        </div>
      )}
    </>
  );
};

export const applicationSettingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.connectionStrings, initialValues.connectionStrings) || !isEqual(values.appSettings, initialValues.appSettings);
};
export default translate('translation')(ApplicationSettingsPivot);
