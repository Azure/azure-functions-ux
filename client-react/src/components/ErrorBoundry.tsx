import * as React from 'react';
import { PortalContext } from '../index';
import { PortalCommunicator } from '../portal-communicator';
import { LogEntryLevel } from 'src/models/portal-models';

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
