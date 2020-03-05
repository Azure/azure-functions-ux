import React from 'react';
import { FunctionAppEditMode } from './models/portal-models';

export interface SiteStateProps {
  stopped: boolean;
  readOnlyState: FunctionAppEditMode;
}

export const SiteStateContext = React.createContext<SiteStateProps>({
  stopped: false,
  readOnlyState: FunctionAppEditMode.ReadWrite,
});
