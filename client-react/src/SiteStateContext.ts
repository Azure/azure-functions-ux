import React from 'react';
import { SiteState } from './models/portal-models';

export const SiteStateContext = React.createContext<SiteState>(SiteState.readwrite);
