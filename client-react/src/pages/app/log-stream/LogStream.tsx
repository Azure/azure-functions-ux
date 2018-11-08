import * as React from 'react';
import { connect } from 'react-redux';
import { fetchSite } from '../../../modules/site/thunks';
import { compose } from 'recompose';
import { translate } from 'react-i18next';
import IState from '../../../modules/types';
import { ArmObj, Site } from 'src/models/WebAppModels';
import LogStreamCommandBar from './LogStreamCommandBar';
import LogStreamLogContainer from './LogStreamLogContainer';
import { LogEntry } from './LogStream.Types';
import {
  startStreaming,
  stopStreaming,
  clearLogEntries,
  copyLogEntries,
  reconnectLogStream,
} from 'src/modules/site/config/logstream/actions';

export interface LogStreamProps {
  fetchSite: () => Promise<ArmObj<Site>>;
  reconnect: () => void;
  copy: () => void;
  pause: () => void;
  start: () => void;
  clear: () => void;
  isStreaming: boolean;
  site: ArmObj<Partial<Site>>;
  clearLogs: boolean;
  logEntries: LogEntry[];
}

export class LogStream extends React.Component<LogStreamProps> {
  constructor(props) {
    super(props);
  }

  public componentWillMount() {
    this.props.fetchSite();
  }

  public render() {
    const { reconnect, copy, pause, start, clear, isStreaming, logEntries, clearLogs } = this.props;
    return (
      <>
        <LogStreamCommandBar reconnect={reconnect} copy={copy} pause={pause} start={start} clear={clear} isStreaming={isStreaming} />
        <LogStreamLogContainer clearLogs={clearLogs} logEntries={logEntries} />
      </>
    );
  }
}

const mapStateToProps = (state: IState) => {
  return {
    isStreaming: state.logStream.isStreaming,
    site: state.site.site,
    clearLogs: state.logStream.clearLogs,
    logEntries: state.logStream.logEntries,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchSite: () => dispatch(fetchSite()),
    reconnect: () => dispatch(reconnectLogStream()),
    copy: () => dispatch(copyLogEntries()),
    pause: () => dispatch(stopStreaming()),
    start: () => dispatch(startStreaming()),
    clear: () => dispatch(clearLogEntries()),
  };
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  translate('translation')
)(LogStream);
