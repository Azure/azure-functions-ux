import React, { useState, useEffect } from 'react';
import {
  logStreamStyle,
  logEntryDivStyle,
  getLogTextColor,
  logErrorDivStyle,
  logConnectingDivStyle,
  getMaximizedLogPanelHeight,
  minimumLogPanelHeight,
} from './FunctionLog.styles';
import { useTranslation } from 'react-i18next';
import { QuickPulseQueryLayer, SchemaResponseV2, SchemaDocument } from '../../../../../QuickPulseQuery';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { getDefaultDocumentStreams, defaultClient, getQuickPulseQueryEndpoint } from './FunctionLog.constants';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { TextUtilitiesService } from '../../../../../utils/textUtilities';
import FunctionLogCommandBar from './FunctionLogCommandBar';
import { Resizable } from 're-resizable';
import { LogLevel } from './FunctionLog.types';

interface FunctionLogProps {
  isExpanded: boolean;
  resetAppInsightsToken: () => void;
  functionName: string;
  appInsightsResourceId: string;
  appInsightsToken?: string;
  forceMaximized?: boolean;
  toggleExpand?: () => void;
  toggleFullscreen?: (fullscreen: boolean) => void;
  readOnlyBannerHeight?: number;
  fileSavedCount?: number;
  hideChevron?: boolean;
  hideLiveMetrics?: boolean;
  isResizeable?: boolean;
  logPanelHeight?: number;
  setLogPanelHeight?: (height: number) => void;
}

const FunctionLog: React.FC<FunctionLogProps> = props => {
  const { t } = useTranslation();
  const {
    toggleExpand,
    isExpanded,
    toggleFullscreen,
    appInsightsToken,
    fileSavedCount,
    resetAppInsightsToken,
    readOnlyBannerHeight,
    functionName,
    forceMaximized,
    hideChevron,
    hideLiveMetrics,
    appInsightsResourceId,
    isResizeable,
    logPanelHeight,
    setLogPanelHeight,
  } = props;
  const [maximized, setMaximized] = useState(false || !!forceMaximized);
  const [started, setStarted] = useState(false);
  const [queryLayer, setQueryLayer] = useState<QuickPulseQueryLayer | undefined>(undefined);
  const [allLogEntries, setAllLogEntries] = useState<SchemaDocument[]>([]);
  const [visibleLogEntries, setVisibleLogEntries] = useState<SchemaDocument[]>([]);
  const [callCount, setCallCount] = useState(0);
  const [appInsightsError, setAppInsightsError] = useState(false);
  const [logsContainer, setLogsContainer] = useState<HTMLDivElement | undefined>(undefined);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [logLevel, setLogLevel] = useState<LogLevel>(LogLevel.Information);

  const queryAppInsightsAndUpdateLogs = (quickPulseQueryLayer: QuickPulseQueryLayer, token: string) => {
    quickPulseQueryLayer
      .queryDetails(token, false, '')
      .then((dataV2: SchemaResponseV2) => {
        if (dataV2.DataRanges && dataV2.DataRanges[0] && dataV2.DataRanges[0].Documents) {
          let documents = dataV2.DataRanges[0].Documents.filter(
            (doc: SchemaDocument) => !!doc.Content.Message && doc.Content.OperationName === functionName
          );
          if (callCount === 0) {
            documents = trimPreviousLogs(documents);
          }

          const newAllLogEntries = allLogEntries.concat(documents);
          setAllLogEntries(newAllLogEntries);
          setVisibleLogEntries(filterByLogLevel(newAllLogEntries));
        }
      })
      .catch(error => {
        resetAppInsightsToken();
        LogService.error(
          LogCategories.functionLog,
          'getAppInsightsComponentToken',
          `Error when attempting to Query Application Insights: ${error}`
        );
      })
      .finally(() => {
        setCallCount(callCount + 1);
      });
  };

  const trimPreviousLogs = (documents: SchemaDocument[]): SchemaDocument[] => {
    if (documents.length > 100) {
      return documents.slice(0, 100).reverse();
    }
    return documents.reverse();
  };

  const filterByLogLevel = (documents: SchemaDocument[]): SchemaDocument[] => {
    switch (logLevel) {
      case LogLevel.Verbose:
        return documents;
      case LogLevel.Information:
        return documents.filter(
          (doc: SchemaDocument) =>
            !doc.Content.SeverityLevel || doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.verbose
        );
      case LogLevel.Warning:
        return documents.filter(
          (doc: SchemaDocument) =>
            !doc.Content.SeverityLevel ||
            (doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.verbose &&
              doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.information)
        );
      case LogLevel.Error:
        return documents.filter(
          (doc: SchemaDocument) =>
            !doc.Content.SeverityLevel ||
            (doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.verbose &&
              doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.information &&
              doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.warning)
        );
    }
  };

  const formatLog = (logEntry: SchemaDocument): string => {
    return `${logEntry.Timestamp}   [${logEntry.Content.SeverityLevel}]   ${logEntry.Content.Message}`;
  };

  const disconnectQueryLayer = () => {
    setQueryLayer(undefined);
  };

  const reconnectQueryLayer = () => {
    const newQueryLayer = new QuickPulseQueryLayer(getQuickPulseQueryEndpoint(), defaultClient);
    newQueryLayer.setConfiguration([], getDefaultDocumentStreams(), []);
    setQueryLayer(newQueryLayer);
    setCallCount(0);
  };

  const onExpandClick = () => {
    if (toggleExpand) {
      if (isExpanded && maximized) {
        toggleMaximize();
      }
      toggleExpand();
    }
  };

  const toggleConnection = () => {
    if (started) {
      stopLogs();
    } else {
      startLogs();
    }
  };

  const startLogs = () => {
    if (appInsightsToken) {
      disconnectQueryLayer();
      reconnectQueryLayer();
    } else {
      setAppInsightsError(true);
    }
    setStarted(true);
  };

  const stopLogs = () => {
    disconnectQueryLayer();
    setStarted(false);
  };

  const clearLogs = () => {
    setVisibleLogEntries([]);
    setAllLogEntries([]);
  };

  const copyLogs = () => {
    const logContent = visibleLogEntries.map(logEntry => formatLog(logEntry)).join('\n');
    TextUtilitiesService.copyContentToClipboard(logContent);
  };

  const toggleMaximize = () => {
    setMaximized(!maximized);
  };

  const resizePanel = (resizedHeight: number) => {
    if (logPanelHeight && setLogPanelHeight) {
      const newLogPanelHeight = logPanelHeight + resizedHeight;
      const maximizedLogPanelHeight = getMaximizedLogPanelHeight(readOnlyBannerHeight);
      if (newLogPanelHeight < minimumLogPanelHeight) {
        setLogPanelHeight(minimumLogPanelHeight);
      } else if (newLogPanelHeight < maximizedLogPanelHeight) {
        setLogPanelHeight(newLogPanelHeight);
      } else {
        setMaximized(true);
      }
    }
  };

  useEffect(() => {
    if (isExpanded) {
      startLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  useEffect(() => {
    if (toggleFullscreen) {
      toggleFullscreen(maximized);
    }
    if (setLogPanelHeight) {
      setLogPanelHeight(maximized ? getMaximizedLogPanelHeight(readOnlyBannerHeight) : minimumLogPanelHeight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maximized]);

  useEffect(() => {
    if (!started && fileSavedCount && fileSavedCount > 0) {
      startLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSavedCount]);

  useEffect(() => {
    if (appInsightsToken && queryLayer) {
      const timeout = setTimeout(() => queryAppInsightsAndUpdateLogs(queryLayer, appInsightsToken), 3000);
      return () => clearInterval(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLogEntries, queryLayer, appInsightsToken, callCount]);

  useEffect(() => {
    setVisibleLogEntries(filterByLogLevel(allLogEntries));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logLevel]);

  return (
    <Resizable
      size={{
        height: 0,
        width: '100%',
      }}
      enable={{ top: !!isResizeable && !maximized && !!isExpanded }}
      onResizeStop={(e, direction, ref, d) => {
        let height = d.height;
        const boundingRect = ref.getBoundingClientRect();
        if (e['y'] && boundingRect['y']) {
          height = boundingRect['y'] - e['y'];
        }
        resizePanel(height);
      }}>
      <FunctionLogCommandBar
        onChevronClick={onExpandClick}
        isPanelVisible={isExpanded}
        copy={copyLogs}
        started={started}
        toggleConnection={toggleConnection}
        clear={clearLogs}
        toggleMaximize={toggleMaximize}
        maximized={maximized}
        showMaximize={!forceMaximized}
        hideChevron={!!hideChevron}
        hideLiveMetrics={!!hideLiveMetrics}
        appInsightsResourceId={appInsightsResourceId}
        setLogLevel={setLogLevel}
      />
      {isExpanded && (
        <div
          className={logStreamStyle(maximized, logPanelHeight || minimumLogPanelHeight, readOnlyBannerHeight || 0)}
          ref={container => {
            if (!!container) {
              setLogsContainer(container);
              setScrollHeight(container.scrollHeight);
            }
          }}>
          {/*Error Message*/}
          {appInsightsError && <div className={logErrorDivStyle}>{t('functionEditor_appInsightsNotConfigured')}</div>}

          {/*Loading Message*/}
          {!appInsightsError && started && callCount === 0 && (
            <div className={logConnectingDivStyle}>{t('functionEditor_connectingToAppInsights')}</div>
          )}

          {/*Log Entries*/}
          {!!visibleLogEntries &&
            visibleLogEntries.map((logEntry: SchemaDocument, logIndex: number) => {
              return (
                <div
                  key={logIndex}
                  className={logEntryDivStyle}
                  style={{ color: getLogTextColor(logEntry.Content.SeverityLevel || '') }}
                  /*Last Log Entry needs to be scrolled into focus*/
                  ref={log => {
                    if (logIndex + 1 === visibleLogEntries.length && logsContainer && !!log) {
                      if (Math.floor(scrollHeight - logsContainer.scrollTop) === Math.floor(logsContainer.clientHeight)) {
                        log.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}>
                  {formatLog(logEntry)}
                </div>
              );
            })}
        </div>
      )}
    </Resizable>
  );
};

export default FunctionLog;
