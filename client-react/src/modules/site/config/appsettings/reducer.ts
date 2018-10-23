import { IAction } from '../../../../models/action';
import { UPDATE_SITE_APP_SETTINGS, UPDATE_SITE_APP_SETTINGS_NO_CACHE } from './actions';
import { DEFAULT_KEY, generateCacheTTL } from 'redux-cache';
import { AppSetting } from './appsettings.types';

export interface IAppSettingsState {
  loading: boolean;
  saving: boolean;
  resourceId: string;
  settings: AppSetting[];
}
export const InitialState: IAppSettingsState = {
  [DEFAULT_KEY]: null,
  loading: false,
  resourceId: '',
  saving: false,
  settings: [],
};

const appSettings = (state = InitialState, action: IAction<any>) => {
  switch (action.type) {
    case UPDATE_SITE_APP_SETTINGS:
      return {
        ...state,
        [DEFAULT_KEY]: generateCacheTTL(60000),
        ...action.payload,
      };
    case UPDATE_SITE_APP_SETTINGS_NO_CACHE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default appSettings;
