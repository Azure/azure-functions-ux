import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { ArmArray, Site } from '../../../models/WebAppModels';
import { metadataReducer } from '../../ApiReducerHelper';
import { ApiState } from '../../types';
import * as actions from './actions';
import { AREA_STRING, SLOTS_FETCH_SUCCESS } from './actionTypes';

export type SlotsAction = ActionType<typeof actions>;
export type SlotsState = ApiState<ArmArray<Site>>;
export const InitialState = {
  data: { value: [] },
};

export default combineReducers<SlotsState, SlotsAction>({
  metadata: metadataReducer(AREA_STRING),
  data: (state = InitialState.data, action) => {
    switch (action.type) {
      case SLOTS_FETCH_SUCCESS:
        return action.slotList;
      default:
        return state;
    }
  },
});
