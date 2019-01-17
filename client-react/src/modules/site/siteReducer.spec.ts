jest.mock('../ArmHelper');
import { ActionsObservable } from 'redux-observable';
import { toArray } from 'rxjs/operators';

import rootReducer from '../';
import { IStartupInfo } from '../../models/portal-models';
import { ArmObj, Site } from '../../models/WebAppModels';
import { getStartupInfoAction } from '../portal/actions';
import { RootState, Services } from '../types';
import {
  fetchSiteFailure,
  fetchSiteRequest,
  fetchSiteSuccess,
  updateResourceId,
  updateSiteFailure,
  updateSiteRequest,
  updateSiteSuccess,
} from './actions';
import { SITE_FETCH_FAILURE, SITE_FETCH_SUCCESS, SITE_UPDATE_FAILURE, SITE_UPDATE_SUCCESS } from './actionTypes';
import { fetchSiteFlow, updateSiteFlow } from './epics';
import reducer from './reducer';
import siteApi from './siteApiService';
import MakeArmCall from '../ArmHelper';
const testResult = { name: 'fromApi' } as ArmObj<Site>;
describe('Site Store Epics', () => {
  const successDeps = {
    siteApi: {
      fetchSite: async (state: RootState): Promise<ArmObj<Site>> => {
        return testResult;
      },
      updateSite: async (state: RootState, site: ArmObj<Site>): Promise<ArmObj<Site>> => {
        return testResult;
      },
    },
  } as Services;

  const failDeps = {
    siteApi: {
      fetchSite: async (state: RootState): Promise<ArmObj<Site>> => {
        throw new Error('failuremessage');
      },
      updateSite: async (state: RootState, site: ArmObj<Site>): Promise<ArmObj<Site>> => {
        throw new Error('failuremessage');
      },
    },
  } as Services;
  it('Sends Success Action with site object on Successful Fetch', async () => {
    let action$ = ActionsObservable.of(fetchSiteRequest());
    const output$ = fetchSiteFlow(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    let action = actions[0];
    if (action.type === SITE_FETCH_SUCCESS) {
      expect(action.site.name).toBe('fromApi');
    }
  });

  it('Sends Success Action with site object on Successful Update', async () => {
    let action$ = ActionsObservable.of(updateSiteRequest(testResult));
    const output$ = updateSiteFlow(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(4);
    let siteUpdateAction = actions[0];
    if (siteUpdateAction.type === SITE_UPDATE_SUCCESS) {
      expect(siteUpdateAction.site.name).toBe('fromApi');
    }
  });

  it('Sends Error Action with error on failed Fetch', async () => {
    let action$ = ActionsObservable.of(fetchSiteRequest());
    const output$ = fetchSiteFlow(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();

    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(SITE_FETCH_FAILURE);
    if (action.type === SITE_FETCH_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });

  it('Sends Error Action with error on failed Update', async () => {
    let action$ = ActionsObservable.of(updateSiteRequest(testResult));
    const output$ = updateSiteFlow(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();

    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(SITE_UPDATE_FAILURE);
    if (action.type === SITE_UPDATE_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });
});

describe('Site Store Reducer', () => {
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

  describe('Site Fetch Stories', () => {
    it('should trigger loading the fetch is requested', () => {
      const action = fetchSiteRequest();
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(true);
    });

    it('update resourceId action should reflect in state', () => {
      const action = updateResourceId('newresourceid');
      const state = reducer(initialState, action);
      expect(state.resourceId).toBe('newresourceid');
    });

    it('metadata and site should update on successful load', () => {
      const action = fetchSiteSuccess({ name: 'testsite' } as any);
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.data.name).toBe('testsite');
    });

    it('error should be reflected on failed load', () => {
      const action = fetchSiteFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.metadata.fetchError).toBe(true);
      expect(state.metadata.fetchErrorObject.message).toBe('testerror');
    });
  });

  describe('Site Fetch Stories', () => {
    it('should trigger updating the fetch is requested', () => {
      const action = updateSiteRequest(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(true);
    });

    it('metadata and site should update on successful update', () => {
      const action = updateSiteSuccess({ name: 'testsite' } as any);
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(false);
      expect(state.data.name).toBe('testsite');
    });

    it('error should be reflected on failed load', () => {
      const action = updateSiteFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.updating).toBe(false);
      expect(state.metadata.updateError).toBe(true);
      expect(state.metadata.updateErrorObject.message).toBe('testerror');
    });
  });

  describe('Site Service', () => {
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
      siteApi.fetchSite(state);
      expect(MakeArmCall).toHaveBeenCalledWith({ resourceId: 'resourceid', commandName: 'fetchSite' });
    });

    it('update Api calls api with appropriate info', async () => {
      siteApi.updateSite(state, testResult);
      expect(MakeArmCall).toHaveBeenCalledWith({ resourceId: 'resourceid', commandName: 'updateSite', method: 'PUT', body: testResult });
    });
  });
});
