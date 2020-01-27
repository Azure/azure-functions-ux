import React from 'react';
import { FunctionAppEditMode } from './models/portal-models';

export const SiteStateContext = React.createContext<FunctionAppEditMode>(FunctionAppEditMode.ReadWrite);
