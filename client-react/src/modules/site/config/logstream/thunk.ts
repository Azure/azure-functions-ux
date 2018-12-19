import IState from '../../../types';
import { updateLogStreamIndex, updateTimeouts, updateLogEntries, reconnectLogStream } from './actions';
import { timerInterval, newLine, LogEntry, LogRegex, LogLevel, maxLogEntries } from '../../../../pages/app/log-stream/LogStream.Types';

export function startStreamingRequest() {
  return async (dispatch: any, getState: () => IState) => {
    dispatch(reconnectLogStream());
    const token = getState().portalService.startupInfo!.token;
    // const hostNameSslStates = getState().site.site.properties.hostNameSslStates;
    // const scmHostName = hostNameSslStates && hostNameSslStates.length > 0 ?
    //     hostNameSslStates.find(h => !!h.name && h.name.includes('.scm.'))!.name // update
    //     : '';
    // const logUrl = `https://${scmHostName}/api/logstream/`;
    const logUrl = `https://andimarc-linux-app.scm.azurewebsites.net/api/logstream/`;
    let logStreamIndex = getState().logStream.logStreamIndex;
    let allTimeouts = getState().logStream.timeouts;
    let xhReq = getState().logStream.xhReq;
    if (xhReq) {
      allTimeouts.forEach(window.clearTimeout);
      xhReq.abort();
      allTimeouts = [];
      dispatch(updateTimeouts(allTimeouts));
    }
    xhReq = new XMLHttpRequest();
    xhReq.open('GET', logUrl, true);
    xhReq.setRequestHeader('Authorization', `Bearer ${token}`);
    xhReq.setRequestHeader('FunctionsPortal', '1');
    xhReq.send(null);
    const callBack = () => {
      if (getState().logStream.isStreaming && logStreamIndex !== xhReq.responseText.length) {
        const newLogStream = xhReq.responseText.substring(logStreamIndex);
        if (newLogStream !== '') {
          const oldLogs = getState().logStream.logEntries;
          const newLogs = _processLogs(newLogStream, oldLogs);
          dispatch(updateLogEntries(newLogs));
        }
        logStreamIndex = xhReq.responseText.length;
        dispatch(updateLogStreamIndex(logStreamIndex));
        window.setTimeout(() => {
          const el = document.getElementById('log-body');
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
        });
      }
      if (xhReq.readyState !== XMLHttpRequest.DONE) {
        allTimeouts.push(window.setTimeout(callBack, timerInterval));
        dispatch(updateTimeouts(allTimeouts));
      }
    };
    callBack();
  };
}

function _processLogs(logStream: string, oldLogs: LogEntry[]): LogEntry[] {
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
