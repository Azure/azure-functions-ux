import * as React from 'react';
import { PortalContext } from '../PortalContext';
import { PortalCommunicator } from '../portal-communicator';
import { LogEntryLevel } from '../models/portal-models';

export default class ErrorLogger extends React.Component<{}, {}> {
  public static contextType = PortalContext;
  public context: PortalCommunicator;

  public componentDidCatch(error, info) {
    this.context.logMessage(LogEntryLevel.Error, error, info);
  }

  public render() {
    return this.props.children;
  }
}
