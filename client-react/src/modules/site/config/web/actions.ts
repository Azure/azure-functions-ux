import { IAction } from '../../../../models/action';
import { IWebConfigState } from './reducer';

export const UPDATE_SITE_CONFIG_WEB = 'UPDATE_SITE_CONFIG_WEB';
export const updateCurrentSiteWebConfig = (state: Partial<IWebConfigState>): IAction<Partial<IWebConfigState>> => ({
  payload: state,
  type: UPDATE_SITE_CONFIG_WEB,
});

export const UPDATE_SITE_CONFIG_WEB_NO_CACHE = 'UPDATE_SITE_CONFIG_WEB_NO_CACHE';
export const updateCurrentSiteWebConfigNoCache = (state: Partial<IWebConfigState>): IAction<Partial<IWebConfigState>> => ({
  payload: state,
  type: UPDATE_SITE_CONFIG_WEB_NO_CACHE,
});
