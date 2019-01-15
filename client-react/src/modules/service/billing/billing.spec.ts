import { ActionsObservable } from 'redux-observable';
import { toArray } from 'rxjs/operators';

import rootReducer from '../../';
import { BillingMeter } from '../../../models/BillingModels';
import { IStartupInfo } from '../../../models/portal-models';
import { ArmArray } from '../../../models/WebAppModels';
import { getStartupInfoAction } from '../../portal/actions';
import { updateResourceId } from '../../site/actions';
import { Services } from '../../types';
import { StacksOS } from '../available-stacks/actions';
import { fetchBillingMetersFailure, fetchBillingMetersRequest, fetchBillingMetersSuccess } from './actions';
import { BILLING_METERS_FETCH_FAILURE, BILLING_METERS_FETCH_SUCCESS } from './actionTypes';
import api from './billingMetersApiService';
import { fetchBillingMeters } from './epics';
import reducer from './reducer';

jest.mock('../../ArmHelper');
import MakeArmCall from '../../ArmHelper';
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
      fetchBillingMeters: async (subscriptionId: string, osType?: StacksOS, location?: string): Promise<ArmArray<BillingMeter>> => {
        testResult.id = `${osType}/${subscriptionId}/${location}`;
        return testResult;
      },
    },
  } as Services;

  const failDeps = {
    billingMetersApi: {
      fetchBillingMeters: async (subscriptionId: string, osType?: StacksOS, location?: string): Promise<ArmArray<BillingMeter>> => {
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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Fetch Api calls api with appropriate info with only subscription id', async () => {
    api.fetchBillingMeters('subid');
    expect(MakeArmCall).toHaveBeenCalledWith({
      resourceId: '/subscriptions/subid/providers/Microsoft.Web/billingMeters',
      queryString: '',
      commandName: 'FetchBillingMeters',
    });
  });

  it('Fetch Api calls api with appropriate info with only subscription id and location', async () => {
    api.fetchBillingMeters('subid', undefined, 'testloc');
    expect(MakeArmCall).toHaveBeenCalledWith({
      resourceId: '/subscriptions/subid/providers/Microsoft.Web/billingMeters',
      queryString: '?billingLocation=testloc',
      commandName: 'FetchBillingMeters',
    });
  });

  it('Fetch Api calls api with appropriate info with only subscription id and osType', async () => {
    api.fetchBillingMeters('subid', 'Windows');
    expect(MakeArmCall).toHaveBeenCalledWith({
      resourceId: '/subscriptions/subid/providers/Microsoft.Web/billingMeters',
      queryString: '?osType=Windows',
      commandName: 'FetchBillingMeters',
    });
  });

  it('Fetch Api calls api with appropriate info with all options', async () => {
    api.fetchBillingMeters('subid', 'Windows', 'testloc');
    expect(MakeArmCall).toHaveBeenCalledWith({
      resourceId: '/subscriptions/subid/providers/Microsoft.Web/billingMeters',
      queryString: '?billingLocation=testloc&osType=Windows',
      commandName: 'FetchBillingMeters',
    });
  });
});
