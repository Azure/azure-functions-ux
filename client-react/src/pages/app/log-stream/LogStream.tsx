import React, { useContext, useEffect } from 'react';

import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { PortalContext } from '../../../PortalContext';

import { LogEntry, LogsEnabled, LogType } from './LogStream.types';
import LogStreamCommandBar from './LogStreamCommandBar';
import LogStreamLogContainer from './LogStreamLogContainer';

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
  const portalCommunicator = useContext(PortalContext);
  useEffect(() => {
    portalCommunicator.loadComplete();
  }, [portalCommunicator]);
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
