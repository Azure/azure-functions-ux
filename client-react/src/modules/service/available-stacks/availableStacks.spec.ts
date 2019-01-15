import { ActionsObservable } from 'redux-observable';
import { toArray } from 'rxjs/operators';

import rootReducer from '../../';
import { AvailableStack } from '../../../models/available-stacks';
import { IStartupInfo } from '../../../models/portal-models';
import { ArmArray } from '../../../models/WebAppModels';
import { getStartupInfoAction } from '../../portal/actions';
import { updateResourceId } from '../../site/actions';
import { RootState, Services } from '../../types';
import { fetchStacksFailure, fetchStacksRequest, fetchStacksSuccess, StacksOS } from './actions';
import { STACKS_FETCH_FAILURE, STACKS_FETCH_SUCCESS } from './actionTypes';
import api from './availableStacksApiService';
import { fetchStacksFlow } from './epics';
import reducer from './reducer';
jest.mock('../../ArmHelper');
import MakeArmCall from '../../ArmHelper';

const testResult: ArmArray<AvailableStack> = {
  value: [
    {
      id: '',
      name: 'aspnet',
      type: 'Microsoft.Web/availableStacks?osTypeSelected=Windows',
      properties: {
        name: 'aspnet',
        display: 'Net Framework Version',
        dependency: '',
        majorVersions: [
          {
            displayVersion: 'v4.7',
            runtimeVersion: 'v4.0',
            isDefault: true,
            minorVersions: [],
          },
          {
            displayVersion: 'v3.5',
            runtimeVersion: 'v2.0',
            isDefault: false,
            minorVersions: [],
          },
        ],
        frameworks: [],
      },
    },
  ],
};
describe('Available Stacks Store Epics', () => {
  const successDeps = {
    stacksApi: {
      fetchAvailableStacks: async (state: RootState, stacksOs: StacksOS): Promise<ArmArray<AvailableStack>> => {
        testResult.id = stacksOs;
        return testResult;
      },
    },
  } as Services;

  const failDeps = {
    stacksApi: {
      fetchAvailableStacks: async (state: RootState, stacksOs: StacksOS): Promise<ArmArray<AvailableStack>> => {
        throw new Error('failuremessage');
      },
    },
  } as Services;

  it('Sends Success Action with object on Successful Fetch of Windows', async () => {
    let action$ = ActionsObservable.of(fetchStacksRequest('Windows'));
    const output$ = fetchStacksFlow(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(STACKS_FETCH_SUCCESS);
    if (action.type === STACKS_FETCH_SUCCESS) {
      expect(action.stacks.id).toBe('Windows');
    }
  });

  it('Sends Success Action with object on Successful Fetch of Linux', async () => {
    let action$ = ActionsObservable.of(fetchStacksRequest('Linux'));
    const output$ = fetchStacksFlow(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(STACKS_FETCH_SUCCESS);
    if (action.type === STACKS_FETCH_SUCCESS) {
      expect(action.stacks.id).toBe('Linux');
    }
  });

  it('Sends Error Action with error on failed Fetch', async () => {
    let action$ = ActionsObservable.of(fetchStacksRequest('Windows'));
    const output$ = fetchStacksFlow(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(STACKS_FETCH_FAILURE);
    if (action.type === STACKS_FETCH_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });
});

describe('Available Stacks Store Reducer', () => {
  const initialState = reducer(undefined, {} as any);
  describe('initial state', () => {
    it('should match a snapshot', () => {
      expect(initialState).toMatchSnapshot();
    });

    it('loading and updating should be false', () => {
      expect(initialState.metadata.loading).toBe(false);
      expect(initialState.metadata.updating).toBe(false);
    });
  });

  describe('Available Stacks Fetch Stories', () => {
    it('should trigger loading when the fetch is requested', () => {
      const action = fetchStacksRequest('Windows');
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(true);
    });

    it('metadata and available stacks should update on successful load', () => {
      const action = fetchStacksSuccess(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.data.value.length).toBe(1);
    });

    it('error should be reflected on failed load', () => {
      const action = fetchStacksFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.metadata.fetchError).toBe(true);
      expect(state.metadata.fetchErrorObject.message).toBe('testerror');
    });
  });
});

describe('Available Stacks Service', () => {
  const initialState = rootReducer(undefined, {} as any);
  let state;
  beforeEach(() => {
    const updateResourceIdAction = updateResourceId('resourceid');
    const updateSUIAction = getStartupInfoAction({
      token: 'testtoken',
      armEndpoint: 'testEndpoint',
    } as IStartupInfo);

    state = rootReducer(rootReducer(initialState, updateResourceIdAction), updateSUIAction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Fetch Api calls api with appropriate info with Windows', async () => {
    api.fetchAvailableStacks(state, 'Windows');
    expect(MakeArmCall).toHaveBeenCalledWith(
      'testEndpoint',
      'testtoken',
      '/providers/Microsoft.Web/availableStacks?osTypeSelected=Windows',
      'FetchAvailableStacks'
    );
  });

  it('Fetch Api calls api with appropriate info with Linux', async () => {
    api.fetchAvailableStacks(state, 'Linux');
    expect(MakeArmCall).toHaveBeenCalledWith(
      'testEndpoint',
      'testtoken',
      '/providers/Microsoft.Web/availableStacks?osTypeSelected=Linux',
      'FetchAvailableStacks'
    );
  });
});
