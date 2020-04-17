import React from 'react';
import { LogEntry, LogsEnabled, LogType } from './LogStream.types';
import { processLogs, processLogConfig, logStreamEnabled } from './LogStreamData';
import LogStream from './LogStream';
import SiteService from '../../../ApiHelpers/SiteService';
import LogService from '../../../utils/LogService';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { isFunctionApp } from '../../../utils/arm-utils';
import Url from '../../../utils/url';

export interface LogStreamDataLoaderProps {
  resourceId: string;
}

export interface LogStreamDataLoaderState {
  isStreaming: boolean;
  logEntries: LogEntry[];
  clearLogs: boolean;
  connectionError: boolean;
  logType: LogType;
  site: ArmObj<Site>;
  logsEnabled: LogsEnabled;
}

class LogStreamDataLoader extends React.Component<LogStreamDataLoaderProps, LogStreamDataLoaderState> {
  private _currentSiteId = '';
  private _xhReq: XMLHttpRequest;
  private _logStreamIndex = 0;
  private _logType = LogType.Application;
  private _timeStart = 0;

  constructor(props) {
    super(props);
    this.state = {
      isStreaming: true,
      logEntries: [],
      clearLogs: false,
      connectionError: false,
      logType: this._logType,
      site: {
        id: '',
        name: '',
        location: '',
        properties: {} as Site,
      },
      logsEnabled: { applicationLogs: false, webServerLogs: false },
    };
    LogService.stopTrackPage('shell', { feature: 'LogStream' });
  }

  public async componentWillMount() {
    const { resourceId } = this.props;
    const [siteCall, logsConfigCall] = await Promise.all([SiteService.fetchSite(resourceId), SiteService.fetchLogsConfig(resourceId)]);

    if (siteCall.metadata.success && logsConfigCall.metadata.success) {
      this.setState({ site: siteCall.data });
      this.setState({ logsEnabled: processLogConfig(siteCall.data.properties, logsConfigCall.data.properties) });
    }
  }

  public componentDidUpdate() {
    if (this.props.resourceId !== this._currentSiteId && logStreamEnabled(this.state.logType, this.state.logsEnabled)) {
      this._currentSiteId = this.props.resourceId;
      this._reconnectFunction();
    }
  }

  public render() {
    return (
      <>
        <LogStream
          reconnect={this._reconnectFunction}
          pause={this._pauseFunction}
          start={this._startFunction}
          clear={this._clearFunction}
          updateLogOption={this._updateLogOptionFunction}
          isStreaming={this.state.isStreaming}
          site={this.state.site}
          clearLogs={this.state.clearLogs}
          logEntries={this.state.logEntries}
          connectionError={this.state.connectionError}
          logType={this.state.logType}
          logsEnabled={this.state.logsEnabled}
        />
      </>
    );
  }

  private _pauseFunction = () => {
    this.setState({
      isStreaming: false,
    });
  };

  private _startFunction = () => {
    this.setState({
      isStreaming: true,
    });
    this._printNewLogs(true);
  };

  private _clearFunction = () => {
    this.setState({
      logEntries: [],
      clearLogs: true,
    });
  };

  private _updateLogOptionFunction = (useWebServer: boolean) => {
    this._logType = useWebServer ? LogType.WebServer : LogType.Application;
    this.setState({
      logEntries: [],
      clearLogs: false,
      logType: this._logType,
    });
    this._reconnectFunction();
  };

  private _reconnectFunction = () => {
    this.setState({
      connectionError: false,
    });
    this._closeStream();
    this._openStream();
    this._listenForErrors();
    this._listenForProgress();
  };

  private _closeStream = () => {
    if (this._xhReq) {
      this._xhReq.abort();
      this._logStreamIndex = 0;
      this._timeStart = 0;
    }
  };

  private _openStream = () => {
    if (!this.state.site || !logStreamEnabled(this._logType, this.state.logsEnabled)) {
      return;
    }
    const logUrl = this._setLogUrl();
    const token = window.appsvc && window.appsvc.env && window.appsvc.env.armToken;
    this._xhReq = new XMLHttpRequest();
    this._xhReq.open('GET', logUrl, true);
    this._xhReq.setRequestHeader('Authorization', `Bearer ${token}`);
    this._xhReq.setRequestHeader('FunctionsPortal', '1');
    this._xhReq.send(null);
    this._timeStart = new Date().getMinutes();
  };

  private _listenForErrors = () => {
    if (this._xhReq) {
      this._xhReq.onerror = () => {
        this.setState({
          connectionError: true,
        });
        // Automatically attempt to reconnect the connection
        // if connection has been open for less than 15 minutes
        const errorTime = new Date().getMinutes();
        if (Math.abs(this._timeStart - errorTime) < 15) {
          this._reconnectFunction();
        }
      };
    }
  };

  private _listenForProgress = () => {
    if (this._xhReq) {
      this._xhReq.onprogress = () => {
        this._printNewLogs();
      };
    }
  };

  private _printNewLogs = (dumpLogs?: boolean) => {
    const newLogStream = this._xhReq.responseText.substring(this._logStreamIndex);
    if (this.state.isStreaming || dumpLogs) {
      this._logStreamIndex = this._xhReq.responseText.length;
      if (newLogStream) {
        const oldLogs = this.state.logEntries;
        const newLogs = processLogs(newLogStream, oldLogs);
        this.setState({
          logEntries: newLogs,
        });
      }
    }
  };

  private _setLogUrl = (): string => {
    const scmUrl = Url.getScmUrl(this.state.site);

    if (isFunctionApp(this.state.site) && this._logType === LogType.Application) {
      return `${scmUrl}/api/logstream/application/functions/host`;
    }

    const suffix = this._logType === LogType.WebServer ? 'http' : '';
    return `${scmUrl}/api/logstream/${suffix}`;
  };
}

export default LogStreamDataLoader;
