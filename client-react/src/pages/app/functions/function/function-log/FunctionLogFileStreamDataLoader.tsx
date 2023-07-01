import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { ArmObj } from '../../../../../models/arm-obj';
import { Site } from '../../../../../models/site/site';
import { PortalContext } from '../../../../../PortalContext';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import Url from '../../../../../utils/url';
import { LoggingOptions } from '../function-editor/FunctionEditor.types';

import FunctionLog from './FunctionLog';
import { LogEntry } from './FunctionLog.types';
import { processLogs } from './FunctionLogFileStreamData';

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

  const portalContext = useContext(PortalContext);

  const { t } = useTranslation();

  const [xhReq, setXhReq] = useState<XMLHttpRequest | undefined>(undefined);
  const [started, setStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(t('feature_logStreamingConnecting'));
  const [allLogEntries, setAllLogEntries] = useState<LogEntry[]>([]);
  const [logStreamIndex, setLogStreamIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [xhReqResponseText, setXhReqResponseText] = useState('');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | undefined>(undefined);

  const msInMin = 60000;

  const openStream = async () => {
    setLoadingMessage(t('feature_logStreamingConnecting'));
    const hostStatusResult = await FunctionsService.getHostStatus(site.id);

    if (hostStatusResult.metadata.success) {
      if (hostStatusResult.data.properties.errors && hostStatusResult.data.properties.errors.length > 0) {
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
      setStartTime(new Date().getTime());
    } else {
      setErrorMessage(t('logStreamingHostStatusError'));
      portalContext.log(
        getTelemetryInfo('error', 'getHostStatus', 'failed', {
          error: hostStatusResult.metadata.error,
          message: 'Failed to get host status',
        })
      );
    }
  };

  const closeStream = () => {
    if (xhReq) {
      xhReq.abort();
      setLogStreamIndex(0);
      setXhReq(undefined);
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
  };

  const listenToStream = () => {
    setLoadingMessage(undefined);
    const id = setInterval(() => keepFunctionsHostAlive(), msInMin); // ping functions host every minute
    setIntervalId(id);
    listenForErrors();
    listenForUpdates();
  };

  const keepFunctionsHostAlive = async () => {
    const hostStatusResult = await FunctionsService.getHostStatus(site.id);
    if (hostStatusResult.metadata.success) {
      if (hostStatusResult.data.properties.errors && hostStatusResult.data.properties.errors.length > 0) {
        setErrorMessage(hostStatusResult.data.properties.errors.join('\n'));
      } else {
        setErrorMessage(undefined);
      }
    } else {
      setErrorMessage(t('logStreamingHostStatusError'));
      portalContext.log(
        getTelemetryInfo('error', 'getHostStatus', 'failed', {
          error: hostStatusResult.metadata.error,
          message: 'Failed to get host status',
        })
      );
    }
  };

  const listenForErrors = useCallback(() => {
    if (xhReq) {
      xhReq.onerror = () => {
        setErrorMessage(t('feature_logStreamingConnectionError'));

        // Automatically attempt to reconnect the connection if stream has been open for less than 15 minutes
        const errorTime = new Date().getTime();
        if (Math.abs(startTime - errorTime) < 15 * msInMin) {
          closeStream();
        }
      };
    }
  }, [xhReq?.onerror]);

  const listenForUpdates = useCallback(() => {
    if (xhReq) {
      xhReq.onprogress = () => {
        setXhReqResponseText(xhReq.responseText);
      };
    }
  }, [xhReq?.onprogress]);

  const printNewLogs = useCallback(
    (responseText: string) => {
      const newLogStream = responseText.substring(logStreamIndex);
      if (started) {
        setLogStreamIndex(responseText.length);
        if (newLogStream) {
          const newLogs = processLogs(newLogStream, allLogEntries);
          setAllLogEntries(newLogs);
        }
      }
    },
    [xhReqResponseText]
  );

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
    if (started && xhReq) {
      listenToStream();
    } else if (started && !xhReq) {
      openStream();
    } else if (!started && xhReq) {
      closeStream();
    }
  }, [started, xhReq]);

  useEffect(() => {
    printNewLogs(xhReqResponseText);
  }, [xhReqResponseText]);

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
