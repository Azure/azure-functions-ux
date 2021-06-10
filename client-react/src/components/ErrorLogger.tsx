import React from 'react';

import PortalCommunicator from '../portal-communicator';
import { PortalContext } from '../PortalContext';

export default class ErrorLogger extends React.Component<{}, {}> {
  public static contextType = PortalContext;
  public context!: PortalCommunicator;

  public componentDidCatch(error, info) {
    this.context.log({
      action: 'componentDidCatch',
      actionModifier: 'error',
      resourceId: '',
      logLevel: 'error',
      data: {
        error,
        info,
      },
    });
  }

  public render() {
    return this.props.children;
  }
}
