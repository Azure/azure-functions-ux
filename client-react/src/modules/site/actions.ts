import { IAction } from '../../models/action';
import { ISiteState } from './reducer';

export const UPDATE_SITE = 'UPDATE_SITE';
export const updateCurrentSite = (state: Partial<ISiteState>): IAction<Partial<ISiteState>> => ({
  payload: state,
  type: UPDATE_SITE,
});

export const UPDATE_SITE_NO_CACHE = 'UPDATE_SITE';
export const updateCurrentSiteNoCache = (state: Partial<ISiteState>): IAction<Partial<ISiteState>> => ({
  payload: state,
  type: UPDATE_SITE_NO_CACHE,
});

export const UPDATE_RESOURCE_ID = 'UPDATE_RESOURCE_ID';
export const updateResourceIdAtomic = (resourceId: string): IAction<string> => ({
  payload: resourceId,
  type: UPDATE_RESOURCE_ID,
});
