import React from 'react';
import LogStreamCommandBar from './LogStreamCommandBar';
import LogStreamLogContainer from './LogStreamLogContainer';
import { SiteState } from '../../../modules/site/reducer';
import { LogEntry } from './LogStream.types';

export interface LogStreamProps {
  reconnect: () => void;
  pause: () => void;
  start: () => void;
  clear: () => void;
  updateLogOption: (useWebServer: boolean) => void;
  isStreaming: boolean;
  site: SiteState;
  clearLogs: boolean;
  logEntries: LogEntry[];
  connectionError: boolean;
}

const LogStream: React.SFC<LogStreamProps> = props => {
  const { reconnect, pause, start, clear, updateLogOption, isStreaming, site, clearLogs, logEntries, connectionError } = props;
  return (
    <>
      <LogStreamCommandBar
        reconnect={reconnect}
        pause={pause}
        start={start}
        clear={clear}
        isStreaming={isStreaming}
        logEntries={logEntries}
      />
      <LogStreamLogContainer
        clearLogs={clearLogs}
        logEntries={logEntries}
        site={site.data}
        updateLogOption={updateLogOption}
        connectionError={connectionError}
      />
    </>
  );
};

export default LogStream;
