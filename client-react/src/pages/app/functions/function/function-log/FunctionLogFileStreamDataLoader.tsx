import React, { useState, useEffect } from 'react';
import { LogEntry } from './FunctionLog.types';
import { useTranslation } from 'react-i18next';
import FunctionLog from './FunctionLog';
import Url from '../../../../../utils/url';
import { processLogs } from './FunctionLogFileStreamData';
import { LoggingOptions } from '../function-editor/FunctionEditor.types';
import { ArmObj } from '../../../../../models/arm-obj';
import { Site } from '../../../../../models/site/site';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';

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

  const openStream = async () => {
    setLoadingMessage(t('feature_logStreamingConnecting'));
    const hostStatusResult = await FunctionsService.getHostStatus(site.id);

    if (hostStatusResult.metadata.success) {
      if (hostStatusResult.data.properties.errors) {
        // We should show any host status errors, but still try to connect to logstream
        setErrorMessage(hostStatusResult.data.properties.errors.join('\n'));
      } else {
        // Incase the user tries to reconnect, we should set to undefined if errors are no longer present
        setErrorMessage(undefined);
      }

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
    } else {
      setErrorMessage(t('feature_logStreamingConnectionError'));
      LogService.error(
        LogCategories.functionLog,
        'getHostStatus',
        `Failed to get host status: ${getErrorMessageOrStringify(hostStatusResult.metadata.error)}`
      );
    }
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
    setInterval(() => keepFunctionsHostAlive(), 60000); // ping functions host every minute
    listenForErrors();
    listenForUpdates();
  };

  const keepFunctionsHostAlive = async () => {
    const hostStatusResult = await FunctionsService.getHostStatus(site.id);
    if (hostStatusResult.metadata.success) {
      if (hostStatusResult.data.properties.errors) {
        setErrorMessage(hostStatusResult.data.properties.errors.join('\n'));
      } else {
        setErrorMessage(undefined);
      }
    } else {
      setErrorMessage(t('feature_logStreamingConnectionError'));
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
