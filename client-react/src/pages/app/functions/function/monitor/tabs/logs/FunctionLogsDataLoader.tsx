import React, { useContext, useEffect, useState } from 'react';

import LoadingComponent from '../../../../../../../components/Loading/LoadingComponent';
import { SiteStateContext } from '../../../../../../../SiteState';
import { isKubeApp, isLinuxDynamic } from '../../../../../../../utils/arm-utils';
import { ArmFunctionDescriptor } from '../../../../../../../utils/resourceDescriptors';
import { LoggingOptions } from '../../../function-editor/FunctionEditor.types';
import FunctionLogAppInsightsDataLoader from '../../../function-log/FunctionLogAppInsightsDataLoader';
import FunctionLogFileStreamDataLoader from '../../../function-log/FunctionLogFileStreamDataLoader';

import { logStyle } from './../../FunctionMonitor.styles';

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
