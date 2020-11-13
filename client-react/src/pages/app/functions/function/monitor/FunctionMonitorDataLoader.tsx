import React, { useState, useEffect, useContext } from 'react';
import FunctionMonitor from './FunctionMonitor';
import { AppInsightsComponent, AppInsightsKeyType } from '../../../../../models/app-insights';
import { ArmObj } from '../../../../../models/arm-obj';
import AppInsightsService from '../../../../../ApiHelpers/AppInsightsService';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { PortalContext } from '../../../../../PortalContext';

interface FunctionMonitorDataLoaderProps {
  resourceId: string;
}

const FunctionMonitorDataLoader: React.FC<FunctionMonitorDataLoaderProps> = props => {
  const { resourceId } = props;
  const [appInsightsToken, setAppInsightsToken] = useState<string | undefined>(undefined);
  const [appInsightsComponent, setAppInsightsComponent] = useState<ArmObj<AppInsightsComponent> | undefined | null>(undefined);
  const [appInsightsKeyType, setAppInsightsKeyType] = useState<AppInsightsKeyType | undefined>(undefined);
  const [functionInfo, setFunctionInfo] = useState<ArmObj<FunctionInfo> | undefined>(undefined);

  const startupInfoContext = useContext(StartupInfoContext);
  const portalContext = useContext(PortalContext);

  const fetchData = async () => {
    const functionInfoResponse = await FunctionsService.getFunction(resourceId);
    if (functionInfoResponse.metadata.success) {
      setFunctionInfo(functionInfoResponse.data);
    } else {
      LogService.error(
        LogCategories.functionLog,
        'getFunction',
        `Failed to get function info: ${getErrorMessageOrStringify(functionInfoResponse.metadata.error)}`
      );
    }
  };

  const fetchAppInsightsComponent = async (force?: boolean) => {
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
            `Failed to get app insights: ${getErrorMessageOrStringify(appInsightsResponse.metadata.error)}`
          );
        }
      }
    } else {
      setAppInsightsComponent(null);
      LogService.error(
        LogCategories.functionLog,
        'getAppInsightsResourceId',
        `Failed to get app insights resource Id: ${getErrorMessageOrStringify(appInsightsResourceIdResponse.metadata.error)}`
      );
    }

    setAppInsightsKeyType(appInsightsResourceIdResponse.metadata.appInsightsKeyType);
  };

  const fetchToken = async () => {
    AppInsightsService.getAppInsightsToken(portalContext).then(appInsightsTokenResponse => {
      if (appInsightsTokenResponse) {
        setAppInsightsToken(appInsightsTokenResponse);
      } else {
        LogService.error(LogCategories.FunctionMonitor, 'getAppInsightsToken', `Failed to get App Insights Component Token`);
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
    fetchData();
    fetchAppInsightsComponent();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!appInsightsComponent) {
      fetchAppInsightsComponent(true);
    } else if (!appInsightsToken) {
      fetchToken();
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
      appInsightsKeyType={appInsightsKeyType}
      functionInfo={functionInfo}
    />
  );
};

export default FunctionMonitorDataLoader;
