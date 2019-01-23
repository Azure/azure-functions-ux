import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { AvailableStack } from '../../../models/available-stacks';
import { ArmArray } from '../../../models/WebAppModels';
import { metadataReducer } from '../../ApiReducerHelper';
import { ApiState } from '../../types';
import * as actions from './actions';
import { AREA_STRING, STACKS_FETCH_SUCCESS } from './actionTypes';

export type StacksAction = ActionType<typeof actions>;
export type StacksState = ApiState<ArmArray<AvailableStack>>;
export const InitialState = {
  data: {
    value: [],
  },
};

export default combineReducers<StacksState, StacksAction>({
  metadata: metadataReducer(AREA_STRING),
  data: (state = InitialState.data, action) => {
    switch (action.type) {
      case STACKS_FETCH_SUCCESS:
        return action.stacks;
      default:
        return state;
    }
  },
});
