import * as React from 'react';
import { connect } from 'react-redux';
import { fetchSite } from '../../../modules/site/thunks';
import { compose } from 'recompose';
import { translate } from 'react-i18next';
import IState from '../../../modules/types';
import { ArmObj, Site } from 'src/models/WebAppModels';
import LogStreamCommandBar from './LogStreamCommandBar';

export interface LogStreamProps {
  fetchSite: () => Promise<ArmObj<Site>>;
  reconnect: () => void;
  copy: () => void;
  pause: () => void;
  start: () => void;
  clear: () => void;
  isStreaming: boolean;
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
      <LogStreamCommandBar
        reconnect={this.props.reconnect}
        copy={this.props.copy}
        pause={this.props.pause}
        start={this.props.start}
        clear={this.props.clear}
        isStreaming={this.props.isStreaming}
      />
    );
  }
}

const mapStateToProps = (state: IState) => {
  return {
    isStreaming: true,
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
