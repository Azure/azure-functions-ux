import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { BillingMeter } from '../../../models/BillingModels';
import { ArmArray } from '../../../models/WebAppModels';
import { metadataReducer } from '../../ApiReducerHelper';
import { ApiState } from '../../types';
import * as actions from './actions';
import { AREA_STRING, BILLING_METERS_FETCH_SUCCESS } from './actionTypes';

export type BillingMetersAction = ActionType<typeof actions>;
export type BillingMetersState = ApiState<ArmArray<BillingMeter>>;

export const InitialState = {
  data: {
    value: [],
  },
};

export default combineReducers<BillingMetersState, BillingMetersAction>({
  metadata: metadataReducer(AREA_STRING),
  data: (state = InitialState.data, action) => {
    switch (action.type) {
      case BILLING_METERS_FETCH_SUCCESS:
        return action.meters;
      default:
        return state;
    }
  },
});
