import mockAxios from 'jest-mock-axios';
import { ActionsObservable } from 'redux-observable';
import { toArray } from 'rxjs/operators';

import rootReducer from '../../';
import { BillingMeter } from '../../../models/BillingModels';
import { IStartupInfo } from '../../../models/portal-models';
import { ArmArray } from '../../../models/WebAppModels';
import { getStartupInfoAction } from '../../portal/actions';
import { updateResourceId } from '../../site/actions';
import { RootState, Services } from '../../types';
import { StacksOS } from '../available-stacks/actions';
import { fetchBillingMetersFailure, fetchBillingMetersRequest, fetchBillingMetersSuccess } from './actions';
import { BILLING_METERS_FETCH_FAILURE, BILLING_METERS_FETCH_SUCCESS } from './actionTypes';
import api from './billingMetersApiService';
import { fetchBillingMeters } from './epics';
import reducer from './reducer';

const testResult: ArmArray<BillingMeter> = {
  value: [
    {
      id: 'test',
      name: 'test',
      properties: {
        meterId: 'testmeterid',
        billingLocation: 'testlocation',
        shortName: 'testshortname',
        friendlyName: 'testfriendlyname',
        resourceType: 'testresourcetype',
      },
    },
  ],
};
describe('Billing Meters Store Epics', () => {
  const successDeps = {
    billingMetersApi: {
      fetchBillingMeters: async (
        state: RootState,
        subscriptionId: string,
        osType?: StacksOS,
        location?: string
      ): Promise<ArmArray<BillingMeter>> => {
        testResult.id = `${osType}/${subscriptionId}/${location}`;
        return testResult;
      },
    },
  } as Services;

  const failDeps = {
    billingMetersApi: {
      fetchBillingMeters: async (
        state: RootState,
        subscriptionId: string,
        osType?: StacksOS,
        location?: string
      ): Promise<ArmArray<BillingMeter>> => {
        throw new Error('failuremessage');
      },
    },
  } as Services;

  it('Sends Success Action with object on Successful Fetch with all options', async () => {
    let action$ = ActionsObservable.of(fetchBillingMetersRequest({ osType: 'Windows', subscriptionId: 'sub', location: 'testloc' }));
    const output$ = fetchBillingMeters(action$, {} as any, successDeps);
    const actions = await output$.pipe(toArray()).toPromise();

    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(BILLING_METERS_FETCH_SUCCESS);
    if (action.type === BILLING_METERS_FETCH_SUCCESS) {
      expect(action.meters.id).toBe('Windows/sub/testloc');
    }
  });

  it('Sends Error Action with error on failed Fetch', async () => {
    let action$ = ActionsObservable.of(fetchBillingMetersRequest({ subscriptionId: 'sub' }));
    const output$ = fetchBillingMeters(action$, {} as any, failDeps);
    const actions = await output$.pipe(toArray()).toPromise();
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(BILLING_METERS_FETCH_FAILURE);
    if (action.type === BILLING_METERS_FETCH_FAILURE) {
      expect(action.error.message).toBe('failuremessage');
    }
  });
});

describe('Billing Meters Store Reducer', () => {
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

  describe('Billing Meters Fetch Stories', () => {
    it('should trigger loading when the fetch is requested', () => {
      const action = fetchBillingMetersRequest({ subscriptionId: 'sub' });
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(true);
    });

    it('metadata and billing meters should update on successful load', () => {
      const action = fetchBillingMetersSuccess(testResult);
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.data.value.length).toBe(1);
    });

    it('error should be reflected on failed load', () => {
      const action = fetchBillingMetersFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.metadata.fetchError).toBe(true);
      expect(state.metadata.fetchErrorObject.message).toBe('testerror');
    });
  });
});

describe('Billing Meters Service', () => {
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

  it('Fetch Api calls api with appropriate info with only subscription id', async () => {
    const fetcher = api.fetchBillingMeters(state, 'subid');
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'GET',
      url: 'testEndpoint/subscriptions/subid/providers/Microsoft.Web/billingMeters?api-version=2018-02-01',
      data: null,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });
    mockAxios.mockResponse({ data: testResult });
    const result = await fetcher;
    expect(result.value.length).toBe(1);
  });

  it('Fetch Api calls api with appropriate info with only subscription id and location', async () => {
    const fetcher = api.fetchBillingMeters(state, 'subid', undefined, 'testloc');
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'GET',
      url: 'testEndpoint/subscriptions/subid/providers/Microsoft.Web/billingMeters?billingLocation=testloc&api-version=2018-02-01',
      data: null,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });
    mockAxios.mockResponse({ data: testResult });
    const result = await fetcher;
    expect(result.value.length).toBe(1);
  });

  it('Fetch Api calls api with appropriate info with only subscription id and osType', async () => {
    const fetcher = api.fetchBillingMeters(state, 'subid', 'Windows');
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'GET',
      url: 'testEndpoint/subscriptions/subid/providers/Microsoft.Web/billingMeters?osType=Windows&api-version=2018-02-01',
      data: null,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });
    mockAxios.mockResponse({ data: testResult });
    const result = await fetcher;
    expect(result.value.length).toBe(1);
  });

  it('Fetch Api calls api with appropriate info with all options', async () => {
    const fetcher = api.fetchBillingMeters(state, 'subid', 'Windows', 'testloc');
    expect(mockAxios).toHaveBeenCalledWith({
      method: 'GET',
      url:
        'testEndpoint/subscriptions/subid/providers/Microsoft.Web/billingMeters?billingLocation=testloc&osType=Windows&api-version=2018-02-01',
      data: null,
      headers: {
        Authorization: `Bearer testtoken`,
      },
    });
    mockAxios.mockResponse({ data: testResult });
    const result = await fetcher;
    expect(result.value.length).toBe(1);
  });

  it('Fetch Api should throw on error', async () => {
    const catchFn = jest.fn();
    const thenFn = jest.fn();
    const updateResourceIdAction = updateResourceId('resourceid');
    const updateSUIAction = getStartupInfoAction({
      token: 'testtoken',
      armEndpoint: 'testEndpoint',
    } as IStartupInfo);

    const state = rootReducer(rootReducer(initialState, updateResourceIdAction), updateSUIAction);
    const fetcher = api
      .fetchBillingMeters(state, 'subid')
      .then(thenFn)
      .catch(catchFn);
    mockAxios.mockError(new Error('errorMessage'));
    await fetcher;
    expect(thenFn).not.toHaveBeenCalled();
    expect(catchFn).toHaveBeenCalled();
  });
});
