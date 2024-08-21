import React, { useState, useEffect, useContext } from 'react';
import FunctionMonitor from './FunctionMonitor';
import { AppInsightsComponent, AppInsightsKeyType } from '../../../../../models/app-insights';
import { ArmObj } from '../../../../../models/arm-obj';
import AppInsightsService from '../../../../../ApiHelpers/AppInsightsService';
import LogService from '../../../../../utils/LogService';
import SiteService from '../../../../../ApiHelpers/SiteService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { PortalContext } from '../../../../../PortalContext';
import { SiteStateContext } from '../../../../../SiteState';
import { FunctionAppEditMode } from '../../../../../models/portal-models';

interface FunctionMonitorDataLoaderProps {
  resourceId: string;
}

const FunctionMonitorDataLoader: React.FC<FunctionMonitorDataLoaderProps> = props => {
  const { resourceId } = props;
  const [appInsightsToken, setAppInsightsToken] = useState<string | undefined>(undefined);
  const [appInsightsComponent, setAppInsightsComponent] = useState<ArmObj<AppInsightsComponent> | undefined | null>(undefined);
  const [appInsightsKeyType, setAppInsightsKeyType] = useState<AppInsightsKeyType | undefined>(undefined);
  const [functionInfo, setFunctionInfo] = useState<ArmObj<FunctionInfo> | undefined>(undefined);
  const [errorFetchingAppInsightsComponent, setErrorFetchingAppInsightsComponent] = useState(false);

  const startupInfoContext = useContext(StartupInfoContext);
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);
  const { site, siteAppEditState } = siteStateContext;

  const fetchFunctionInfo = async () => {
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

  const fetchAppInsightsComponent = async () => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
    const siteResourceId = armSiteDescriptor.getTrimmedResourceId();
    const appSettingsPromise = SiteService.fetchApplicationSettings(siteResourceId);
    const tagsProperty = site?.tags;
    const hasWritePermission =
      siteAppEditState !== FunctionAppEditMode.ReadOnlyLock && siteAppEditState !== FunctionAppEditMode.ReadOnlyRbac;

    const appInsightsData = await AppInsightsService.getAppInsightsResourceAndUpdateTags(
      siteResourceId,
      LogCategories.FunctionMonitor,
      appSettingsPromise,
      tagsProperty,
      startupInfoContext.subscriptions,
      hasWritePermission
    );

    if (appInsightsData?.data?.metadata.success) {
      setErrorFetchingAppInsightsComponent(false);
      setAppInsightsComponent(appInsightsData.data.data);
    } else {
      setErrorFetchingAppInsightsComponent(true);
      setAppInsightsComponent(null);
      LogService.error(
        LogCategories.functionLog,
        'getAppInsights',
        `Failed to get app insights: ${getErrorMessageOrStringify(appInsightsData?.data?.metadata.error)}`
      );
    }

    setAppInsightsKeyType(appInsightsData?.appInsightsKeyType);
  };

  const fetchAppInsightsToken = async () => {
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
    fetchFunctionInfo();
    fetchAppInsightsToken();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!appInsightsComponent) {
      fetchAppInsightsComponent();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsComponent]);

  useEffect(() => {
    if (!appInsightsToken) {
      fetchAppInsightsToken();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsToken]);

  return (
    <FunctionMonitor
      resourceId={resourceId}
      resetAppInsightsComponent={resetAppInsightsComponent}
      resetAppInsightsToken={resetAppInsightsToken}
      appInsightsComponent={appInsightsComponent}
      appInsightsToken={appInsightsToken}
      appInsightsKeyType={appInsightsKeyType}
      functionInfo={functionInfo}
      errorFetchingAppInsightsComponent={errorFetchingAppInsightsComponent}
    />
  );
};

export default FunctionMonitorDataLoader;
