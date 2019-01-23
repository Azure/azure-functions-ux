import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { ArmObj, SiteConfig } from '../../../../models/WebAppModels';
import { metadataReducer } from '../../../ApiReducerHelper';
import { ApiState } from '../../../types';
import * as actions from './actions';
import { AREA_STRING, WEB_CONFIG_FETCH_SUCCESS, WEB_CONFIG_UPDATE_SUCCESS } from './actionTypes';

export type ConfigAction = ActionType<typeof actions>;

export type ConfigStateType = ApiState<ArmObj<SiteConfig>>;
export const InitialState = {
  data: {
    id: '',
    properties: {} as any,
    name: '',
    location: '',
    kind: '',
  },
};

export default combineReducers<ConfigStateType, ConfigAction>({
  metadata: metadataReducer(AREA_STRING),
  data: (state = InitialState.data, action) => {
    switch (action.type) {
      case WEB_CONFIG_FETCH_SUCCESS:
        return action.webConfig;
      case WEB_CONFIG_UPDATE_SUCCESS:
        return action.webConfig;
      default:
        return state;
    }
  },
});
