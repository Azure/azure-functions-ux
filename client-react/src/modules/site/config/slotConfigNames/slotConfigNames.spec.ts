import mockAxios from 'jest-mock-axios';
import { ActionsObservable } from 'redux-observable';
import { toArray } from 'rxjs/operators';

import rootReducer from '../../..';
import { IStartupInfo } from '../../../../models/portal-models';
import { ArmObj, SlotConfigNames } from '../../../../models/WebAppModels';
import { getStartupInfoAction } from '../../../portal/actions';
import { RootState, Services } from '../../../types';
import { updateResourceId } from '../../actions';
import {
  fetchSlotConfigFailure,
  fetchSlotConfigRequest,
  fetchSlotConfigSuccess,
  updateSlotConfigFailure,
  updateSlotConfigRequest,
  updateSlotConfigSuccess,
} from './actions';
import {
  SLOT_CONFIG_FETCH_FAILURE,
  SLOT_CONFIG_FETCH_SUCCESS,
  SLOT_CONFIG_UPDATE_FAILURE,
  SLOT_CONFIG_UPDATE_SUCCESS,
} from './actionTypes';
import { fetchSlotConfigName, updateSlotConfigName } from './epics';
import reducer from './reducer';
import api from './slotConfigNamesService';

const testResult: ArmObj<SlotConfigNames> = {
  id: '',
  name: '',
  location: '',
  kind: '',
  properties: {
    connectionStringNames: ['testvalue'],
    appSettingNames: ['testvalue'],
    azureStorageConfigNames: ['testvalue'],
  },
};
describe('Slot Config Names Store Epics', () => {
  const successDeps = {
    slotConfigNamesApi: {
      fetchSlotConfig: async (state: RootState): Promise<ArmObj<SlotConfigNames>> => {
        return testResult;
      },
      updateSlotConfig: async (state: RootState, newConfigName: ArmObj<SlotConfigNames>): Promise<ArmObj<SlotConfigNames>> => {
        return testResult;
      },
    },
  } as Services;

  const failDeps = {
    slotConfigNamesApi: {
      fetchSlotConfig: async (state: RootState): Promise<ArmObj<SlotConfigNames>> => {
        throw new Error('failuremessage');
      },
      updateSlotConfig: async (state: RootState, newConfigName: ArmObj<SlotConfigNames>): Promise<ArmObj<SlotConfigNames>> => {
        throw new Error('failuremessage');
      },
    },
  } as Services;
  it('Sends Success Action with object on Successful Fetch', async () => {
    let action$ = ActionsObservable.of(fetchSlotConfigRequest());
    const output$ = fetchSlotConfigName(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(SLOT_CONFIG_FETCH_SUCCESS);
    if (action.type === SLOT_CONFIG_FETCH_SUCCESS) {
      expect(action.slotConfig.properties.appSettingNames[0]).toBe('testvalue');
    }
  });

  it('Sends Success Action with object on Successful Update', async () => {
    let action$ = ActionsObservable.of(updateSlotConfigRequest(testResult));
    const output$ = updateSlotConfigName(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(SLOT_CONFIG_UPDATE_SUCCESS);
    if (action.type === SLOT_CONFIG_UPDATE_SUCCESS) {
      expect(action.slotConfig.properties.appSettingNames[0]).toBe('testvalue');
    }
  });

  it('Sends Error Action with error on failed Fetch', async () => {
    let action$ = ActionsObservable.of(fetchSlotConfigRequest());
    const output$ = fetchSlotConfigName(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(SLOT_CONFIG_FETCH_FAILURE);
    if (action.type === SLOT_CONFIG_FETCH_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });

  it('Sends Error Action with error on failed Update', async () => {
    let action$ = ActionsObservable.of(updateSlotConfigRequest(testResult));
    const output$ = updateSlotConfigName(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(SLOT_CONFIG_UPDATE_FAILURE);
    if (action.type === SLOT_CONFIG_UPDATE_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });
});

describe('Slot Config Names Store Reducer', () => {
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

  describe('Slot Config Names Fetch Stories', () => {
    it('should trigger loading when the fetch is requested', () => {
      const action = fetchSlotConfigRequest();
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(true);
    });

    it('metadata and app settings should update on successful load', () => {
      const action = fetchSlotConfigSuccess(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.data.properties.appSettingNames[0]).toBe('testvalue');
    });

    it('error should be reflected on failed load', () => {
      const action = fetchSlotConfigFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.metadata.fetchError).toBe(true);
      expect(state.metadata.fetchErrorObject.message).toBe('testerror');
    });
  });

  describe('Slot Config Names UPDATE Stories', () => {
    it('should trigger loading when the update is requested', () => {
      const action = updateSlotConfigRequest(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(true);
    });

    it('Slot config names should update on successful load', () => {
      const action = updateSlotConfigSuccess(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(false);
      expect(state.data.properties.appSettingNames[0]).toBe('testvalue');
    });

    it('error should be reflected on failed load', () => {
      const action = updateSlotConfigFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(false);
      expect(state.metadata.updateError).toBe(true);
      expect(state.metadata.updateErrorObject.message).toBe('testerror');
    });
  });
});

describe('Slot Config Names Service', () => {
  const initialState = rootReducer(undefined, {} as any);
  const catchFn = jest.fn();
  const thenFn = jest.fn();
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
    mockAxios.reset();
    thenFn.mockClear();
    catchFn.mockClear();
  });

  it('Fetch Api calls api with appropriate info from a production app', async () => {
    const fetcher = api.fetchSlotConfig(state);
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'GET',
      url: 'testEndpointresourceid/config/slotconfignames?api-version=2018-02-01',
      data: null,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });
    mockAxios.mockResponse({ data: testResult });
    const result = await fetcher;
    expect(result.properties.appSettingNames[0]).toBe('testvalue');
  });

  it('Fetch Api calls api with appropriate info from a slot app', async () => {
    const updateResourceIdAction = updateResourceId('resourceid/slots/slot');
    state = rootReducer(state, updateResourceIdAction);
    const fetcher = api.fetchSlotConfig(state);
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'GET',
      url: 'testEndpointresourceid/config/slotconfignames?api-version=2018-02-01',
      data: null,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });

    mockAxios.mockResponse({ data: testResult });
    const result = await fetcher;
    expect(result.properties.appSettingNames[0]).toBe('testvalue');
  });

  it('Update Api calls api with appropriate info from a production app', async () => {
    const fetcher = api.updateSlotConfig(state, testResult);
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'testEndpointresourceid/config/slotconfignames?api-version=2018-02-01',
      data: testResult,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });
    mockAxios.mockResponse({ data: testResult });
    const result = await fetcher;
    expect(result.properties.appSettingNames[0]).toBe('testvalue');
  });

  it('Update Api calls api with appropriate info from a slot app', async () => {
    const updateResourceIdAction = updateResourceId('resourceid/slots/slot');
    state = rootReducer(state, updateResourceIdAction);
    const fetcher = api.updateSlotConfig(state, testResult);
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'testEndpointresourceid/config/slotconfignames?api-version=2018-02-01',
      data: testResult,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });
    mockAxios.mockResponse({ data: testResult });
    const result = await fetcher;
    expect(result.properties.appSettingNames[0]).toBe('testvalue');
  });

  it('Fetch Api should throw on error', async () => {
    const fetcher = api
      .fetchSlotConfig(state)
      .then(thenFn)
      .catch(catchFn);
    mockAxios.mockError(new Error('errorMessage'));
    await fetcher;
    expect(thenFn).not.toHaveBeenCalled();
    expect(catchFn).toHaveBeenCalled();
  });

  it('Update Api should throw on error', async () => {
    const fetcher = api
      .updateSlotConfig(state, testResult)
      .then(thenFn)
      .catch(catchFn);
    mockAxios.mockError(new Error('errorMessage'));
    await fetcher;
    expect(thenFn).not.toHaveBeenCalled();
    expect(catchFn).toHaveBeenCalled();
  });
});
