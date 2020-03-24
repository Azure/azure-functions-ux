import React, { useState, useEffect, useContext } from 'react';
import FunctionMonitor from './FunctionMonitor';
import { AppInsightsComponent } from '../../../../../models/app-insights';
import { ArmObj } from '../../../../../models/arm-obj';
import AppInsightsService from '../../../../../ApiHelpers/AppInsightsService';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import SiteService from '../../../../../ApiHelpers/SiteService';
import { StartupInfoContext } from '../../../../../StartupInfoContext';

interface FunctionMonitorDataLoaderProps {
  resourceId: string;
}

const FunctionMonitorDataLoader: React.FC<FunctionMonitorDataLoaderProps> = props => {
  const { resourceId } = props;
  const [appInsightsToken, setAppInsightsToken] = useState<string | undefined>(undefined);
  const [appInsightsComponent, setAppInsightsComponent] = useState<ArmObj<AppInsightsComponent> | undefined | null>(undefined);

  const startupInfoContext = useContext(StartupInfoContext);

  const fetchComponent = async (force?: boolean) => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
    const siteResourceId = armSiteDescriptor.getTrimmedResourceId();
    const appSettingsResponse = await SiteService.fetchApplicationSettings(siteResourceId, force);

    if (appSettingsResponse.metadata.success && appSettingsResponse.data.properties) {
      const appSettings = appSettingsResponse.data.properties;
      const appInsightsConnectionString = appSettings[CommonConstants.AppSettingNames.appInsightsConnectionString];
      const appInsightsInstrumentationKey = appSettings[CommonConstants.AppSettingNames.appInsightsInstrumentationKey];

      const appInsightsResponse = appInsightsConnectionString
        ? await AppInsightsService.getAppInsightsComponentFromConnectionString(
            appInsightsConnectionString,
            startupInfoContext.subscriptions
          )
        : appInsightsInstrumentationKey
        ? await AppInsightsService.getAppInsightsComponentFromInstrumentationKey(
            appInsightsInstrumentationKey,
            startupInfoContext.subscriptions
          )
        : null;

      setAppInsightsComponent(appInsightsResponse);
    } else {
      LogService.error(
        LogCategories.FunctionMonitor,
        'fetchAppSettings',
        `Failed to fetch app settings: ${appSettingsResponse.metadata.error}`
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

  const resetAppInsightsComponent = () => {
    setAppInsightsComponent(undefined);
  };

  const resetAppInsightsToken = () => {
    setAppInsightsToken(undefined);
  };

  useEffect(() => {
    fetchComponent();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!appInsightsComponent) {
      fetchComponent(true);
    } else if (!appInsightsToken) {
      fetchToken(appInsightsComponent);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsComponent, appInsightsToken]);

  return (
    <FunctionMonitor
      resourceId={resourceId}
      resetAppInsightsComponent={resetAppInsightsComponent}
      resetAppInsightsToken={resetAppInsightsToken}
      appInsightsComponent={appInsightsComponent}
      appInsightsToken={appInsightsToken}
    />
  );
};

export default FunctionMonitorDataLoader;
