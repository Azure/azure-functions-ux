import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchSiteRequest } from '../../../modules/site/actions';
import { compose } from 'recompose';
import { translate } from 'react-i18next';
import { RootState, RootAction } from '../../../modules/types';
import LogStreamCommandBar from './LogStreamCommandBar';
import LogStreamLogContainer from './LogStreamLogContainer';
import { LogEntry } from './LogStream.Types';
import { stopStreaming, startStreaming, clearLogEntries, updateWebServerLogs } from '../../../modules/site/config/logstream/actions';
import { startStreamingRequest } from '../../../modules/site/config/logstream/thunk';
import { bindActionCreators, Dispatch } from 'redux';
import { SiteState } from '../../../modules/site/reducer';

export interface LogStreamProps {
  fetchSite: () => void;
  reconnect: () => void;
  pause: () => void;
  start: () => void;
  clear: () => void;
  updateLogOption: (useWebServer: boolean) => void;
  isStreaming: boolean;
  site: SiteState;
  clearLogs: boolean;
  logEntries: LogEntry[];
}

export const LogStream: React.SFC<LogStreamProps> = props => {
  const { site, reconnect, pause, start, clear, updateLogOption, isStreaming, logEntries, clearLogs } = props;
  useEffect(() => {
    props.fetchSite();
  }, []);

  useEffect(
    () => {
      if (site && site.data && site.data.properties && site.data.properties.hostNameSslStates) {
        props.reconnect();
      }
    },
    [site.data.id]
  );
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
        clear={clear}
        reconnect={reconnect}
        updateLogOption={updateLogOption}
      />
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    isStreaming: state.logStream.isStreaming,
    site: state.site,
    clearLogs: state.logStream.clearLogs,
    logEntries: state.logStream.logEntries,
    xhReq: state.logStream.xhReq,
    timeouts: state.logStream.timeouts,
    logStreamIndex: state.logStream.logStreamIndex,
    webServerLogs: state.logStream.webServerLogs,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      fetchSite: fetchSiteRequest,
      reconnect: startStreamingRequest,
      pause: stopStreaming,
      start: startStreaming,
      clear: clearLogEntries,
      updateLogOption: updateWebServerLogs,
    },
    dispatch
  );

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  translate('translation')
)(LogStream);
