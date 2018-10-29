import { IAction } from '../../../models/action';

export const ADD_PERMISSION = 'ADD_PERMISSION';
export const addPermission = (permissionKey: string, value: boolean): IAction<{ key: string; value: boolean }> => ({
  payload: { value, key: permissionKey },
  type: ADD_PERMISSION,
});

export const REMOVE_PERMISSION = 'REMOVE_PERMISSION';
export const removePermission = (permissionKey: string): IAction<string> => ({
  payload: permissionKey,
  type: REMOVE_PERMISSION,
});

export const ADD_READONLY_LOCK = 'ADD_READONLY_LOCK';
export const addReadonlyLock = (resourceId: string, lock: boolean): IAction<{ key: string; value: boolean }> => ({
  payload: { key: resourceId, value: lock },
  type: ADD_READONLY_LOCK,
});

export const REMOVE_READONLY_LOCK = 'REMOVE_READONLY_LOCK';
export const removeReadonlyLock = (resourceId: string): IAction<string> => ({
  payload: resourceId,
  type: ADD_READONLY_LOCK,
});

export const ADD_READONLY_LOCK_CALLED = 'ADD_READONLY_LOCK_CALLED';
export const addReadonlyCalled = (called: string): IAction<string> => ({
  payload: called,
  type: ADD_READONLY_LOCK_CALLED,
});

export const REMOVE_READONLY_LOCK_CALLED = 'REMOVE_READONLY_LOCK_CALLED';
export const removeReadonlyCalled = (called: string): IAction<string> => ({
  payload: called,
  type: REMOVE_READONLY_LOCK_CALLED,
});

export const ADD_PERMISSION_CALLED = 'ADD_PERMISSION_CALLED';
export const addPermissionCalled = (called: string): IAction<string> => ({
  payload: called,
  type: ADD_PERMISSION_CALLED,
});

export const REMOVE_PERMISSIONS_CALLED = 'REMOVE_PERMISSIONS_CALLED';
export const removePermissionsCalled = (called: string): IAction<string> => ({
  payload: called,
  type: REMOVE_PERMISSIONS_CALLED,
});
