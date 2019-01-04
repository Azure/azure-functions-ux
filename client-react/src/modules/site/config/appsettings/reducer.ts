import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { ArmObj } from '../../../../models/WebAppModels';
import { metadataReducer } from '../../../ApiReducerHelper';
import { ApiState } from '../../../types';
import * as actions from './actions';
import { APP_SETTINGS_FETCH_SUCCESS, APP_SETTINGS_UPDATE_SUCCESS, AREA_STRING, UPDATE_APP_SETTINGS_FROM_SITE_UPDATE } from './actionTypes';

export type AppSettings = { [key: string]: string };

export type AppSettingsActions = ActionType<typeof actions>;
export type AppSettingsState = ApiState<ArmObj<AppSettings>>;

export const InitialState = {
  data: {
    id: '',
    properties: {},
    name: '',
    location: '',
    kind: '',
  },
};

export default combineReducers<AppSettingsState, AppSettingsActions>({
  metadata: metadataReducer(AREA_STRING),
  data: (state = InitialState.data, action) => {
    switch (action.type) {
      case APP_SETTINGS_FETCH_SUCCESS:
        return action.appSettings;
      case APP_SETTINGS_UPDATE_SUCCESS:
        return action.appSettings;
      case UPDATE_APP_SETTINGS_FROM_SITE_UPDATE:
        return { ...state, properties: action.appSettings ? action.appSettings : state.properties };
      default:
        return state;
    }
  },
});
