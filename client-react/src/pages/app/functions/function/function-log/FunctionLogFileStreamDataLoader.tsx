import React, { useState, useEffect } from 'react';
import { LogEntry } from './FunctionLog.types';
import { useTranslation } from 'react-i18next';
import FunctionLog from './FunctionLog';
import Url from '../../../../../utils/url';
import { processLogs } from './FunctionLogFileStreamData';
import { LoggingOptions } from '../function-editor/FunctionEditor.types';
import { ArmObj } from '../../../../../models/arm-obj';
import { Site } from '../../../../../models/site/site';

interface FunctionLogFileStreamDataLoaderProps {
  site: ArmObj<Site>;
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
  showLoggingOptionsDropdown?: boolean;
  selectedLoggingOption?: LoggingOptions;
  setSelectedLoggingOption?: (options: LoggingOptions) => void;
  leftAlignMainToolbarItems?: boolean;
  customHeight?: number;
  functionName?: string;
}

const FunctionLogFileStreamDataLoader: React.FC<FunctionLogFileStreamDataLoaderProps> = props => {
  const { site, functionName } = props;

  const { t } = useTranslation();

  const [xhReq, setXhReq] = useState<XMLHttpRequest | undefined>(undefined);
  const [started, setStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(t('feature_logStreamingConnecting'));
  const [allLogEntries, setAllLogEntries] = useState<LogEntry[]>([]);
  const [logStreamIndex, setLogStreamIndex] = useState(0);

  const openStream = () => {
    setLoadingMessage(t('feature_logStreamingConnecting'));

    const logUrl = functionName
      ? `${Url.getScmUrl(site)}/api/logstream/application/functions/function/${functionName}`
      : `${Url.getScmUrl(site)}/api/logstream/application/functions/host`;
    const token = window.appsvc && window.appsvc.env && window.appsvc.env.armToken;

    const newXhReq = new XMLHttpRequest();
    newXhReq.open('GET', logUrl, true);
    newXhReq.setRequestHeader('Authorization', `Bearer ${token}`);
    newXhReq.setRequestHeader('FunctionsPortal', '1');
    newXhReq.send(null);
    setXhReq(newXhReq);
  };

  const closeStream = () => {
    if (xhReq) {
      xhReq.abort();
      setLogStreamIndex(0);
      setXhReq(undefined);
    }
  };

  const listenToStream = () => {
    setLoadingMessage(undefined);
    listenForErrors();
    listenForUpdates();
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
          const newLogs = processLogs(newLogStream, allLogEntries);
          setAllLogEntries(newLogs);
        }
      }
    }
  };

  const startLogs = () => {
    setStarted(true);
  };

  const stopLogs = () => {
    setStarted(false);
  };

  const clearLogs = () => {
    setAllLogEntries([]);
  };

  useEffect(() => {
    openStream();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (started) {
      if (xhReq) {
        listenToStream();
      } else {
        openStream();
      }
    } else {
      closeStream();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, xhReq]);

  return (
    <FunctionLog
      started={started}
      startLogs={startLogs}
      stopLogs={stopLogs}
      clearLogs={clearLogs}
      allLogEntries={allLogEntries}
      errorMessage={errorMessage}
      loadingMessage={loadingMessage}
      {...props}
    />
  );
};

export default FunctionLogFileStreamDataLoader;
