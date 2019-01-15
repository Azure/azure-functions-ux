import { ActionsObservable } from 'redux-observable';
import { toArray } from 'rxjs/operators';

import rootReducer from '../../..';
import { IStartupInfo } from '../../../../models/portal-models';
import { ArmObj, SiteConfig } from '../../../../models/WebAppModels';
import { getStartupInfoAction } from '../../../portal/actions';
import { RootState, Services } from '../../../types';
import { updateResourceId } from '../../actions';
import {
  fetchWebConfigFailure,
  fetchWebConfigRequest,
  fetchWebConfigSuccess,
  updateWebConfigFailure,
  updateWebConfigRequest,
  updateWebConfigSuccess,
} from './actions';
import { WEB_CONFIG_FETCH_FAILURE, WEB_CONFIG_FETCH_SUCCESS, WEB_CONFIG_UPDATE_FAILURE, WEB_CONFIG_UPDATE_SUCCESS } from './actionTypes';
import { fetchWebConfig, updateWebConfig } from './epics';
import reducer from './reducer';
import api from './webConfigApiService';
jest.mock('../../../ArmHelper');
import MakeArmCall from '../../../ArmHelper';

const testResult: ArmObj<SiteConfig> = {
  id: '',
  name: '',
  location: '',
  kind: '',
  properties: {
    scmType: 'testvalue',
  },
} as ArmObj<SiteConfig>;
describe('Web Config Names Store Epics', () => {
  const successDeps = {
    webConfigApi: {
      fetchWebConfig: async (state: RootState): Promise<ArmObj<SiteConfig>> => {
        return testResult;
      },
      updateWebConfig: async (state: RootState, newConfig: ArmObj<SiteConfig>): Promise<ArmObj<SiteConfig>> => {
        return testResult;
      },
    },
  } as Services;

  const failDeps = {
    webConfigApi: {
      fetchWebConfig: async (state: RootState): Promise<ArmObj<SiteConfig>> => {
        throw new Error('failuremessage');
      },
      updateWebConfig: async (state: RootState, newConfig: ArmObj<SiteConfig>): Promise<ArmObj<SiteConfig>> => {
        throw new Error('failuremessage');
      },
    },
  } as Services;

  it('Sends Success Action with object on Successful Fetch', async () => {
    let action$ = ActionsObservable.of(fetchWebConfigRequest());
    const output$ = fetchWebConfig(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(WEB_CONFIG_FETCH_SUCCESS);
    if (action.type === WEB_CONFIG_FETCH_SUCCESS) {
      expect(action.webConfig.properties.scmType).toBe('testvalue');
    }
  });

  it('Sends Success Action with object on Successful Update', async () => {
    let action$ = ActionsObservable.of(updateWebConfigRequest(testResult));
    const output$ = updateWebConfig(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(WEB_CONFIG_UPDATE_SUCCESS);
    if (action.type === WEB_CONFIG_UPDATE_SUCCESS) {
      expect(action.webConfig.properties.scmType).toBe('testvalue');
    }
  });

  it('Sends Error Action with error on failed Fetch', async () => {
    let action$ = ActionsObservable.of(fetchWebConfigRequest());
    const output$ = fetchWebConfig(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(WEB_CONFIG_FETCH_FAILURE);
    if (action.type === WEB_CONFIG_FETCH_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });

  it('Sends Error Action with error on failed Update', async () => {
    let action$ = ActionsObservable.of(updateWebConfigRequest(testResult));
    const output$ = updateWebConfig(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(WEB_CONFIG_UPDATE_FAILURE);
    if (action.type === WEB_CONFIG_UPDATE_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });
});

describe('Web Config Names Store Reducer', () => {
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

  describe('Web Config Names Fetch Stories', () => {
    it('should trigger loading when the fetch is requested', () => {
      const action = fetchWebConfigRequest();
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(true);
    });

    it('metadata and app settings should update on successful load', () => {
      const action = fetchWebConfigSuccess(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.data.properties.scmType).toBe('testvalue');
    });

    it('error should be reflected on failed load', () => {
      const action = fetchWebConfigFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.metadata.fetchError).toBe(true);
      expect(state.metadata.fetchErrorObject.message).toBe('testerror');
    });
  });

  describe('Web Config Names Update Stories', () => {
    it('should trigger updating when the update is requested', () => {
      const action = updateWebConfigRequest(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(true);
    });

    it('metadata and app settings should update on successful load', () => {
      const action = updateWebConfigSuccess(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(false);
      expect(state.data.properties.scmType).toBe('testvalue');
    });

    it('error should be reflected on failed load', () => {
      const action = updateWebConfigFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(false);
      expect(state.metadata.updateError).toBe(true);
      expect(state.metadata.updateErrorObject.message).toBe('testerror');
    });
  });
});

describe('Web Config Names Service', () => {
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

  it('Fetch Api calls api with appropriate info', async () => {
    api.fetchWebConfig(state);
    expect(MakeArmCall).toHaveBeenCalledWith('testEndpoint', 'testtoken', 'resourceid/config/web', 'FetchWebConfig');
  });

  it('Update Api calls api with appropriate info', async () => {
    api.updateWebConfig(state, testResult);
    expect(MakeArmCall).toHaveBeenCalledWith('testEndpoint', 'testtoken', 'resourceid/config/web', 'UpdateWebConfig', 'PUT', testResult);
  });
});
