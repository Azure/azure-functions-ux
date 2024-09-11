import React from 'react';
import LogStream, { LogStreamProps } from './LogStream';

class LogStreamDataLoader extends React.Component<LogStreamProps> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  public render() {
    return <LogStream {...this.props} />;
  }
}

export default LogStreamDataLoader;
