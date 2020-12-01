import React from 'react';

import { LogEntryLevel } from '../models/portal-models';
import PortalCommunicator from '../portal-communicator';
import { PortalContext } from '../PortalContext';

export default class ErrorLogger extends React.Component<{}, {}> {
  public static contextType = PortalContext;
  public context!: PortalCommunicator;

  public componentDidCatch(error, info) {
    this.context.logMessageDeprecated(LogEntryLevel.Error, error, info);
  }

  public render() {
    return this.props.children;
  }
}
