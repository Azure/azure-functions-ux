import { UtilitiesService } from './../../../../utils/utilities';
import { IAction } from '../../../../models/action';
import { START_STREAMING, STOP_STREAMING, CLEAR_LOG_ENTRIES, COPY_LOG_ENTRIES, RECONNECT_LOG_STREAM } from './actions';
import { LogEntry, LogLevel } from 'src/pages/app/log-stream/LogStream.Types';

export interface ILogStreamState {
  loading: boolean;
  resourceId: string;
  isStreaming: boolean;
  logEntries: LogEntry[];
  clearLogs: boolean;
}
export const InitialState: ILogStreamState = {
  loading: false,
  resourceId: '',
  isStreaming: true,
  logEntries: [
    {
      message: 'jfkjdkf1',
      level: LogLevel.Normal,
    },
    {
      message: 'jfkjdkf2',
      level: LogLevel.Error,
    },
    {
      message: 'jfkjdkf3',
      level: LogLevel.Warning,
    },
    {
      message: 'jfkjdkf4',
      level: LogLevel.Info,
    },
    {
      message: 'jfkjdkf5',
      level: LogLevel.Unknown,
    },
  ],
  clearLogs: false,
};

const logStream = (state = InitialState, action: IAction<Partial<ILogStreamState>>) => {
  switch (action.type) {
    case CLEAR_LOG_ENTRIES:
      return { ...state, logEntries: [], clearLogs: true };
    case START_STREAMING:
      return { ...state, isStreaming: true };
    case STOP_STREAMING:
      return { ...state, isStreaming: false };
    case RECONNECT_LOG_STREAM:
      return { ...state, clearLogs: false };
    case COPY_LOG_ENTRIES:
      let logContent = '';
      state.logEntries.forEach(logEntry => {
        logContent += `${logEntry.message}\n`;
      });
      UtilitiesService.copyContentToClipboard(logContent);
      return state;
    default:
      return state;
  }
};

export default logStream;
