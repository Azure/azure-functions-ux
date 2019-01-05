import mockAxios from 'jest-mock-axios';
import { ActionsObservable } from 'redux-observable';
import { toArray } from 'rxjs/operators';

import rootReducer from '../../..';
import { IStartupInfo } from '../../../../models/portal-models';
import { ArmObj } from '../../../../models/WebAppModels';
import { getStartupInfoAction } from '../../../portal/actions';
import { RootState, Services } from '../../../types';
import { updateResourceId } from '../../actions';
import {
  fetchMetadataFailure,
  fetchMetadataRequest,
  fetchMetadataSuccess,
  updateMetadataFailure,
  updateMetadataRequest,
  updateMetadataSuccess,
  updateMetadataFromSiteUpdate,
} from './actions';
import { METADATA_FETCH_FAILURE, METADATA_FETCH_SUCCESS, METADATA_UPDATE_FAILURE, METADATA_UPDATE_SUCCESS } from './actionTypes';
import { fetchMetadata, updateMetadata } from './epics';
import api from './metadataApiService';
import reducer, { Metadata } from './reducer';

const testResult = {
  id: '',
  name: '',
  location: '',
  kind: '',
  properties: {
    testkey: 'testvalue',
  },
};
describe('Metadata Store Epics', () => {
  const successDeps = {
    metadataApi: {
      fetchMetadata: async (state: RootState): Promise<ArmObj<Metadata>> => {
        return testResult;
      },
      updateMetadata: async (state: RootState, nmd: ArmObj<Metadata>): Promise<ArmObj<Metadata>> => {
        return testResult;
      },
    },
  } as Services;

  const failDeps = {
    metadataApi: {
      fetchMetadata: async (state: RootState): Promise<ArmObj<Metadata>> => {
        throw new Error('failuremessage');
      },
      updateMetadata: async (state: RootState, nmd: ArmObj<Metadata>): Promise<ArmObj<Metadata>> => {
        throw new Error('failuremessage');
      },
    },
  } as Services;
  it('Sends Success Action with object on Successful Fetch', async () => {
    let action$ = ActionsObservable.of(fetchMetadataRequest());
    const output$ = fetchMetadata(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(METADATA_FETCH_SUCCESS);
    if (action.type === METADATA_FETCH_SUCCESS) {
      expect(action.metadata.properties.testkey).toBe('testvalue');
    }
  });

  it('Sends Success Action with object on Successful Update', async () => {
    let action$ = ActionsObservable.of(updateMetadataRequest(testResult));
    const output$ = updateMetadata(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(METADATA_UPDATE_SUCCESS);
    if (action.type === METADATA_UPDATE_SUCCESS) {
      expect(action.metadata.properties.testkey).toBe('testvalue');
    }
  });

  it('Sends Error Action with error on failed Fetch', async () => {
    let action$ = ActionsObservable.of(fetchMetadataRequest());
    const output$ = fetchMetadata(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(METADATA_FETCH_FAILURE);
    if (action.type === METADATA_FETCH_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });

  it('Sends Error Action with error on failed Update', async () => {
    let action$ = ActionsObservable.of(updateMetadataRequest(testResult));
    const output$ = updateMetadata(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(METADATA_UPDATE_FAILURE);
    if (action.type === METADATA_UPDATE_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });
});

describe('Metadata Store Reducer', () => {
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

  describe('Metadata Fetch Stories', () => {
    it('should trigger loading when the fetch is requested', () => {
      const action = fetchMetadataRequest();
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(true);
    });

    it('metadata and app settings should update on successful load', () => {
      const action = fetchMetadataSuccess(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.data.properties.testkey).toBe('testvalue');
    });

    it('error should be reflected on failed load', () => {
      const action = fetchMetadataFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.metadata.fetchError).toBe(true);
      expect(state.metadata.fetchErrorObject.message).toBe('testerror');
    });
  });

  describe('Metadata Update Stories', () => {
    it('should trigger loading when the update is requested', () => {
      const action = updateMetadataRequest(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(true);
    });

    it('metadata and app settings should update on successful load', () => {
      const action = updateMetadataSuccess(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(false);
      expect(state.data.properties.testkey).toBe('testvalue');
    });

    it('error should be reflected on failed update', () => {
      const action = updateMetadataFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.metadata.updateError).toBe(true);
      expect(state.metadata.updateErrorObject.message).toBe('testerror');
    });

    it("updateMetadataFromSiteUpdate action is null if site object doesn't contain app settings", () => {
      const action = updateMetadataFromSiteUpdate({ properties: { siteConfig: {} } } as any);
      expect(action.metadata).toBeNull();
    });

    it('updateMetadataFromSiteUpdate action makes app settings array gets mapped correctly to app settings object', () => {
      const action = updateMetadataFromSiteUpdate({
        properties: { siteConfig: { metadata: [{ name: 'test1', value: 'testvalue1' }, { name: 'test2', value: 'testvalue2' }] } },
      } as any);
      const metadataObject = {
        test1: 'testvalue1',
        test2: 'testvalue2',
      };
      expect(action.metadata).toEqual(metadataObject);
    });

    it('updateMetadataFromSiteUpdate updates state in reducer', () => {
      const action = updateMetadataFromSiteUpdate({
        properties: { siteConfig: { metadata: [{ name: 'test1', value: 'testvalue1' }, { name: 'test2', value: 'testvalue2' }] } },
      } as any);
      const state = reducer(initialState, action);
      const metadataObject = {
        test1: 'testvalue1',
        test2: 'testvalue2',
      };
      expect(state.data.properties).toEqual(metadataObject);
    });

    it("updateMetadataFromSiteUpdate doesn't update state in reducer if app settings value is null", () => {
      const action = updateMetadataFromSiteUpdate({
        properties: { siteConfig: { metadata: [{ name: 'test1', value: 'testvalue1' }, { name: 'test2', value: 'testvalue2' }] } },
      } as any);
      const nullAction = updateMetadataFromSiteUpdate({ properties: { siteConfig: {} } } as any);
      const state = reducer(initialState, action);
      const state2 = reducer(state, nullAction);
      const metadataObject = {
        test1: 'testvalue1',
        test2: 'testvalue2',
      };
      expect(state2.data.properties).toEqual(metadataObject);
    });
  });
});

describe('Metadata Service', () => {
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

  it('Fetch Api calls api with appropriate info', async () => {
    const fetcher = api.fetchMetadata(state);
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'POST',
      url: 'testEndpointresourceid/config/metadata/list?api-version=2018-02-01',
      data: null,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });
    mockAxios.mockResponse({ data: testResult });
    const result = await fetcher;
    expect(result.properties.testkey).toBe('testvalue');
  });

  it('Update Api calls api with appropriate info', async () => {
    const fetcher = api.updateMetadata(state, testResult);
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'testEndpointresourceid/config/metadata?api-version=2018-02-01',
      data: testResult,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });
    mockAxios.mockResponse({ data: testResult });
    const result = await fetcher;
    expect(result.properties.testkey).toBe('testvalue');
  });

  it('Fetch Api should throw on error', async () => {
    const fetcher = api
      .fetchMetadata(state)
      .then(thenFn)
      .catch(catchFn);
    mockAxios.mockError(new Error('errorMessage'));
    await fetcher;
    expect(thenFn).not.toHaveBeenCalled();
    expect(catchFn).toHaveBeenCalled();
  });

  it('Update Api should throw on error', async () => {
    const fetcher = api
      .updateMetadata(state, testResult)
      .then(thenFn)
      .catch(catchFn);
    mockAxios.mockError(new Error('errorMessage'));
    await fetcher;
    expect(thenFn).not.toHaveBeenCalled();
    expect(catchFn).toHaveBeenCalled();
  });
});
