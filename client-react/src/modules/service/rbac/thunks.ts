import {
  addPermission,
  addReadonlyLock,
  addPermissionCalled,
  removePermissionsCalled,
  addReadonlyCalled,
  removeReadonlyCalled,
} from './actions';
import IState from '../../../modules/types';
import { RbacHelper } from '../../../utils/rbac-helper';

export interface PermissionCheckObj {
  resourceId: string;
  action: string;
}
export function fetchPermissions(resources: PermissionCheckObj[]) {
  return async (dispatch: any, getState: () => IState) => {
    await resources.map(async resource => {
      const resourceKey = `${resource.resourceId}|${resource.action}`;
      if (getState().rbac.permissionCalled.indexOf(resourceKey) === -1) {
        dispatch(addPermissionCalled(resourceKey));
        const permissionCheck = await RbacHelper.hasPermission(resource.resourceId, [resource.action]);
        dispatch(addPermission(resourceKey, permissionCheck));
        dispatch(removePermissionsCalled(resourceKey));
      }
    });
  };
}

export function fetchReadonlyLocks(resources: PermissionCheckObj[]) {
  return async (dispatch: any, getState: () => IState) => {
    await resources.map(async resource => {
      if (getState().rbac.readonlyLockCalled.indexOf(resource.resourceId) === -1) {
        dispatch(addReadonlyCalled(resource.resourceId));
        const permissionCheck = await RbacHelper.hasReadOnlyLock(resource.resourceId);
        dispatch(addReadonlyLock(resource.resourceId, permissionCheck));
        dispatch(removeReadonlyCalled(resource.resourceId));
      }
    });
  };
}
