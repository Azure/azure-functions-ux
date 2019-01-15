import { RootState, Services } from '../../../modules/types';
import {
  addPermission,
  addPermissionCalled,
  addReadonlyCalled,
  addReadonlyLock,
  removePermissionsCalled,
  removeReadonlyCalled,
} from './actions';

export interface PermissionCheckObj {
  resourceId: string;
  action: string;
}

export interface ReadonlyCheckObj {
  resourceId: string;
}

export function fetchPermissions(resources: PermissionCheckObj[]) {
  return async (dispatch: any, getState: () => RootState, { rbacHelper }: Services) => {
    await resources.map(async resource => {
      const resourceKey = `${resource.resourceId}|${resource.action}`;
      if (getState().rbac.permissionCalled.indexOf(resourceKey) === -1) {
        dispatch(addPermissionCalled(resourceKey));
        const permissionCheck = await rbacHelper.hasPermission(getState(), resource.resourceId, [resource.action!]);
        dispatch(addPermission({ permissionKey: resourceKey, value: permissionCheck }));
        dispatch(removePermissionsCalled(resourceKey));
      }
    });
  };
}

export function fetchReadonlyLocks(resources: ReadonlyCheckObj[]) {
  return async (dispatch: any, getState: () => RootState, { rbacHelper }: Services) => {
    await resources.map(async resource => {
      if (getState().rbac.readonlyLockCalled.indexOf(resource.resourceId) === -1) {
        dispatch(addReadonlyCalled(resource.resourceId));
        const permissionCheck = await rbacHelper.hasReadOnlyLock(resource.resourceId);
        dispatch(addReadonlyLock({ resourceId: resource.resourceId, lock: permissionCheck }));
        dispatch(removeReadonlyCalled(resource.resourceId));
      }
    });
  };
}
