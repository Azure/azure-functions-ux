import { UtilitiesService } from './../../../../utils/utilities';
import { IAction } from '../../../../models/action';
import {
  START_STREAMING,
  STOP_STREAMING,
  CLEAR_LOG_ENTRIES,
  COPY_LOG_ENTRIES,
  RECONNECT_LOG_STREAM,
  UPDATE_LOG_ENTRIES,
  UPDATE_LOG_STREAM_INDEX,
  UPDATE_TIMEOUTS,
} from './actions';
import { LogEntry } from '../../../../pages/app/log-stream/LogStream.Types';

export interface ILogStreamState {
  isStreaming: boolean;
  logEntries: LogEntry[];
  clearLogs: boolean;
  xhReq: XMLHttpRequest;
  timeouts: number[];
  logStreamIndex: number;
}

export const InitialState: ILogStreamState = {
  isStreaming: true,
  logEntries: [],
  clearLogs: false,
  xhReq: new XMLHttpRequest(),
  timeouts: [],
  logStreamIndex: 0,
};

const logStream = (state = InitialState, action: IAction<any>) => {
  switch (action.type) {
    case CLEAR_LOG_ENTRIES:
      return {
        ...state,
        logEntries: [],
        clearLogs: true,
      };
    case START_STREAMING:
      return {
        ...state,
        isStreaming: true,
      };
    case STOP_STREAMING:
      return {
        ...state,
        isStreaming: false,
      };
    case RECONNECT_LOG_STREAM:
      return {
        ...state,
        clearLogs: false,
      };
    case COPY_LOG_ENTRIES:
      _copyLogs(state);
      return state;
    case UPDATE_LOG_ENTRIES:
      return {
        ...state,
        logEntries: action.payload,
      };
    case UPDATE_LOG_STREAM_INDEX:
      return {
        ...state,
        logStreamIndex: action.payload,
      };
    case UPDATE_TIMEOUTS:
      return {
        ...state,
        timeouts: action.payload,
      };
    default:
      return state;
  }
};

function _copyLogs(state: ILogStreamState) {
  let logContent = '';
  state.logEntries.forEach(logEntry => {
    logContent += `${logEntry.message}\n`;
  });
  UtilitiesService.copyContentToClipboard(logContent);
}

export default logStream;
