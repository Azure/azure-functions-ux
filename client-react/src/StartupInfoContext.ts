import React from 'react';
import { IStartupInfo } from './models/portal-models';

export const StartupInfoContext = React.createContext<IStartupInfo<any>>({} as IStartupInfo<any>);
