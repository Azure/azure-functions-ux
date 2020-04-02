import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { MessageBarType, Link } from 'office-ui-fabric-react';
import { FormikProps } from 'formik';
import ApplicationSettings from '../ApplicationSettings/ApplicationSettings';
import ConnectionStrings from '../ConnectionStrings/ConnectionStrings';
import { isEqual } from 'lodash-es';
import { PermissionsContext, SiteContext } from '../Contexts';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { Links } from '../../../../utils/FwLinks';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';

const ApplicationSettingsPivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();
  const { app_write } = useContext(PermissionsContext);
  const site = useContext(SiteContext);
  const scenarioChecker = new ScenarioService(t);
  const showFunctionAppMessage =
    scenarioChecker.checkScenario(ScenarioIds.showConnnectionStringFunctionInfo, { site }).status === 'enabled';
  return (
    <>
      <h3>{t('applicationSettings')}</h3>
      <p>
        <span id="application-settings-info-message">{t('applicationSettingsInfoMessage')}</span>
        <Link
          id="application-settings-info-learnMore"
          href={Links.applicationSettingsInfo}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="application-settings-info-message application-settings-info-learnMore">
          {` ${t('learnMore')}`}
        </Link>
      </p>
      {app_write ? (
        <div id="app-settings-application-settings-table">
          <ApplicationSettings {...props} />
        </div>
      ) : (
          <div id="app-settings-app-settings-rbac-message">
            <CustomBanner message={t('applicationSettingsNoPermission')} type={MessageBarType.warning} undocked={true} />
          </div>
        )}
      <h3>{t('connectionStrings')}</h3>
      <p>
        <span id="connection-strings-info-message">{t('connectionStringsInfoMessage')}</span>
        {showFunctionAppMessage && (
          <>
            <span id="func-conn-strings-info-text">{` ${t('funcConnStringsInfoText')} `}</span>
            <Link
              id="func-conn-strings-info-learnMore"
              href={Links.funcConnStringsLearnMore}
              target="_blank"
              className={learnMoreLinkStyle}
              aria-labelledby="connection-strings-info-message func-conn-strings-info-text func-conn-strings-info-learnMore">
              {` ${t('learnMore')}`}
            </Link>
          </>
        )}
      </p>
      {app_write ? (
        <div id="app-settings-connection-strings-table">
          <ConnectionStrings {...props} />
        </div>
      ) : (
          <div id="app-settings-connection-strings-rbac-message">
            <CustomBanner message={t('connectionStringsNoPermissions')} type={MessageBarType.warning} undocked={true} />
          </div>
        )}
    </>
  );
};

export const applicationSettingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.connectionStrings, initialValues.connectionStrings) || !isEqual(values.appSettings, initialValues.appSettings);
};
export default ApplicationSettingsPivot;
