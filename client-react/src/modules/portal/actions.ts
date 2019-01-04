import { createStandardAction } from 'typesafe-actions';

import { IStartupInfo, INotificationStartedInfo } from '../../models/portal-models';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { GET_STARTUP_INFO, SETUP_IFRAME, UPDATE_THEME, UPDATE_TOKEN, START_NOTIFICATION, SET_NOTIFICATION } from './actionTypes';
import PortalCommunicator from '../../portal-communicator';

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

export type StartNotificationPayload = { title: string; description: string; portalCommuncator: PortalCommunicator };
export const startNotification = createStandardAction(START_NOTIFICATION).map((payload: StartNotificationPayload) => {
  return { ...payload };
});

export const setCurrentNotification = createStandardAction(SET_NOTIFICATION).map(({ id }: INotificationStartedInfo) => ({
  id,
}));

export type StopNotificationPayload = { description: string; success: boolean; portalCommuncator: PortalCommunicator };
export const stopNotification = createStandardAction(START_NOTIFICATION).map((payload: StopNotificationPayload) => {
  return payload;
});
