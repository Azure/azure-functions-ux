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
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { TextUtilitiesService } from '../../../../../utils/textUtilities';
import FunctionLogCommandBar from './FunctionLogCommandBar';
import { Resizable } from 're-resizable';
import { LogLevel, LogEntry } from './FunctionLog.types';

interface FunctionLogProps {
  isExpanded: boolean;
  started: boolean;
  startLogs: () => void;
  stopLogs: () => void;
  clearLogs: () => void;
  setLogLevel: (level: LogLevel) => void;
  logEntries?: LogEntry[];
  errorMessage?: string;
  loadingMessage?: string;
  appInsightsResourceId?: string;
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

const FunctionLog: React.FC<FunctionLogProps> = props => {
  const {
    toggleExpand,
    isExpanded,
    toggleFullscreen,
    fileSavedCount,
    readOnlyBannerHeight,
    forceMaximized,
    hideChevron,
    hideLiveMetrics,
    appInsightsResourceId,
    isResizable,
    logPanelHeight,
    setLogPanelHeight,
    errorMessage,
    loadingMessage,
    started,
    startLogs,
    stopLogs,
    clearLogs,
    logEntries,
    setLogLevel,
  } = props;
  const [maximized, setMaximized] = useState(false || !!forceMaximized);
  const [logsContainer, setLogsContainer] = useState<HTMLDivElement | undefined>(undefined);
  const [scrollHeight, setScrollHeight] = useState(0);

  const formatLog = (logEntry: LogEntry): string => {
    return `${logEntry.timestamp}   [${logEntry.level}]   ${logEntry.message}`;
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

  const copyLogs = () => {
    const logContent = !!logEntries ? logEntries.map(logEntry => formatLog(logEntry)).join(CommonConstants.newLine) : '';
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

  return (
    <Resizable
      size={{
        height: 0,
        width: '100%',
      }}
      enable={{ top: !!isResizable && !maximized && !!isExpanded }}
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
          {errorMessage && <div className={logErrorDivStyle}>{errorMessage}</div>}

          {/*Loading Message*/}
          {!errorMessage && started && loadingMessage && <div className={logConnectingDivStyle}>{loadingMessage}</div>}

          {/*Log Entries*/}
          {!!logEntries &&
            logEntries.map((logEntry: LogEntry, logIndex: number) => {
              return (
                <div
                  key={logIndex}
                  className={logEntryDivStyle}
                  style={{ color: getLogTextColor(logEntry.level) }}
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
    </Resizable>
  );
};

export default FunctionLog;
