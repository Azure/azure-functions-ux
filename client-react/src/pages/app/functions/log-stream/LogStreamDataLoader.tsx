import React, { useState, useContext, useEffect } from 'react';
import { StartupInfoContext } from '../../../../StartupInfoContext';
import { ArmSiteDescriptor } from '../../../../utils/resourceDescriptors';
import AppInsightsService from '../../../../ApiHelpers/AppInsightsService';
import { ArmObj } from '../../../../models/arm-obj';
import { AppInsightsComponent } from '../../../../models/app-insights';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import AppInsightsSetup from '../../functions/function/monitor/AppInsightsSetup';
import FunctionLogAppInsightsDataLoader from '../../functions/function/function-log/FunctionLogAppInsightsDataLoader';
import { paddingStyle } from './LogStream.styles';
import { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';
import { minimumLogPanelHeight, logCommandBarHeight } from '../function/function-log/FunctionLog.styles';
import { SiteStateContext } from '../../../../SiteState';
import { isLinuxDynamic } from '../../../../utils/arm-utils';
import { LoggingOptions } from '../function/function-editor/FunctionEditor.types';
import FunctionLogFileStreamDataLoader from '../function/function-log/FunctionLogFileStreamDataLoader';

export interface LogStreamDataLoaderProps {
  resourceId: string;
}

const LogStreamDataLoader: React.FC<LogStreamDataLoaderProps> = props => {
  const { resourceId } = props;

  const siteStateContext = useContext(SiteStateContext);
  const startupInfoContext = useContext(StartupInfoContext);

  const [appInsightsComponent, setAppInsightsComponent] = useState<ArmObj<AppInsightsComponent> | undefined | null>(undefined);
  const [isFileSystemLoggingAvailable, setIsFileSystemLoggingAvailable] = useState<boolean | undefined>(undefined);
  const [selectedLoggingOption, setSelectedLoggingOption] = useState<LoggingOptions | undefined>(undefined);

  const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
  const siteResourceId = armSiteDescriptor.getTrimmedResourceId();

  const fetchComponent = async (force?: boolean) => {
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
            LogCategories.functionAppLog,
            'getAppInsights',
            `Failed to get app insights: ${getErrorMessageOrStringify(appInsightsResponse.metadata.error)}`
          );
        }
      }
    } else {
      setAppInsightsComponent(null);
      LogService.error(
        LogCategories.functionAppLog,
        'getAppInsightsResourceId',
        `Failed to get app insights resource Id: ${getErrorMessageOrStringify(appInsightsResourceIdResponse.metadata.error)}`
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
      fetchComponent(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsComponent]);

  useEffect(() => {
    if (siteStateContext.site) {
      setIsFileSystemLoggingAvailable(!isLinuxDynamic(siteStateContext.site));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext.site]);

  useEffect(() => {
    if (isFileSystemLoggingAvailable !== undefined) {
      setSelectedLoggingOption(isFileSystemLoggingAvailable ? LoggingOptions.fileBased : LoggingOptions.appInsights);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFileSystemLoggingAvailable]);

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
