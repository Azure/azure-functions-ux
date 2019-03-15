import React from 'react';
import LogStreamCommandBar from './LogStreamCommandBar';
import LogStreamLogContainer from './LogStreamLogContainer';
import { LogEntry, LogType, LogsEnabled } from './LogStream.types';
import { ArmObj, Site } from '../../../models/WebAppModels';

export interface LogStreamProps {
  reconnect: () => void;
  pause: () => void;
  start: () => void;
  clear: () => void;
  updateLogOption: (useWebServer: boolean) => void;
  isStreaming: boolean;
  site: ArmObj<Site>;
  clearLogs: boolean;
  logEntries: LogEntry[];
  connectionError: boolean;
  logType: LogType;
  logsEnabled: LogsEnabled;
}

const LogStream: React.SFC<LogStreamProps> = props => {
  const {
    reconnect,
    pause,
    start,
    clear,
    updateLogOption,
    isStreaming,
    site,
    clearLogs,
    logEntries,
    connectionError,
    logType,
    logsEnabled,
  } = props;
  return (
    <>
      <LogStreamCommandBar
        reconnect={reconnect}
        pause={pause}
        start={start}
        clear={clear}
        isStreaming={isStreaming}
        logEntries={logEntries}
        logType={logType}
        logsEnabled={logsEnabled}
      />
      <LogStreamLogContainer
        clearLogs={clearLogs}
        logEntries={logEntries}
        site={site}
        updateLogOption={updateLogOption}
        connectionError={connectionError}
        logType={logType}
        logsEnabled={logsEnabled}
      />
    </>
  );
};

export default LogStream;
