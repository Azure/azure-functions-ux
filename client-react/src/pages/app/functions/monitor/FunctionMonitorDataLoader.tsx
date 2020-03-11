import React, { useState, useEffect, useContext } from 'react';
import FunctionMonitor from './FunctionMonitor';
import { AppInsightsComponent } from '../../../../models/app-insights';
import { ArmObj } from '../../../../models/arm-obj';
import AppInsightsService from '../../../../ApiHelpers/AppInsightsService';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { ArmSiteDescriptor } from '../../../../utils/resourceDescriptors';
import SiteService from '../../../../ApiHelpers/SiteService';
import { StartupInfoContext } from '../../../../StartupInfoContext';

interface FunctionMonitorDataLoaderProps {
  resourceId: string;
}

const FunctionMonitorDataLoader: React.FC<FunctionMonitorDataLoaderProps> = props => {
  const { resourceId } = props;
  const [appInsightsToken, setAppInsightsToken] = useState<string | undefined>(undefined);
  const [appInsightsComponent, setAppInsightsComponent] = useState<ArmObj<AppInsightsComponent> | undefined>(undefined);

  const startupInfoContext = useContext(StartupInfoContext);

  const fetchComponent = async () => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
    const siteResourceId = armSiteDescriptor.getTrimmedResourceId();
    const appSettingsResponse = await SiteService.fetchApplicationSettings(siteResourceId);

    if (appSettingsResponse.metadata.success && appSettingsResponse.data.properties) {
      const appSettings = appSettingsResponse.data.properties;
      const appInsightsConnectionString = appSettings[CommonConstants.AppSettingNames.appInsightsConnectionString];
      const appInsightsInstrumentationKey = appSettings[CommonConstants.AppSettingNames.appInsightsInstrumentationKey];

      const appInsightsResponse = await (appInsightsConnectionString
        ? AppInsightsService.getAppInsightsComponentFromConnectionString(appInsightsConnectionString, startupInfoContext.subscriptions)
        : appInsightsInstrumentationKey
        ? AppInsightsService.getAppInsightsComponentFromInstrumentationKey(appInsightsInstrumentationKey, startupInfoContext.subscriptions)
        : null);

      if (appInsightsResponse) {
        setAppInsightsComponent(appInsightsResponse as ArmObj<AppInsightsComponent>);
      }
    } else {
      LogService.error(
        LogCategories.FunctionMonitor,
        'fetchAppSetting',
        `Failed to fetch app setting: ${appSettingsResponse.metadata.error}`
      );
    }
  };

  const fetchToken = async (component: ArmObj<AppInsightsComponent>) => {
    AppInsightsService.getAppInsightsComponentToken(component.id).then(appInsightsComponentTokenResponse => {
      if (appInsightsComponentTokenResponse.metadata.success) {
        setAppInsightsToken(appInsightsComponentTokenResponse.data.token);
      } else {
        LogService.error(
          LogCategories.FunctionMonitor,
          'getAppInsightsComponentToken',
          `Failed to get App Insights Component Token: ${component.name}`
        );
      }
    });
  };

  const resetAppInsightsToken = () => {
    setAppInsightsToken(undefined);
  };

  useEffect(() => {
    fetchComponent();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (appInsightsComponent && !appInsightsToken) {
      fetchToken(appInsightsComponent);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsComponent, appInsightsToken]);

  return <FunctionMonitor resourceId={resourceId} resetAppInsightsToken={resetAppInsightsToken} appInsightsToken={appInsightsToken} />;
};

export default FunctionMonitorDataLoader;
