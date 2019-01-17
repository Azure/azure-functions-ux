import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { ArmObj, SlotConfigNames } from '../../../../models/WebAppModels';
import { metadataReducer } from '../../../ApiReducerHelper';
import { ApiState } from '../../../types';
import * as actions from './actions';
import { AREA_STRING, SLOT_CONFIG_FETCH_SUCCESS, SLOT_CONFIG_UPDATE_SUCCESS } from './actionTypes';

export type SlotConfigAction = ActionType<typeof actions>;

export type SlotConfigNamesState = ApiState<ArmObj<SlotConfigNames>>;
export const InitialState = {
  data: {
    id: '',
    properties: {
      appSettingNames: [],
      connectionStringNames: [],
      azureStorageConfigNames: [],
    },
    name: '',
    location: '',
    kind: '',
  },
};

export default combineReducers<SlotConfigNamesState, SlotConfigAction>({
  metadata: metadataReducer(AREA_STRING),
  data: (state = InitialState.data, action) => {
    switch (action.type) {
      case SLOT_CONFIG_FETCH_SUCCESS:
        return action.slotConfig;
      case SLOT_CONFIG_UPDATE_SUCCESS:
        return action.slotConfig;
      default:
        return state;
    }
  },
});
