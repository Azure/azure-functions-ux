import { LogEntry, newLine, LogLevel, LogRegex, maxLogEntries } from './LogStream.types';

export function processLogs(logStream: string, oldLogs: LogEntry[]): LogEntry[] {
  let updatedLogs = oldLogs;
  const logMessages = logStream.split(newLine);
  logMessages.forEach(logMessage => {
    const logLevel = _getLogLevel(logMessage);
    updatedLogs = _addLogEntry(logMessage, logLevel, updatedLogs);
  });
  return updatedLogs;
}

function _getLogLevel(message: string): LogLevel {
  let logLevel = LogLevel.Unknown;
  if (message.match(LogRegex.errorLog)) {
    logLevel = LogLevel.Error;
  } else if (message.match(LogRegex.infoLog)) {
    logLevel = LogLevel.Info;
  } else if (message.match(LogRegex.warningLog)) {
    logLevel = LogLevel.Warning;
  } else if (message.match(LogRegex.log)) {
    logLevel = LogLevel.Normal;
  }
  return logLevel;
}

function _addLogEntry(message: string, logLevel: LogLevel, logEntries: LogEntry[]) {
  const logMessage = message ? message.trim() : message;

  if (!!logMessage) {
    if (logLevel === LogLevel.Unknown) {
      if (logEntries.length === 0) {
        logEntries.push({
          message: logMessage,
          level: LogLevel.Normal,
        });
      } else {
        // If a message is unknown, then we assume it's just a continuation of a previous line and just prepend it to
        // the previous line.  This allows us to write out single line entries for logs that are not formatted correctly.
        // Like for example, Functions logs formatted JSON objects to the console which looks ok, but breaks each log line
        // and formatting of each line.  Making this assumption of simply appending unknown strings to the previous line
        // may not be correct, but so far it seems to check out okay with our standard web apps logging format. -Krrish
        logEntries[logEntries.length - 1].message += logMessage;
      }
    } else {
      logEntries.push({
        message: logMessage,
        level: logLevel,
      });
    }

    if (logEntries.length > maxLogEntries) {
      logEntries.splice(0, 1);
    }
  }
  return logEntries;
}
