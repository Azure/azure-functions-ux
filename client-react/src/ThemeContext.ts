import React from 'react';
import { lightTheme } from './theme/light';
import { ThemeExtended } from './theme/SemanticColorsExtended';

export const ThemeContext = React.createContext<ThemeExtended>(lightTheme as ThemeExtended);
