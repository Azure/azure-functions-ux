import {
  addPermission,
  addPermissionCalled,
  addReadonlyCalled,
  addReadonlyLock,
  removePermission,
  removePermissionsCalled,
  removeReadonlyCalled,
  removeReadonlyLock,
} from './actions';
import reducer from './reducer';
import { fetchPermissions, fetchReadonlyLocks } from './thunks';
import { Services } from '../../types';

const mockServices = (returnVal: boolean): Services =>
  ({
    rbacHelper: {
      hasPermission: async (resourceId: string, requestedActions: string[]): Promise<boolean> => {
        return returnVal;
      },
      hasReadOnlyLock: async (resourceId: string): Promise<boolean> => {
        return returnVal;
      },
    },
  } as Services);

describe('RBAC Store Reducer', () => {
  let initialState = reducer(undefined, {} as any);
  describe('initial state', () => {
    it('should match a snapshot', () => {
      expect(initialState).toMatchSnapshot();
    });

    it('loading should be false', () => {
      expect(initialState.permissionCalled.length).toBe(0);
      expect(initialState.readonlyLockCalled.length).toBe(0);
    });
  });

  describe('Rbac Fetch Stories', () => {
    it('Add new permission action', () => {
      const action = addPermission({ permissionKey: 'key', value: true });
      const state = reducer(initialState, action);
      expect(state.permissions['key']).toBe(true);
    });

    it('Remove permission state permission action', () => {
      let initialState = reducer(undefined, addPermission({ permissionKey: 'key', value: true }));
      expect(initialState.permissions['key']).toBeDefined();
      const action = removePermission('key');
      const state = reducer(initialState, action);
      expect(state.permissions['key']).toBeUndefined();
    });

    it('Add new permission called action', () => {
      const action = addPermissionCalled('key');
      const state = reducer(initialState, action);
      expect(state.permissionCalled).toContain('key');
    });

    it('Remove permission called action', () => {
      let initialState = reducer(undefined, addPermissionCalled('key'));
      expect(initialState.permissionCalled).toContain('key');
      const action = removePermissionsCalled('key');
      const state = reducer(initialState, action);
      expect(state.permissionCalled).not.toContain('key');
    });

    it('Add new readonly lock action', () => {
      const action = addReadonlyLock({ resourceId: 'resourceid', lock: true });
      const state = reducer(initialState, action);
      expect(state.readonlyLocks['resourceid']).toBe(true);
    });

    it('Remove read only lock action', () => {
      let initialState = reducer(undefined, addReadonlyLock({ resourceId: 'resourceid', lock: true }));
      expect(initialState.readonlyLocks['resourceid']).toBeDefined();
      const action = removeReadonlyLock('resourceid');
      const state = reducer(initialState, action);
      expect(state.readonlyLocks['resourceid']).toBeUndefined();
    });

    it('Add new readonly lock called action', () => {
      const action = addReadonlyCalled('resourceid');
      const state = reducer(initialState, action);
      expect(state.readonlyLockCalled).toContain('resourceid');
    });

    it('Remove read only lock called action', () => {
      let initialState = reducer(undefined, addReadonlyCalled('resourceid'));
      expect(initialState.readonlyLockCalled).toContain('resourceid');
      const action = removeReadonlyCalled('resourceid');
      const state = reducer(initialState, action);
      expect(state.permissionCalled).not.toContain('resourceid');
    });
  });
});

describe('RBAC Store thunks', () => {
  const dispatch = jest.fn();
  const getState = (calledId?: string) => () =>
    ({
      rbac: {
        permissionCalled: [calledId],
        readonlyLockCalled: [calledId],
      },
    } as any);
  afterEach(() => {
    dispatch.mockClear();
  });

  it('fetches permission', async () => {
    await fetchPermissions([
      {
        resourceId: 'resourceid',
        action: 'action',
      },
    ])(dispatch, getState(), mockServices(true));
    expect(dispatch.mock.calls).toEqual([
      [addPermissionCalled('resourceid|action')],
      [addPermission({ permissionKey: 'resourceid|action', value: true })],
      [removePermissionsCalled('resourceid|action')],
    ]);
  });

  it('does not fetch permissions again if a fetch is already in progress', async () => {
    await fetchPermissions([
      {
        resourceId: 'resourceid',
        action: 'action',
      },
    ])(dispatch, getState('resourceid|action'), mockServices(true));
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('fetches readonly lock', async () => {
    await fetchReadonlyLocks([
      {
        resourceId: 'resourceid',
      },
    ])(dispatch, getState(), mockServices(true));
    expect(dispatch.mock.calls).toEqual([
      [addReadonlyCalled('resourceid')],
      [addReadonlyLock({ resourceId: 'resourceid', lock: true })],
      [removeReadonlyCalled('resourceid')],
    ]);
  });

  it('does not fetch readonly lock again if a fetch is already in progress', async () => {
    await fetchReadonlyLocks([
      {
        resourceId: 'resourceid',
      },
    ])(dispatch, getState('resourceid'), mockServices(true));
    expect(dispatch).not.toHaveBeenCalled();
  });
});
