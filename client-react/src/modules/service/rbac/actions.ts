import { createStandardAction } from 'typesafe-actions';

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

export const addPermission = createStandardAction(ADD_PERMISSION).map((payload: { permissionKey: string; value: boolean }) => ({
  ...payload,
}));

export const removePermission = createStandardAction(REMOVE_PERMISSION).map((permissionKey: string) => ({
  permissionKey,
}));

export const addReadonlyLock = createStandardAction(ADD_READONLY_LOCK).map((payload: { resourceId: string; lock: boolean }) => ({
  ...payload,
}));

export const removeReadonlyLock = createStandardAction(REMOVE_READONLY_LOCK).map((resourceId: string) => ({
  resourceId,
}));

export const addReadonlyCalled = createStandardAction(ADD_READONLY_LOCK_CALLED).map((called: string) => ({
  called,
}));

export const removeReadonlyCalled = createStandardAction(REMOVE_READONLY_LOCK_CALLED).map((called: string) => ({
  called,
}));

export const addPermissionCalled = createStandardAction(ADD_PERMISSION_CALLED).map((called: string) => ({
  called,
}));

export const removePermissionsCalled = createStandardAction(REMOVE_PERMISSIONS_CALLED).map((called: string) => ({
  called,
}));
