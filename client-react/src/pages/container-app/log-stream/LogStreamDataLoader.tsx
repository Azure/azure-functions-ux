import React from 'react';

import LogService from '../../../utils/LogService';

import LogStream, { LogStreamProps } from './LogStream';

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
