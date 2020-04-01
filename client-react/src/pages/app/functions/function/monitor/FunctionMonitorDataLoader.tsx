import React, { useState, useEffect, useContext } from 'react';
import FunctionMonitor from './FunctionMonitor';
import { AppInsightsComponent } from '../../../../../models/app-insights';
import { ArmObj } from '../../../../../models/arm-obj';
import AppInsightsService from '../../../../../ApiHelpers/AppInsightsService';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
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

    const appInsightsResourceIdResponse = await AppInsightsService.getAppInsightsResourceId(
      siteResourceId,
      startupInfoContext.subscriptions
    );
    if (appInsightsResourceIdResponse.metadata.success) {
      const aiResourceId = appInsightsResourceIdResponse.data;
      if (!!aiResourceId) {
        const appInsightsResponse = await AppInsightsService.getAppInsights(aiResourceId);
        if (appInsightsResponse.metadata.success) {
          setAppInsightsComponent(appInsightsResponse.data);
        } else {
          LogService.error(
            LogCategories.functionLog,
            'getAppInsights',
            `Failed to get app insights: ${appInsightsResponse.metadata.error}`
          );
        }
      }
    } else {
      LogService.error(
        LogCategories.functionLog,
        'getAppInsightsResourceId',
        `Failed to get app insights resource Id: ${appInsightsResourceIdResponse.metadata.error}`
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
