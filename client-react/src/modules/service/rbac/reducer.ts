import { IAction } from '../../../models/action';
import {
  ADD_PERMISSION,
  ADD_READONLY_LOCK,
  REMOVE_PERMISSION,
  REMOVE_READONLY_LOCK,
  ADD_PERMISSION_CALLED,
  REMOVE_PERMISSIONS_CALLED,
  ADD_READONLY_LOCK_CALLED,
  REMOVE_READONLY_LOCK_CALLED,
} from './actions';

export interface IRbacState {
  permissionCalled: string[];
  readonlyLockCalled: string[];
  permissions: { [key: string]: boolean };
  readonlyLocks: { [key: string]: boolean };
}
export const RbacState: IRbacState = {
  permissionCalled: [],
  readonlyLockCalled: [],
  permissions: {},
  readonlyLocks: {},
};

const rbac = (state = RbacState, action: IAction<any>) => {
  switch (action.type) {
    case ADD_PERMISSION:
      const permissionsAdd = { ...state.permissions };
      permissionsAdd[action.payload.key] = action.payload.value;
      return { ...state, permissions: permissionsAdd };
    case REMOVE_PERMISSION:
      const permissionsRemove = { ...state.permissions };
      if (!!permissionsRemove[action.payload]) {
        delete permissionsRemove[action.payload];
      }
      return { ...state, permissions: permissionsRemove };
    case ADD_READONLY_LOCK:
      const readonlyLocksAdd = { ...state.readonlyLocks };
      readonlyLocksAdd[action.payload.key] = action.payload.value;
      return { ...state, readonlyLocks: readonlyLocksAdd };
    case REMOVE_READONLY_LOCK:
      const readonlyLocksRemove = { ...state.readonlyLocks };
      if (!!readonlyLocksRemove[action.payload]) {
        delete readonlyLocksRemove[action.payload];
      }
      return { ...state, readonlyLocks: readonlyLocksRemove };
    case ADD_PERMISSION_CALLED:
      return { ...state, permissionCalled: [...state.permissionCalled, action.payload] };
    case REMOVE_PERMISSIONS_CALLED:
      return { ...state, permissionCalled: state.permissionCalled.filter(x => x !== action.payload) };
    case ADD_READONLY_LOCK_CALLED:
      return { ...state, readonlyLockCalled: [...state.readonlyLockCalled, action.payload] };
    case REMOVE_READONLY_LOCK_CALLED:
      return { ...state, readonlyLockCalled: state.readonlyLockCalled.filter(x => x !== action.payload) };

    default:
      return state;
  }
};

export default rbac;
