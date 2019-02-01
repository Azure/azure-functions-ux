import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { StorageAccount, ArmArray } from '../../models/WebAppModels';
import { metadataReducer } from '../ApiReducerHelper';
import { ApiState } from '../types';
import * as actions from './actions';
import { AREA_STRING, STORAGE_ACCOUNTS_FETCH_SUCCESS } from './actionTypes';

export type StorageAccountAction = ActionType<typeof actions>;
export type StorageAccountsState = ApiState<ArmArray<StorageAccount>>;
export const InitialState = {
  data: {
    value: [],
  },
};

export default combineReducers<StorageAccountsState, StorageAccountAction>({
  metadata: metadataReducer(AREA_STRING),
  data: (state = InitialState.data, action) => {
    switch (action.type) {
      case STORAGE_ACCOUNTS_FETCH_SUCCESS:
        return action.accounts;
      default:
        return state;
    }
  },
});
