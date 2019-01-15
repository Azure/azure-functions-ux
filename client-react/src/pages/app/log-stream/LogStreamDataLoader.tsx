import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchSiteRequest } from '../../../modules/site/actions';
import { SiteState } from '../../../modules/site/reducer';
import { RootAction, RootState } from '../../../modules/types';
import { LogEntry, timerInterval } from './LogStream.types';
import { translate } from 'react-i18next';
// import { startStreamingRequest } from './LogStreamData';
import { store } from '../../../store';
import { _processLogs } from './LogStreamData';

export interface LogStreamDataLoaderProps {
  children: (
    props: {
      //Child props including computed in this component
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
  ) => JSX.Element;

  //Props passed directly into this component
  fetchSite: () => void;
  site: SiteState;
}

const LogStreamDataLoader: React.SFC<LogStreamDataLoaderProps> = props => {
  const emptyLogEntries: LogEntry[] = [];
  const { fetchSite, site } = props;
  const [isStreaming, setIsStreaming] = React.useState(true);
  const [clearLogs, setClearLogs] = React.useState(false);
  const [logEntries, setLogEntries] = React.useState(emptyLogEntries);

  let xhReq = new XMLHttpRequest();
  let timeouts: number[] = [];
  let logStreamIndex = 0;
  let webServerLogs = false;

  const reconnect = () => {
    const hostNameSslStates = site.data.properties.hostNameSslStates;
    const scmHostName =
      hostNameSslStates && hostNameSslStates.length > 0 ? hostNameSslStates.find(h => !!h.name && h.name.includes('.scm.'))!.name : '';
    const suffix = webServerLogs ? 'http' : '';
    const logUrl = `https://${scmHostName}/api/logstream/${suffix}`;
    const token = store.getState().portalService.startupInfo!.token;
    if (xhReq) {
      timeouts.forEach(window.clearTimeout);
      xhReq.abort();
      timeouts = [];
    }
    xhReq = new XMLHttpRequest();
    xhReq.open('GET', logUrl, true);
    xhReq.setRequestHeader('Authorization', `Bearer ${token}`);
    xhReq.setRequestHeader('FunctionsPortal', '1');
    xhReq.send(null);
    callBack();
  };

  const callBack = () => {
    if (isStreaming && logStreamIndex !== xhReq.responseText.length) {
      const newLogStream = xhReq.responseText.substring(logStreamIndex);
      if (newLogStream !== '') {
        const oldLogs = logEntries;
        const newLogs = _processLogs(newLogStream, oldLogs);
        setLogEntries(newLogs);
      }
      logStreamIndex = xhReq.responseText.length;
      window.setTimeout(() => {
        const el = document.getElementById('log-body');
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      });
    }
    if (xhReq.readyState !== XMLHttpRequest.DONE) {
      timeouts.push(window.setTimeout(callBack, timerInterval));
    }
  };

  // const reconnect = () => {
  //   startStreamingRequest(
  //     xhReq,
  //     setXhReq,
  //     timeouts,
  //     setTimeouts,
  //     logStreamIndex,
  //     setLogStreamIndex,
  //     webServerLogs,
  //     isStreaming,
  //     logEntries,
  //     setLogEntries
  //   );
  // };

  // const updateRequest = () => {
  //   sendRequest(xhReq, timeouts, setTimeouts, isStreaming, logStreamIndex, setLogStreamIndex, logEntries, setLogEntries);
  // };

  const pause = () => {
    setIsStreaming(false);
    callBack();
  };

  const start = () => {
    setIsStreaming(true);
    callBack();
  };

  const clear = () => {
    setClearLogs(true);
    setLogEntries([]);
    callBack();
  };

  const updateLogOption = (useWebServer: boolean) => {
    webServerLogs = useWebServer;
    clear();
    reconnect();
  };

  useEffect(() => {
    fetchSite();
  }, []);

  useEffect(
    () => {
      const site = props.site;
      if (site && site.data && site.data.properties && site.data.properties.hostNameSslStates) {
        reconnect();
      }
    },
    [site.data.id]
  );

  return <>{props.children({ reconnect, pause, start, clear, updateLogOption, isStreaming, site, clearLogs, logEntries })}</>;
};

const mapStateToProps = (state: RootState) => {
  return {
    site: state.site,
    token: state.portalService.startupInfo!.token,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      fetchSite: fetchSiteRequest,
    },
    dispatch
  );

export default compose(
  translate('translation'),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(LogStreamDataLoader);
