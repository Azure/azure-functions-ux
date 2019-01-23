import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import * as actions from './actions';
import {
  ADD_PERMISSION,
  ADD_PERMISSION_CALLED,
  ADD_READONLY_LOCK,
  ADD_READONLY_LOCK_CALLED,
  REMOVE_PERMISSION,
  REMOVE_PERMISSIONS_CALLED,
  REMOVE_READONLY_LOCK,
  REMOVE_READONLY_LOCK_CALLED,
} from './actionTypes';

export type RbacAction = ActionType<typeof actions>;
export interface IRbacState {
  permissionCalled: string[];
  readonlyLockCalled: string[];
  permissions: { [key: string]: boolean };
  readonlyLocks: { [key: string]: boolean };
}

export default combineReducers<IRbacState, RbacAction>({
  permissionCalled: (state = [], action) => {
    switch (action.type) {
      case ADD_PERMISSION_CALLED:
        return [...state, action.called];
      case REMOVE_PERMISSIONS_CALLED:
        return state.filter(x => x !== action.called);
      default:
        return state;
    }
  },
  readonlyLockCalled: (state = [], action) => {
    switch (action.type) {
      case ADD_READONLY_LOCK_CALLED:
        return [...state, action.called];
      case REMOVE_READONLY_LOCK_CALLED:
        return state.filter(x => x !== action.called);
      default:
        return state;
    }
  },
  permissions: (state = {}, action) => {
    switch (action.type) {
      case ADD_PERMISSION:
        return { ...state, [action.permissionKey]: action.value };
      case REMOVE_PERMISSION:
        const stateCopy = { ...state };
        delete stateCopy[action.permissionKey];
        return stateCopy;
      default:
        return state;
    }
  },
  readonlyLocks: (state = {}, action) => {
    switch (action.type) {
      case ADD_READONLY_LOCK:
        return { ...state, [action.resourceId]: action.lock };
      case REMOVE_READONLY_LOCK:
        const stateCopy = { ...state };
        delete stateCopy[action.resourceId];
        return stateCopy;
      default:
        return state;
    }
  },
});
