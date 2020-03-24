import React, { useState, useEffect } from 'react';
import { logStreamStyle, logEntryDivStyle, getLogTextColor, logErrorDivStyle, logConnectingDivStyle } from './FunctionLog.styles';
import { useTranslation } from 'react-i18next';
import { QuickPulseQueryLayer, SchemaResponseV2, SchemaDocument } from '../../../../../QuickPulseQuery';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { getDefaultDocumentStreams, defaultClient, getQuickPulseQueryEndpoint } from './FunctionLog.constants';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { TextUtilitiesService } from '../../../../../utils/textUtilities';
import FunctionLogCommandBar from './FunctionLogCommandBar';
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
  } = props;
  const [maximized, setMaximized] = useState(false || !!forceMaximized);
  const [started, setStarted] = useState(false);
  const [queryLayer, setQueryLayer] = useState<QuickPulseQueryLayer | undefined>(undefined);
  const [logEntries, setLogEntries] = useState<SchemaDocument[]>([]);
  const [callCount, setCallCount] = useState(0);
  const [appInsightsError, setAppInsightsError] = useState(false);
  const [logsContainer, setLogsContainer] = useState<HTMLDivElement | undefined>(undefined);
  const [scrollHeight, setScrollHeight] = useState(0);

  const queryAppInsightsAndUpdateLogs = (quickPulseQueryLayer: QuickPulseQueryLayer, token: string) => {
    quickPulseQueryLayer
      .queryDetails(token, false, '')
      .then((dataV2: SchemaResponseV2) => {
        if (dataV2.DataRanges && dataV2.DataRanges[0] && dataV2.DataRanges[0].Documents) {
          let documents = dataV2.DataRanges[0].Documents.filter(
            (doc: SchemaDocument) =>
              !!doc.Content.Message &&
              (!doc.Content.SeverityLevel || doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.verbose) &&
              doc.Content.OperationName === functionName
          );
          if (callCount === 0) {
            documents = trimPreviousLogs(documents);
          }
          setLogEntries(logEntries.concat(documents));
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

  const trimPreviousLogs = (documents: SchemaDocument[]) => {
    if (documents.length > 100) {
      return documents.slice(0, 100).reverse();
    }
    return documents.reverse();
  };

  const formatLog = (logEntry: SchemaDocument) => {
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
    setLogEntries([]);
  };

  const copyLogs = () => {
    const logContent = logEntries.map(logEntry => formatLog(logEntry)).join('\n');
    TextUtilitiesService.copyContentToClipboard(logContent);
  };

  const toggleMaximize = () => {
    setMaximized(!maximized);
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
  }, [logEntries, queryLayer, appInsightsToken, callCount]);

  return (
    <div>
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
      />
      {isExpanded && (
        <div
          className={logStreamStyle(maximized, readOnlyBannerHeight || 0)}
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
          {!!logEntries &&
            logEntries.map((logEntry: SchemaDocument, logIndex: number) => {
              return (
                <div
                  key={logIndex}
                  className={logEntryDivStyle}
                  style={{ color: getLogTextColor(logEntry.Content.SeverityLevel || '') }}
                  /*Last Log Entry needs to be scrolled into focus*/
                  ref={log => {
                    if (logIndex + 1 === logEntries.length && logsContainer && !!log) {
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
    </div>
  );
};

export default FunctionLog;
