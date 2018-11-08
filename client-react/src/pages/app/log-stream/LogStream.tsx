import * as React from 'react';
import { connect } from 'react-redux';
import { fetchSite } from '../../../modules/site/thunks';
import { compose } from 'recompose';
import { translate } from 'react-i18next';
import IState from '../../../modules/types';
import { ArmObj, Site } from 'src/models/WebAppModels';
import LogStreamCommandBar from './LogStreamCommandBar';
import LogStreamLogContainer from './LogStreamLogContainer';
import { LogEntry, LogLevel } from './LogStream.Types';

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

export interface LogStreamState {
  isConnected: boolean;
}

export class LogStream extends React.Component<LogStreamProps, LogStreamState> {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
    };
  }

  public componentWillMount() {
    this.props.fetchSite();
  }

  public render() {
    return (
      <>
        <LogStreamCommandBar
          reconnect={this.props.reconnect}
          copy={this.props.copy}
          pause={this.props.pause}
          start={this.props.start}
          clear={this.props.clear}
          isStreaming={this.props.isStreaming}
        />
        <LogStreamLogContainer clearLogs={this.props.clearLogs} logEntries={this.props.logEntries} />
      </>
    );
  }
}

const mapStateToProps = (state: IState) => {
  return {
    isStreaming: true,
    site: state.site.site,
    clearLogs: false,
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
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchSite: () => dispatch(fetchSite()),
    reconnect: () => dispatch(),
    copy: () => dispatch(),
    pause: () => dispatch(),
    start: () => dispatch(),
    clear: () => dispatch(),
  };
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  translate('translation')
)(LogStream);
