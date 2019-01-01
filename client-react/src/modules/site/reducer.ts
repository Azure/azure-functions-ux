import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { ArmObj, Site } from '../../models/WebAppModels';
import { metadataReducer } from '../ApiReducerHelper';
import { ApiState } from '../types';
import * as actions from './actions';
import { AREA_STRING, SITE_FETCH_SUCCESS, SITE_UPDATE_SUCCESS, UPDATE_RESOURCE_ID } from './actionTypes';

export type SiteAction = ActionType<typeof actions>;

export interface SiteState extends ApiState<ArmObj<Site>> {
  resourceId: string;
}
export const InitialState = {
  resourceId: '',
  data: {
    id: '',
    properties: {} as any,
    name: '',
    location: '',
    kind: '',
  },
};

export default combineReducers<SiteState, SiteAction>({
  metadata: metadataReducer(AREA_STRING),
  resourceId: (state = InitialState.resourceId, action) => {
    switch (action.type) {
      case UPDATE_RESOURCE_ID:
        return action.id;
      default:
        return state;
    }
  },
  data: (state = InitialState.data, action) => {
    switch (action.type) {
      case SITE_FETCH_SUCCESS:
        return action.site;
      case SITE_UPDATE_SUCCESS:
        return action.site;
      default:
        return state;
    }
  },
});
