import mockAxios from 'jest-mock-axios';
import { ActionsObservable } from 'redux-observable';
import { toArray } from 'rxjs/operators';

import rootReducer from '../../../';
import { IStartupInfo } from '../../../../models/portal-models';
import { ArmObj } from '../../../../models/WebAppModels';
import { getStartupInfoAction } from '../../../portal/actions';
import { RootState, Services } from '../../../types';
import { updateResourceId } from '../../actions';
import {
  fetchAppSettingsFailure,
  fetchAppSettingsRequest,
  fetchAppSettingsSuccess,
  updateAppSettingsFailure,
  updateAppSettingsRequest,
  updateAppSettingsSuccess,
  updateAppSettingsFromSiteUpdate,
} from './actions';
import {
  APP_SETTINGS_FETCH_FAILURE,
  APP_SETTINGS_FETCH_SUCCESS,
  APP_SETTINGS_UPDATE_FAILURE,
  APP_SETTINGS_UPDATE_SUCCESS,
} from './actionTypes';
import appSettingsApi from './appSettingsApiService';
import { fetchAppSettings, updateAppSettings } from './epics';
import reducer, { AppSettings } from './reducer';

const testAppSettingsObj = {
  id: '',
  name: 'testname',
  location: '',
  kind: '',
  properties: {
    testkey: 'testvalue',
  },
};
describe('App Settings Store Epics', () => {
  const successDeps = {
    appSettingsApi: {
      fetchAppSettings: async (state: RootState): Promise<ArmObj<AppSettings>> => {
        return testAppSettingsObj;
      },
      updateAppSettings: async (state: RootState, newAppSettings: ArmObj<AppSettings>): Promise<ArmObj<AppSettings>> => {
        return newAppSettings;
      },
    },
  } as Services;

  const failDeps = {
    appSettingsApi: {
      fetchAppSettings: async (state: RootState): Promise<ArmObj<AppSettings>> => {
        throw new Error('failuremessage');
      },
      updateAppSettings: async (state: RootState, newAppSettings: ArmObj<AppSettings>): Promise<ArmObj<AppSettings>> => {
        throw new Error('failuremessage');
      },
    },
  } as Services;
  it('Sends Success Action with app settings object on Successful Fetch', async () => {
    let action$ = ActionsObservable.of(fetchAppSettingsRequest());
    const output$ = fetchAppSettings(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(APP_SETTINGS_FETCH_SUCCESS);
    if (action.type === APP_SETTINGS_FETCH_SUCCESS) {
      expect(action.appSettings.properties.testkey).toBe('testvalue');
    }
  });

  it('Sends Success Action with app settings object on Successful update', async () => {
    let action$ = ActionsObservable.of(updateAppSettingsRequest(testAppSettingsObj));
    const output$ = updateAppSettings(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(APP_SETTINGS_UPDATE_SUCCESS);
    if (action.type === APP_SETTINGS_UPDATE_SUCCESS) {
      expect(action.appSettings.properties.testkey).toBe('testvalue');
    }
  });

  it('Sends Error Action with error on failed Fetch', async () => {
    let action$ = ActionsObservable.of(fetchAppSettingsRequest());
    const output$ = fetchAppSettings(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();

    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(APP_SETTINGS_FETCH_FAILURE);
    if (action.type === APP_SETTINGS_FETCH_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });

  it('Sends Error Action with error on failed Update', async () => {
    let action$ = ActionsObservable.of(updateAppSettingsRequest(testAppSettingsObj));
    const output$ = updateAppSettings(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();

    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(APP_SETTINGS_UPDATE_FAILURE);
    if (action.type === APP_SETTINGS_UPDATE_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });
});

describe('App Settings Store Reducer', () => {
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

  describe('App Settings Fetch Stories', () => {
    it('should trigger loading when the fetch is requested', () => {
      const action = fetchAppSettingsRequest();
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(true);
    });

    it('metadata and app settings should update on successful load', () => {
      const action = fetchAppSettingsSuccess(testAppSettingsObj);
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.data.properties.testkey).toBe('testvalue');
    });

    it('error should be reflected on failed load', () => {
      const action = fetchAppSettingsFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.metadata.fetchError).toBe(true);
      expect(state.metadata.fetchErrorObject.message).toBe('testerror');
    });
  });

  describe('App Settings Update Stories', () => {
    it('should trigger updating when the update is requested', () => {
      const action = updateAppSettingsRequest(testAppSettingsObj);
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(true);
    });

    it('metadata and app settings should update on successful update', () => {
      const action = updateAppSettingsSuccess(testAppSettingsObj);
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.data.properties.testkey).toBe('testvalue');
    });

    it('error should be reflected on failed update', () => {
      const action = updateAppSettingsFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.metadata.updateError).toBe(true);
      expect(state.metadata.updateErrorObject.message).toBe('testerror');
    });

    it("updateAppSettingsFromSiteUpdate action is null if site object doesn't contain app settings", () => {
      const action = updateAppSettingsFromSiteUpdate({ properties: { siteConfig: {} } } as any);
      expect(action.appSettings).toBeNull();
    });

    it('updateAppSettingsFromSiteUpdate action makes app settings array gets mapped correctly to app settings object', () => {
      const action = updateAppSettingsFromSiteUpdate({
        properties: { siteConfig: { appSettings: [{ name: 'test1', value: 'testvalue1' }, { name: 'test2', value: 'testvalue2' }] } },
      } as any);
      const appSettingsObject = {
        test1: 'testvalue1',
        test2: 'testvalue2',
      };
      expect(action.appSettings).toEqual(appSettingsObject);
    });

    it('updateAppSettingsFromSiteUpdate updates state in reducer', () => {
      const action = updateAppSettingsFromSiteUpdate({
        properties: { siteConfig: { appSettings: [{ name: 'test1', value: 'testvalue1' }, { name: 'test2', value: 'testvalue2' }] } },
      } as any);
      const state = reducer(initialState, action);
      const appSettingsObject = {
        test1: 'testvalue1',
        test2: 'testvalue2',
      };
      expect(state.data.properties).toEqual(appSettingsObject);
    });

    it("updateAppSettingsFromSiteUpdate doesn't update state in reducer if app settings value is null", () => {
      const action = updateAppSettingsFromSiteUpdate({
        properties: { siteConfig: { appSettings: [{ name: 'test1', value: 'testvalue1' }, { name: 'test2', value: 'testvalue2' }] } },
      } as any);
      const nullAction = updateAppSettingsFromSiteUpdate({ properties: { siteConfig: {} } } as any);
      const state = reducer(initialState, action);
      const state2 = reducer(state, nullAction);
      const appSettingsObject = {
        test1: 'testvalue1',
        test2: 'testvalue2',
      };
      expect(state2.data.properties).toEqual(appSettingsObject);
    });
  });
});

describe('App Settings Service', () => {
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
    const fetcher = appSettingsApi.fetchAppSettings(state);
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'POST',
      url: 'testEndpointresourceid/config/appsettings/list?api-version=2018-02-01',
      data: null,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });
    mockAxios.mockResponse({ data: testAppSettingsObj });
    const result = await fetcher;
    expect(result.properties.testkey).toBe('testvalue');
  });

  it('Update Api calls api with appropriate info', async () => {
    const fetcher = appSettingsApi.updateAppSettings(state, testAppSettingsObj);
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'testEndpointresourceid/config/appsettings?api-version=2018-02-01',
      data: testAppSettingsObj,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });
    mockAxios.mockResponse({ data: testAppSettingsObj });
    const result = await fetcher;
    expect(result.properties.testkey).toBe('testvalue');
  });

  it('Fetch Api should throw on error', async () => {
    const fetcher = appSettingsApi
      .fetchAppSettings(state)
      .then(thenFn)
      .catch(catchFn);
    mockAxios.mockError(new Error('errorMessage'));
    await fetcher;
    expect(thenFn).not.toHaveBeenCalled();
    expect(catchFn).toHaveBeenCalled();
  });

  it('Update Api should throw on error', async () => {
    const fetcher = appSettingsApi
      .updateAppSettings(state, testAppSettingsObj)
      .then(thenFn)
      .catch(catchFn);
    mockAxios.mockError(new Error('errorMessage'));
    await fetcher;
    expect(thenFn).not.toHaveBeenCalled();
    expect(catchFn).toHaveBeenCalled();
  });
});
