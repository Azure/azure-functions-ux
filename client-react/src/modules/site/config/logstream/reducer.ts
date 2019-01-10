import {
  START_STREAMING,
  STOP_STREAMING,
  CLEAR_LOG_ENTRIES,
  RECONNECT_LOG_STREAM,
  UPDATE_WEB_SERVER_LOGS,
  UPDATE_LOG_ENTRIES,
  UPDATE_LOG_STREAM_INDEX,
  UPDATE_TIMEOUTS,
} from './actionTypes';
import { LogEntry } from '../../../../pages/app/log-stream/LogStream.types';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { combineReducers } from 'redux';

export interface ILogStreamState {
  isStreaming: boolean;
  logEntries: LogEntry[];
  clearLogs: boolean;
  xhReq: XMLHttpRequest;
  timeouts: number[];
  logStreamIndex: number;
  webServerLogs: boolean;
}

export const InitialState: ILogStreamState = {
  isStreaming: true,
  logEntries: [],
  clearLogs: false,
  xhReq: new XMLHttpRequest(),
  timeouts: [],
  logStreamIndex: 0,
  webServerLogs: false,
};

export type LogStreamActions = ActionType<typeof actions>;

export default combineReducers<ILogStreamState, LogStreamActions>({
  isStreaming: (state = InitialState.isStreaming, action) => {
    switch (action.type) {
      case START_STREAMING:
        return true;
      case STOP_STREAMING:
        return false;
      default:
        return state;
    }
  },
  logEntries: (state = InitialState.logEntries, action) => {
    switch (action.type) {
      case CLEAR_LOG_ENTRIES:
        return [];
      case UPDATE_LOG_ENTRIES:
        return action.newLogEntries;
      default:
        return state;
    }
  },
  clearLogs: (state = InitialState.clearLogs, action) => {
    switch (action.type) {
      case CLEAR_LOG_ENTRIES:
        return true;
      case RECONNECT_LOG_STREAM:
        return false;
      default:
        return state;
    }
  },
  xhReq: (state = InitialState.xhReq, action) => {
    return state;
  },
  timeouts: (state = InitialState.timeouts, action) => {
    switch (action.type) {
      case UPDATE_TIMEOUTS:
        return action.timeouts;
      default:
        return state;
    }
  },
  logStreamIndex: (state = InitialState.logStreamIndex, action) => {
    switch (action.type) {
      case UPDATE_LOG_STREAM_INDEX:
        return action.logStreamIndex;
      default:
        return state;
    }
  },
  webServerLogs: (state = InitialState.webServerLogs, action) => {
    switch (action.type) {
      case UPDATE_WEB_SERVER_LOGS:
        return action.webServerLogs;
      default:
        return state;
    }
  },
});
