import React, { useState, useEffect } from 'react';
import { logStyle } from './../../FunctionMonitor.styles';
import { isLinuxDynamic } from '../../../../../../../utils/arm-utils';
import { ArmSiteDescriptor } from '../../../../../../../utils/resourceDescriptors';
import SiteService from '../../../../../../../ApiHelpers/SiteService';
import { ArmObj } from '../../../../../../../models/arm-obj';
import { Site } from '../../../../../../../models/site/site';
import LogService from '../../../../../../../utils/LogService';
import { LogCategories } from '../../../../../../../utils/LogCategories';
import { getErrorMessageOrStringify } from '../../../../../../../ApiHelpers/ArmHelper';
import { LoggingOptions } from '../../../function-editor/FunctionEditor.types';
import LoadingComponent from '../../../../../../../components/Loading/LoadingComponent';
import FunctionLogFileStreamDataLoader from '../../../function-log/FunctionLogFileStreamDataLoader';
import FunctionLogAppInsightsDataLoader from '../../../function-log/FunctionLogAppInsightsDataLoader';

interface FunctionLogsDataLoaderProps {
  resourceId: string;
}

const FunctionLogsDataLoader: React.FC<FunctionLogsDataLoaderProps> = props => {
  const { resourceId } = props;

  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);
  const [isFileSystemLoggingAvailable, setIsFileSystemLoggingAvailable] = useState<boolean | undefined>(undefined);
  const [selectedLoggingOption, setSelectedLoggingOption] = useState<LoggingOptions | undefined>(undefined);

  const fetchSite = async () => {
    const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
    const siteResourceId = armSiteDescriptor.getTrimmedResourceId();

    const siteResponse = await SiteService.fetchSite(siteResourceId);
    if (siteResponse.metadata.success) {
      setSite(siteResponse.data);
    } else {
      LogService.error(
        LogCategories.functionLog,
        'getSite',
        `Failed to get site info: ${getErrorMessageOrStringify(siteResponse.metadata.error)}`
      );
    }
  };

  useEffect(() => {
    fetchSite();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (site) {
      setIsFileSystemLoggingAvailable(!isLinuxDynamic(site));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  useEffect(() => {
    if (isFileSystemLoggingAvailable !== undefined) {
      setSelectedLoggingOption(isFileSystemLoggingAvailable ? LoggingOptions.fileBased : LoggingOptions.appInsights);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFileSystemLoggingAvailable]);

  if (!site || selectedLoggingOption === undefined) {
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
          site={site}
          isExpanded={true}
          forceMaximized={true}
          hideChevron={true}
          leftAlignMainToolbarItems={true}
          showLoggingOptionsDropdown={true}
          selectedLoggingOption={selectedLoggingOption}
          setSelectedLoggingOption={setSelectedLoggingOption}
        />
      )}
    </div>
  );
};

export default FunctionLogsDataLoader;
