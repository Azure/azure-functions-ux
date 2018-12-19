import { IAction } from '../../../../models/action';
import { LogEntry } from '../../../../pages/app/log-stream/LogStream.Types';

export const CLEAR_LOG_ENTRIES = 'CLEAR_LOG_ENTRIES';
export function clearLogEntries(): IAction<null> {
  return {
    payload: null,
    type: CLEAR_LOG_ENTRIES,
  };
}

export const START_STREAMING = 'START_STREAMING';
export function startStreaming(): IAction<null> {
  return {
    payload: null,
    type: START_STREAMING,
  };
}

export const STOP_STREAMING = 'STOP_STREAMING';
export function stopStreaming(): IAction<null> {
  return {
    payload: null,
    type: STOP_STREAMING,
  };
}

export const COPY_LOG_ENTRIES = 'COPY_LOG_ENTRIES';
export function copyLogEntries(): IAction<null> {
  return {
    payload: null,
    type: COPY_LOG_ENTRIES,
  };
}

export const RECONNECT_LOG_STREAM = 'RECONNECT_LOG_STREAM';
export function reconnectLogStream(): IAction<null> {
  return {
    payload: null,
    type: RECONNECT_LOG_STREAM,
  };
}

export const UPDATE_LOG_ENTRIES = 'UPDATE_LOG_ENTRIES';
export function updateLogEntries(newLogEntries: LogEntry[]): IAction<LogEntry[]> {
  return {
    payload: newLogEntries,
    type: UPDATE_LOG_ENTRIES,
  };
}

export const UPDATE_LOG_STREAM_INDEX = 'UPDATE_LOG_STREAM_INDEX';
export function updateLogStreamIndex(logStreamIndex: number): IAction<number> {
  return {
    payload: logStreamIndex,
    type: UPDATE_LOG_STREAM_INDEX,
  };
}

export const UPDATE_TIMEOUTS = 'UPDATE_TIMEOUTS';
export function updateTimeouts(timeouts: number[]): IAction<number[]> {
  return {
    payload: timeouts,
    type: UPDATE_TIMEOUTS,
  };
}
