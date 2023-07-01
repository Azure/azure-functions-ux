import React, { useContext, useEffect, useState } from 'react';

import AppInsightsService from '../../../../ApiHelpers/AppInsightsService';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { AppInsightsComponent } from '../../../../models/app-insights';
import { ArmObj } from '../../../../models/arm-obj';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import { StartupInfoContext } from '../../../../StartupInfoContext';
import { isLinuxDynamic } from '../../../../utils/arm-utils';
import { ArmSiteDescriptor } from '../../../../utils/resourceDescriptors';
import { getTelemetryInfo } from '../../../../utils/TelemetryUtils';
import FunctionLogAppInsightsDataLoader from '../../functions/function/function-log/FunctionLogAppInsightsDataLoader';
import AppInsightsSetup from '../../functions/function/monitor/AppInsightsSetup';
import { LoggingOptions } from '../function/function-editor/FunctionEditor.types';
import { logCommandBarHeight, minimumLogPanelHeight } from '../function/function-log/FunctionLog.styles';
import FunctionLogFileStreamDataLoader from '../function/function-log/FunctionLogFileStreamDataLoader';

import { paddingStyle } from './LogStream.styles';

export interface LogStreamDataLoaderProps {
  resourceId: string;
}

const LogStreamDataLoader: React.FC<LogStreamDataLoaderProps> = props => {
  const { resourceId } = props;

  const siteStateContext = useContext(SiteStateContext);
  const startupInfoContext = useContext(StartupInfoContext);
  const portalContext = useContext(PortalContext);

  const [appInsightsComponent, setAppInsightsComponent] = useState<ArmObj<AppInsightsComponent> | undefined | null>(undefined);
  const [isFileSystemLoggingAvailable, setIsFileSystemLoggingAvailable] = useState<boolean | undefined>(undefined);
  const [selectedLoggingOption, setSelectedLoggingOption] = useState<LoggingOptions | undefined>(LoggingOptions.appInsights);

  const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
  const siteResourceId = armSiteDescriptor.getTrimmedResourceId();

  const fetchComponent = async () => {
    const appInsightsResourceIdResponse = await AppInsightsService.getAppInsightsResourceId(
      siteResourceId,
      startupInfoContext.subscriptions
    );
    if (appInsightsResourceIdResponse.metadata.success) {
      const aiResourceId = appInsightsResourceIdResponse.data;
      if (aiResourceId) {
        const appInsightsResponse = await AppInsightsService.getAppInsights(aiResourceId);
        if (appInsightsResponse.metadata.success) {
          setAppInsightsComponent(appInsightsResponse.data);
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'getAppInsights', 'failed', {
              error: appInsightsResponse.metadata.error,
              message: 'Failed to get app insights',
            })
          );
        }
      }
    } else {
      setAppInsightsComponent(null);
      portalContext.log(
        getTelemetryInfo('error', 'getAppInsightsResourceId', 'failed', {
          error: appInsightsResourceIdResponse.metadata.error,
          message: 'Failed to get app insights resource id',
        })
      );
    }
  };

  const resetAppInsightsComponent = () => {
    setAppInsightsComponent(undefined);
  };

  useEffect(() => {
    fetchComponent();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (appInsightsComponent === undefined) {
      fetchComponent();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsComponent]);

  useEffect(() => {
    if (siteStateContext.site) {
      setIsFileSystemLoggingAvailable(!isLinuxDynamic(siteStateContext.site));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext.site]);

  if (appInsightsComponent === undefined || !siteStateContext.site || selectedLoggingOption === undefined) {
    return <LoadingComponent />;
  }

  if (appInsightsComponent === null) {
    return <AppInsightsSetup siteId={siteResourceId} fetchNewAppInsightsComponent={resetAppInsightsComponent} />;
  }

  return (
    <div style={paddingStyle}>
      {selectedLoggingOption === LoggingOptions.appInsights && (
        <FunctionLogAppInsightsDataLoader
          resourceId={resourceId}
          isExpanded={true}
          forceMaximized={true}
          isResizable={false}
          hideChevron={true}
          isScopeFunctionApp={true}
          leftAlignMainToolbarItems={true}
          customHeight={window.innerHeight - minimumLogPanelHeight + logCommandBarHeight}
          showLoggingOptionsDropdown={true}
          selectedLoggingOption={selectedLoggingOption}
          setSelectedLoggingOption={setSelectedLoggingOption}
        />
      )}
      {isFileSystemLoggingAvailable && selectedLoggingOption === LoggingOptions.fileBased && (
        <FunctionLogFileStreamDataLoader
          site={siteStateContext.site}
          isExpanded={true}
          forceMaximized={true}
          isResizable={false}
          hideChevron={true}
          hideLiveMetrics={true}
          leftAlignMainToolbarItems={true}
          customHeight={window.innerHeight - minimumLogPanelHeight + logCommandBarHeight}
          showLoggingOptionsDropdown={true}
          selectedLoggingOption={selectedLoggingOption}
          setSelectedLoggingOption={setSelectedLoggingOption}
        />
      )}
    </div>
  );
};

export default LogStreamDataLoader;
