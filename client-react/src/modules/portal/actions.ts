import { createStandardAction } from 'typesafe-actions';

import { IStartupInfo } from '../../models/portal-models';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { GET_STARTUP_INFO, SETUP_IFRAME, UPDATE_THEME, UPDATE_TOKEN } from './actionTypes';

export const setupIFrameAction = createStandardAction(SETUP_IFRAME).map((shellSrc: string) => ({
  shellSrc,
}));

export const getStartupInfoAction = createStandardAction(GET_STARTUP_INFO).map((startupInfo: IStartupInfo) => ({
  startupInfo,
}));
export const updateTheme = createStandardAction(UPDATE_THEME).map((theme: ThemeExtended) => ({
  theme,
}));

export const updateToken = createStandardAction(UPDATE_TOKEN).map((token: string) => ({
  token,
}));
