import { IAction } from '../../../../models/action';
import { IAppSettingsState } from './reducer';

export const UPDATE_SITE_APP_SETTINGS = 'UPDATE_SITE_APP_SETTINGS';
export const updateCurrentSiteAppSettings = (settings: Partial<IAppSettingsState>): IAction<Partial<IAppSettingsState>> => ({
  payload: settings,
  type: UPDATE_SITE_APP_SETTINGS,
});

export const UPDATE_SITE_APP_SETTINGS_NO_CACHE = 'UPDATE_SITE_APP_SETTINGS_NO_CACHE';
export const updateCurrentSiteAppSettingsNoCache = (settings: Partial<IAppSettingsState>): IAction<Partial<IAppSettingsState>> => ({
  payload: settings,
  type: UPDATE_SITE_APP_SETTINGS,
});
