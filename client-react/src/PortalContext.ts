import * as React from 'react';
import PortalCommunicator from './portal-communicator';

export const PortalContext = React.createContext(new PortalCommunicator());
