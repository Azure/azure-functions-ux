import React from 'react';
import LogStream, { LogStreamProps } from './LogStream';
import LogService from '../../../utils/LogService';

class LogStreamDataLoader extends React.Component<LogStreamProps> {
  constructor(props) {
    super(props);
    this.state = {};
    LogService.stopTrackPage('shell', { feature: 'ContainerAppLogStream' });
  }

  public render() {
    return <LogStream {...this.props} />;
  }
}

export default LogStreamDataLoader;
