import React, { useState, useEffect, useContext } from 'react';
import { logStyle } from './../../FunctionMonitor.styles';
import { isKubeApp, isLinuxDynamic } from '../../../../../../../utils/arm-utils';
import { LoggingOptions } from '../../../function-editor/FunctionEditor.types';
import LoadingComponent from '../../../../../../../components/Loading/LoadingComponent';
import FunctionLogFileStreamDataLoader from '../../../function-log/FunctionLogFileStreamDataLoader';
import FunctionLogAppInsightsDataLoader from '../../../function-log/FunctionLogAppInsightsDataLoader';
import { SiteStateContext } from '../../../../../../../SiteState';
import { ArmFunctionDescriptor } from '../../../../../../../utils/resourceDescriptors';

interface FunctionLogsDataLoaderProps {
  resourceId: string;
}

const FunctionLogsDataLoader: React.FC<FunctionLogsDataLoaderProps> = props => {
  const { resourceId } = props;

  const siteStateContext = useContext(SiteStateContext);

  const [isFileSystemLoggingAvailable, setIsFileSystemLoggingAvailable] = useState<boolean | undefined>(undefined);
  const [selectedLoggingOption, setSelectedLoggingOption] = useState<LoggingOptions | undefined>(LoggingOptions.appInsights);

  const armFunctionDescriptor = new ArmFunctionDescriptor(resourceId);

  useEffect(() => {
    if (siteStateContext.site) {
      setIsFileSystemLoggingAvailable(!isLinuxDynamic(siteStateContext.site) && !isKubeApp(siteStateContext.site));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext.site]);

  if (!siteStateContext.site || selectedLoggingOption === undefined) {
    return <LoadingComponent />;
  }

  return (
    <div style={logStyle}>
      {selectedLoggingOption === LoggingOptions.appInsights && (
        <FunctionLogAppInsightsDataLoader
          resourceId={resourceId}
          isExpanded={true}
          forceMaximized={true}
          hideChevron={true}
          leftAlignMainToolbarItems={true}
          showLoggingOptionsDropdown={isFileSystemLoggingAvailable}
          selectedLoggingOption={selectedLoggingOption}
          setSelectedLoggingOption={setSelectedLoggingOption}
        />
      )}
      {isFileSystemLoggingAvailable && selectedLoggingOption === LoggingOptions.fileBased && (
        <FunctionLogFileStreamDataLoader
          site={siteStateContext.site}
          isExpanded={true}
          forceMaximized={true}
          hideChevron={true}
          hideLiveMetrics={true}
          leftAlignMainToolbarItems={true}
          showLoggingOptionsDropdown={true}
          selectedLoggingOption={selectedLoggingOption}
          setSelectedLoggingOption={setSelectedLoggingOption}
          functionName={armFunctionDescriptor.name}
        />
      )}
    </div>
  );
};

export default FunctionLogsDataLoader;
