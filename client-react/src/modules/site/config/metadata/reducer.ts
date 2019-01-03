import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { ArmObj } from '../../../../models/WebAppModels';
import { metadataReducer } from '../../../ApiReducerHelper';
import { ApiState } from '../../../types';
import * as actions from './actions';
import { AREA_STRING, METADATA_FETCH_SUCCESS, METADATA_UPDATE_SUCCESS } from './actionTypes';

export type MetadataAction = ActionType<typeof actions>;
export type Metadata = { [key: string]: string };
export type MetadataState = ApiState<ArmObj<Metadata>>;
export const InitialState = {
  data: {
    id: '',
    properties: {},
    name: '',
    location: '',
    kind: '',
  },
};

export default combineReducers<MetadataState, MetadataAction>({
  metadata: metadataReducer(AREA_STRING),
  data: (state = InitialState.data, action) => {
    switch (action.type) {
      case METADATA_FETCH_SUCCESS:
        return action.metadata;
      case METADATA_UPDATE_SUCCESS:
        return action.metadata;
      default:
        return state;
    }
  },
});
