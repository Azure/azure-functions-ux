import { IAction } from '../../../../models/action';
import { IConnectionStringState } from './reducer';

export interface IConnectionString {
  name: string;
  value: string;
  type: number;
  sticky: boolean;
}

export const UPDATE_SITE_CONNECTION_STRINGS = 'UPDATE_SITE_CONNECTION_STRINGS';
export const updateCurrentSiteConnectionStrings = (
  connString: Partial<IConnectionStringState>
): IAction<Partial<IConnectionStringState>> => ({
  payload: connString,
  type: UPDATE_SITE_CONNECTION_STRINGS,
});

export const UPDATE_SITE_CONNECTION_STRINGS_NO_CACHE = 'UPDATE_SITE_CONNECTION_STRINGS_NO_CACHE';
export const updateCurrentSiteConnectionStringsNoCache = (
  connString: Partial<IConnectionStringState>
): IAction<Partial<IConnectionStringState>> => ({
  payload: connString,
  type: UPDATE_SITE_CONNECTION_STRINGS_NO_CACHE,
});
