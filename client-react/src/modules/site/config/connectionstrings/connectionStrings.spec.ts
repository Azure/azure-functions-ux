import { ActionsObservable } from 'redux-observable';
import { toArray } from 'rxjs/operators';

import rootReducer from '../../..';
import { IStartupInfo } from '../../../../models/portal-models';
import { ArmObj, ConnStringInfo } from '../../../../models/WebAppModels';
import { getStartupInfoAction } from '../../../portal/actions';
import { RootState, Services } from '../../../types';
import { updateResourceId } from '../../actions';
import {
  fetchConnectionStringsFailure,
  fetchConnectionStringsRequest,
  fetchConnectionStringsSuccess,
  updateConnectionStringsFailure,
  updateConnectionStringsRequest,
  updateConnectionStringsSuccess,
  updateConnectionStringsFromSiteUpdate,
} from './actions';
import {
  CONNECTION_STRINGS_FETCH_FAILURE,
  CONNECTION_STRINGS_FETCH_SUCCESS,
  CONNECTION_STRINGS_UPDATE_FAILURE,
  CONNECTION_STRINGS_UPDATE_SUCCESS,
} from './actionTypes';
import api from './connectionStringsApiService';
import { fetchConnectionStrings, updateConnectionStrings } from './epics';
import reducer, { ConnectionString } from './reducer';
jest.mock('../../../ArmHelper');
import MakeArmCall from '../../../ArmHelper';

const testResult = {
  id: '',
  name: '',
  location: '',
  kind: '',
  properties: {
    testkey: { value: 'testvalue', type: 0 },
  },
};
describe('Connection Strings Store Epics', () => {
  const successDeps = {
    connectionStringsApi: {
      fetchConnectionStrings: async (state: RootState): Promise<ArmObj<ConnectionString>> => {
        return testResult;
      },
      updateConnectionStrings: async (state: RootState, _: ArmObj<ConnectionString>): Promise<ArmObj<ConnectionString>> => {
        return testResult;
      },
    },
  } as Services;

  const failDeps = {
    connectionStringsApi: {
      fetchConnectionStrings: async (state: RootState): Promise<ArmObj<ConnectionString>> => {
        throw new Error('failuremessage');
      },
      updateConnectionStrings: async (state: RootState, _: ArmObj<ConnectionString>): Promise<ArmObj<ConnectionString>> => {
        throw new Error('failuremessage');
      },
    },
  } as Services;
  it('Sends Success Action with object on Successful Fetch', async () => {
    let action$ = ActionsObservable.of(fetchConnectionStringsRequest());
    const output$ = fetchConnectionStrings(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();

    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(CONNECTION_STRINGS_FETCH_SUCCESS);
    if (action.type === CONNECTION_STRINGS_FETCH_SUCCESS) {
      expect(action.connectionStrings.properties.testkey.value).toBe('testvalue');
    }
  });

  it('Sends Success Action with object on Successful Update', async () => {
    let action$ = ActionsObservable.of(updateConnectionStringsRequest(testResult));
    const output$ = updateConnectionStrings(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();

    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(CONNECTION_STRINGS_UPDATE_SUCCESS);
    if (action.type === CONNECTION_STRINGS_UPDATE_SUCCESS) {
      expect(action.connectionStrings.properties.testkey.value).toBe('testvalue');
    }
  });

  it('Sends Error Action with error on failed Fetch', async () => {
    let action$ = ActionsObservable.of(fetchConnectionStringsRequest());
    const output$ = fetchConnectionStrings(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();

    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(CONNECTION_STRINGS_FETCH_FAILURE);
    if (action.type === CONNECTION_STRINGS_FETCH_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });

  it('Sends Error Action with error on failed Update', async () => {
    let action$ = ActionsObservable.of(updateConnectionStringsRequest(testResult));
    const output$ = updateConnectionStrings(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();

    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(CONNECTION_STRINGS_UPDATE_FAILURE);
    if (action.type === CONNECTION_STRINGS_UPDATE_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });
});

describe('Connection Strings Store Reducer', () => {
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

  describe('Connection Strings Fetch Stories', () => {
    it('should trigger loading when the fetch is requested', () => {
      const action = fetchConnectionStringsRequest();
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(true);
    });

    it('metadata and object should update on successful load', () => {
      const action = fetchConnectionStringsSuccess(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.data.properties.testkey.value).toBe('testvalue');
    });

    it('error should be reflected on failed load', () => {
      const action = fetchConnectionStringsFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.metadata.fetchError).toBe(true);
      expect(state.metadata.fetchErrorObject.message).toBe('testerror');
    });
  });

  describe('Connection Strings Update Stories', () => {
    it('should trigger updating when the fetch is requested', () => {
      const action = updateConnectionStringsRequest(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(true);
    });

    it('metadata and object should update on successful load', () => {
      const action = updateConnectionStringsSuccess(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(false);
      expect(state.data.properties.testkey.value).toBe('testvalue');
    });

    it('error should be reflected on failed update', () => {
      const action = updateConnectionStringsFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(false);
      expect(state.metadata.updateError).toBe(true);
      expect(state.metadata.updateErrorObject.message).toBe('testerror');
    });

    it("updateConnectionStringsFromSiteUpdate action is null if site object doesn't contain app settings", () => {
      const action = updateConnectionStringsFromSiteUpdate({ properties: { siteConfig: {} } } as any);
      expect(action.connectionStrings).toBeNull();
    });

    it('updateConnectionStringsFromSiteUpdate action makes app settings array gets mapped correctly to app settings object', () => {
      const action = updateConnectionStringsFromSiteUpdate({
        properties: {
          siteConfig: {
            connectionStrings: [
              { name: 'test1', connectionString: 'testvalue1', type: 1 },
              { name: 'test2', connectionString: 'testvalue2', type: 1 },
            ],
          },
        },
      } as any);
      const connectionStringsObject: ConnectionString = {
        test1: { value: 'testvalue1', type: 1 },
        test2: { value: 'testvalue2', type: 1 },
      };
      expect(action.connectionStrings).toEqual(connectionStringsObject);
    });

    it('updateConnectionStringsFromSiteUpdate updates state in reducer', () => {
      const action = updateConnectionStringsFromSiteUpdate({
        properties: {
          siteConfig: {
            connectionStrings: [
              { name: 'test1', connectionString: 'testvalue1', type: 1 },
              { name: 'test2', connectionString: 'testvalue2', type: 1 },
            ] as ConnStringInfo[],
          },
        },
      } as any);
      const state = reducer(initialState, action);
      const connectionStringsObject: ConnectionString = {
        test1: { value: 'testvalue1', type: 1 },
        test2: { value: 'testvalue2', type: 1 },
      };
      expect(state.data.properties).toEqual(connectionStringsObject);
    });

    it("updateAppSettingsFromSiteUpdate doesn't update state in reducer if app settings value is null", () => {
      const action = updateConnectionStringsFromSiteUpdate({
        properties: {
          siteConfig: {
            connectionStrings: [
              { name: 'test1', connectionString: 'testvalue1', type: 1 },
              { name: 'test2', connectionString: 'testvalue2', type: 1 },
            ],
          },
        },
      } as any);
      const nullAction = updateConnectionStringsFromSiteUpdate({ properties: { siteConfig: {} } } as any);
      const state = reducer(initialState, action);
      const state2 = reducer(state, nullAction);
      const connectionStringsObject: ConnectionString = {
        test1: { value: 'testvalue1', type: 1 },
        test2: { value: 'testvalue2', type: 1 },
      };
      expect(state2.data.properties).toEqual(connectionStringsObject);
    });
  });
});

describe('Connection Strings Service', () => {
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

  it('fetch Api calls api with appropriate info', async () => {
    api.fetchConnectionStrings(state);
    expect(MakeArmCall).toHaveBeenCalledWith({
      resourceId: 'resourceid/config/connectionstrings/list',
      commandName: 'fetchConnectionStrings',
      method: 'POST',
    });
  });

  it('update Api calls api with appropriate info', async () => {
    api.updateConnectionStrings(state, testResult);
    expect(MakeArmCall).toHaveBeenCalledWith({
      resourceId: 'resourceid/config/connectionstrings',
      commandName: 'updateConnectionStrings',
      method: 'PUT',
      body: testResult,
    });
  });
});
