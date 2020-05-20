import { LogEntry, LogLevel } from './FunctionLog.types';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { LogRegex, LogLevel as FBLogLevel, maxLogEntries } from '../../../log-stream/LogStream.types';

export function processLogs(logStream: string, oldLogs: LogEntry[]): LogEntry[] {
  let updatedLogs = [...oldLogs];
  const logMessages = logStream.split(CommonConstants.newLine);
  logMessages.forEach(logMessage => {
    const logLevel = getLogLevel(logMessage);
    updatedLogs = addLogEntry(logMessage, logLevel, updatedLogs);
  });
  return updatedLogs;
}

function getLogLevel(message: string): FBLogLevel {
  if (message.match(LogRegex.errorLog)) {
    return FBLogLevel.Error;
  }
  if (message.match(LogRegex.infoLog)) {
    return FBLogLevel.Info;
  }
  if (message.match(LogRegex.warningLog)) {
    return FBLogLevel.Warning;
  }
  if (message.match(LogRegex.log)) {
    return FBLogLevel.Normal;
  }
  return FBLogLevel.Unknown;
}

function addLogEntry(message: string, logLevel: FBLogLevel, logEntries: LogEntry[]) {
  const logMessage = !!message ? message.trim() : '';
  const convertedLogLevel = convertLogLevel(logLevel);
  const logColor = getLogTextColor(logLevel);

  if (logLevel === FBLogLevel.Unknown) {
    if (logEntries.length === 0) {
      logEntries.push({
        message: logMessage,
        level: convertedLogLevel,
        color: logColor,
      });
    } else if (logEntries.length > 0 && logEntries[logEntries.length - 1].message === '') {
      logEntries[logEntries.length - 1] = {
        message: logMessage,
        level: convertedLogLevel,
        color: logColor,
      };
    } else {
      // If a message is unknown, then we assume it's just a continuation of a previous line and just prepend it to
      // the previous line.  This allows us to write out single line entries for logs that are not formatted correctly.
      // Like for example, Functions logs formatted JSON objects to the console which looks ok, but breaks each log line
      // and formatting of each line.  Making this assumption of simply appending unknown strings to the previous line
      // may not be correct, but so far it seems to check out okay with our standard web apps logging format. -Krrish
      logEntries[logEntries.length - 1].message += logMessage;
    }
  } else if (logEntries.length > 0 && logEntries[logEntries.length - 1].message === '') {
    logEntries[logEntries.length - 1] = {
      message: logMessage,
      level: convertedLogLevel,
      color: logColor,
    };
  } else {
    logEntries.push({
      message: logMessage,
      level: convertedLogLevel,
      color: logColor,
    });
  }

  if (logEntries.length > maxLogEntries) {
    logEntries.splice(0, 1);
  }

  return logEntries;
}

function convertLogLevel(level: FBLogLevel): LogLevel {
  switch (level) {
    case FBLogLevel.Error:
      return LogLevel.Error;
    case FBLogLevel.Info:
      return LogLevel.Information;
    case FBLogLevel.Warning:
      return LogLevel.Warning;
    default:
      return LogLevel.Verbose;
  }
}

function getLogTextColor(level: FBLogLevel): string {
  switch (level) {
    case FBLogLevel.Error:
      return '#ff6161';
    case FBLogLevel.Info:
      return '#00bfff';
    case FBLogLevel.Warning:
      return 'orange';
    default:
      return 'white';
  }
}
