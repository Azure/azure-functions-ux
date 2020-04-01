import React, { useState, useEffect } from 'react';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import SiteService from '../../../../../ApiHelpers/SiteService';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { LogEntry } from './FunctionLog.types';
import { useTranslation } from 'react-i18next';
import FunctionLog from './FunctionLog';
import Url from '../../../../../utils/url';
import { processLogs } from './FunctionLogFileStreamData';
interface FunctionLogFileStreamDataLoaderProps {
  resourceId: string;
  isExpanded: boolean;
  forceMaximized?: boolean;
  toggleExpand?: () => void;
  toggleFullscreen?: (fullscreen: boolean) => void;
  readOnlyBannerHeight?: number;
  fileSavedCount?: number;
  hideChevron?: boolean;
  hideLiveMetrics?: boolean;
  isResizable?: boolean;
  logPanelHeight?: number;
  setLogPanelHeight?: (height: number) => void;
}

const FunctionLogFileStreamDataLoader: React.FC<FunctionLogFileStreamDataLoaderProps> = props => {
  const {
    resourceId,
    isExpanded,
    forceMaximized,
    toggleExpand,
    toggleFullscreen,
    readOnlyBannerHeight,
    fileSavedCount,
    hideChevron,
    hideLiveMetrics,
    isResizable,
    logPanelHeight,
    setLogPanelHeight,
  } = props;

  const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
  const siteResourceId = armSiteDescriptor.getTrimmedResourceId();

  const { t } = useTranslation();

  const [xhReq, setXhReq] = useState<XMLHttpRequest | undefined>(undefined);
  const [started, setStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(t('feature_logStreamingConnecting'));
  const [allLogEntries, setAllLogEntries] = useState<LogEntry[]>([]);
  const [logStreamIndex, setLogStreamIndex] = useState(0);

  const fetchSiteAndOpenStream = async () => {
    const siteResponse = await SiteService.fetchSite(siteResourceId);

    if (siteResponse.metadata.success && siteResponse.data.properties) {
      const site = siteResponse.data;
      const logUrl = `${Url.getScmUrl(site)}/api/logstream/application/functions/host`;
      const token = window.appsvc && window.appsvc.env && window.appsvc.env.armToken;

      const newXhReq = new XMLHttpRequest();
      newXhReq.open('GET', logUrl, true);
      newXhReq.setRequestHeader('Authorization', `Bearer ${token}`);
      newXhReq.setRequestHeader('FunctionsPortal', '1');
      newXhReq.send(null);
      setXhReq(newXhReq);
    } else {
      setErrorMessage(t('feature_logStreamingConnectionError'));
      LogService.error(LogCategories.functionLog, 'fetchSite', `Failed to fetch site: ${siteResponse.metadata.error}`);
    }
  };

  const listenForErrors = () => {
    if (xhReq) {
      xhReq.onerror = () => {
        setErrorMessage(t('feature_logStreamingConnectionError'));
      };
    }
  };

  const listenForUpdates = () => {
    if (xhReq) {
      xhReq.onprogress = () => {
        printNewLogs();
      };
    }
  };

  const printNewLogs = () => {
    if (xhReq) {
      const newLogStream = xhReq.responseText.substring(logStreamIndex);
      if (started) {
        setLogStreamIndex(xhReq.responseText.length);
        if (newLogStream) {
          const oldLogs = allLogEntries;
          const newLogs = processLogs(newLogStream, oldLogs);
          setAllLogEntries(newLogs);
        }
      }
    }
  };

  const startLogs = () => {
    if (xhReq) {
      setLoadingMessage(undefined);
    } else {
      setLoadingMessage(t('feature_logStreamingConnecting'));
    }
    setStarted(true);
  };

  const stopLogs = () => {
    setStarted(false);
  };

  const clearLogs = () => {
    setAllLogEntries([]);
  };

  useEffect(() => {
    fetchSiteAndOpenStream();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (started && xhReq) {
      listenForErrors();
      listenForUpdates();
    }
  }, [started, xhReq]);

  return (
    <FunctionLog
      isExpanded={isExpanded}
      started={started}
      startLogs={startLogs}
      stopLogs={stopLogs}
      clearLogs={clearLogs}
      allLogEntries={allLogEntries}
      errorMessage={errorMessage}
      loadingMessage={loadingMessage}
      forceMaximized={forceMaximized}
      toggleExpand={toggleExpand}
      toggleFullscreen={toggleFullscreen}
      readOnlyBannerHeight={readOnlyBannerHeight}
      fileSavedCount={fileSavedCount}
      hideChevron={hideChevron}
      hideLiveMetrics={hideLiveMetrics}
      isResizable={isResizable}
      logPanelHeight={logPanelHeight}
      setLogPanelHeight={setLogPanelHeight}
    />
  );
};

export default FunctionLogFileStreamDataLoader;
