import React, { useContext, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { MessageBar, MessageBarType, Icon, Link, Stack } from 'office-ui-fabric-react';
import { FormikProps } from 'formik';
import ApplicationSettings from '../ApplicationSettings/ApplicationSettings';
import ConnectionStrings from '../ConnectionStrings/ConnectionStrings';
import { isEqual } from 'lodash-es';
import { PermissionsContext, SiteContext, BannerMessageContext } from '../Contexts';
import { infoIconStyle, learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { ThemeContext } from '../../../../ThemeContext';
import { Links } from '../../../../utils/FwLinks';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';

const ApplicationSettingsPivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();
  const { app_write } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);
  const site = useContext(SiteContext);
  const scenarioChecker = new ScenarioService(t);
  const showFunctionAppMessage =
    scenarioChecker.checkScenario(ScenarioIds.showConnnectionStringFunctionInfo, { site }).status === 'enabled';

  const bannerMessageContext = useContext(BannerMessageContext);
  useEffect(() => {
    if (!!props.initialValues && props.initialValues.references && !props.initialValues.references.appSettings) {
      bannerMessageContext.updateBanner({
        type: MessageBarType.error,
        text: t('appSettingKeyvaultAPIError'),
      });
    } else {
      bannerMessageContext.updateBanner();
    }
  }, []);

  return (
    <>
      <h3>{t('applicationSettings')}</h3>
      <Stack horizontal verticalAlign="center">
        <Icon iconName="Info" className={infoIconStyle(theme)} />
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
      </Stack>
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
      <Stack horizontal verticalAlign="center">
        <Icon iconName="Info" className={infoIconStyle(theme)} />
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
      </Stack>
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

const removeIndex = (objects: any[]) => {
  return objects.map(c => ({ ...c, index: undefined })).sort((a, b) => (a.name >= b.name ? 1 : 0));
};

export const applicationSettingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return (
    !isEqual(removeIndex(values.connectionStrings), removeIndex(initialValues.connectionStrings)) ||
    !isEqual(removeIndex(values.appSettings), removeIndex(initialValues.appSettings))
  );
};
export default ApplicationSettingsPivot;
