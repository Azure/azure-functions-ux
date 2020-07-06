import React from 'react';
import { FunctionAppEditMode } from './models/portal-models';
import { ArmObj } from './models/arm-obj';
import { Site } from './models/site/site';

export interface ISiteState {
  stopped: boolean;
  siteAppEditState: FunctionAppEditMode;
  resourceId?: string;
  site?: ArmObj<Site>;
}

export const SiteStateContext = React.createContext<ISiteState>({} as ISiteState);
