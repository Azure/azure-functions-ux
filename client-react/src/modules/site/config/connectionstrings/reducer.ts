import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { ArmObj } from '../../../../models/WebAppModels';
import { metadataReducer } from '../../../ApiReducerHelper';
import { ApiState } from '../../../types';
import * as actions from './actions';
import { AREA_STRING, CONNECTION_STRINGS_FETCH_SUCCESS, CONNECTION_STRINGS_UPDATE_SUCCESS } from './actionTypes';

export type ConnectionString = { [key: string]: { value: string; type: number } };

export type ConnectionStringActions = ActionType<typeof actions>;
export type ConnectionStringState = ApiState<ArmObj<ConnectionString>>;

export const InitialState = {
  data: {
    id: '',
    properties: {},
    name: '',
    location: '',
    kind: '',
  },
};
export default combineReducers<ConnectionStringState, ConnectionStringActions>({
  metadata: metadataReducer(AREA_STRING),
  data: (state = InitialState.data, action) => {
    switch (action.type) {
      case CONNECTION_STRINGS_FETCH_SUCCESS:
        return action.connectionStrings;
      case CONNECTION_STRINGS_UPDATE_SUCCESS:
        return action.connectionStrings;
      default:
        return state;
    }
  },
});
