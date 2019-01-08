import {
  CLEAR_LOG_ENTRIES,
  START_STREAMING,
  STOP_STREAMING,
  RECONNECT_LOG_STREAM,
  UPDATE_WEB_SERVER_LOGS,
  UPDATE_LOG_ENTRIES,
  UPDATE_LOG_STREAM_INDEX,
  UPDATE_TIMEOUTS,
} from './actionTypes';
import { LogEntry } from '../../../../pages/app/log-stream/LogStream.Types';
import { createStandardAction } from 'typesafe-actions';

export const clearLogEntries = createStandardAction(CLEAR_LOG_ENTRIES)();
export const startStreaming = createStandardAction(START_STREAMING)();
export const stopStreaming = createStandardAction(STOP_STREAMING)();
export const reconnectLogStream = createStandardAction(RECONNECT_LOG_STREAM)();
export const updateWebServerLogs = createStandardAction(UPDATE_WEB_SERVER_LOGS).map((webServerLogs: boolean) => ({ webServerLogs }));
export const updateLogEntries = createStandardAction(UPDATE_LOG_ENTRIES).map((newLogEntries: LogEntry[]) => ({ newLogEntries }));
export const updateLogStreamIndex = createStandardAction(UPDATE_LOG_STREAM_INDEX).map((logStreamIndex: number) => ({ logStreamIndex }));
export const updateTimeouts = createStandardAction(UPDATE_TIMEOUTS).map((timeouts: number[]) => ({ timeouts }));
