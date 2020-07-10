import React, { useState, useEffect } from 'react';
import {
  logStreamStyle,
  logEntryDivStyle,
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
import { useTranslation } from 'react-i18next';
import { LoggingOptions } from '../function-editor/FunctionEditor.types';

interface FunctionLogProps {
  isExpanded: boolean;
  started: boolean;
  startLogs: () => void;
  stopLogs: () => void;
  clearLogs: () => void;
  allLogEntries?: LogEntry[];
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
  leftAlignMainToolbarItems?: boolean;
  customHeight?: number;
  showLoggingOptionsDropdown?: boolean;
  selectedLoggingOption?: LoggingOptions;
  setSelectedLoggingOption?: (options: LoggingOptions) => void;
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
    allLogEntries,
    leftAlignMainToolbarItems,
    customHeight,
    selectedLoggingOption,
    showLoggingOptionsDropdown,
    setSelectedLoggingOption,
  } = props;
  const [maximized, setMaximized] = useState(false || !!forceMaximized);
  const [logsContainer, setLogsContainer] = useState<HTMLDivElement | undefined>(undefined);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [visibleLogEntries, setVisibleLogEntries] = useState<LogEntry[]>([]);
  const [logLevel, setLogLevel] = useState<LogLevel>(LogLevel.Information);

  const { t } = useTranslation();

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
    const logContent = visibleLogEntries.map(logEntry => logEntry.message).join(CommonConstants.newLine);
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

  const filterEntriesByLogLevel = (logEntries: LogEntry[]): LogEntry[] => {
    switch (logLevel) {
      case LogLevel.Verbose:
        return logEntries;
      case LogLevel.Information:
        return logEntries.filter(logEntry => logEntry.level !== LogLevel.Verbose);
      case LogLevel.Warning:
        return logEntries.filter(logEntry => logEntry.level !== LogLevel.Verbose && logEntry.level !== LogLevel.Information);
      case LogLevel.Error:
        return logEntries.filter(
          logEntry => logEntry.level !== LogLevel.Verbose && logEntry.level !== LogLevel.Information && logEntry.level !== LogLevel.Warning
        );
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
    if (isExpanded && setLogPanelHeight) {
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
    setVisibleLogEntries(allLogEntries ? filterEntriesByLogLevel(allLogEntries) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logLevel, allLogEntries]);

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
        logLevel={logLevel}
        setLogLevel={setLogLevel}
        leftAlignMainToolbarItems={leftAlignMainToolbarItems}
        showLoggingOptionsDropdown={showLoggingOptionsDropdown}
        selectedLoggingOption={selectedLoggingOption}
        setSelectedLoggingOption={setSelectedLoggingOption}
      />
      {isExpanded && (
        <div
          className={logStreamStyle(maximized, logPanelHeight || minimumLogPanelHeight, readOnlyBannerHeight || 0, customHeight)}
          ref={container => {
            if (!!container) {
              setLogsContainer(container);
              setScrollHeight(container.scrollHeight);
            }
          }}>
          {/*Error Message*/}
          {errorMessage && <div className={logErrorDivStyle}>{errorMessage}</div>}

          {/*Loading Message*/}
          {!errorMessage && started && <div className={logConnectingDivStyle}>{loadingMessage ? loadingMessage : t('connected')}</div>}

          {/*Log Entries*/}
          {visibleLogEntries.map((logEntry: LogEntry, logIndex: number) => {
            return (
              <div
                key={logIndex}
                className={logEntryDivStyle}
                style={{ color: logEntry.color }}
                /*Last Log Entry needs to be scrolled into focus*/
                ref={log => {
                  if (logIndex + 1 === visibleLogEntries.length && logsContainer && !!log) {
                    if (Math.floor(scrollHeight - logsContainer.scrollTop) === Math.floor(logsContainer.clientHeight)) {
                      log.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}>
                {logEntry.message}
              </div>
            );
          })}
        </div>
      )}
    </Resizable>
  );
};

export default FunctionLog;
