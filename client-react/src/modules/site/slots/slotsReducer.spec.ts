import { ActionsObservable } from 'redux-observable';
import { toArray } from 'rxjs/operators';

import rootReducer from '../../';
import { IStartupInfo } from '../../../models/portal-models';
import { ArmArray, ArmObj, Site } from '../../../models/WebAppModels';
import { getStartupInfoAction } from '../../portal/actions';
import { RootState, Services } from '../../types';
import { updateResourceId } from '../actions';
import { fetchSlotsFailure, fetchSlotsRequest, fetchSlotsSuccess } from './actions';
import { SLOTS_FETCH_FAILURE, SLOTS_FETCH_SUCCESS } from './actionTypes';
import { fetchSlotsFlow } from './epics';
import reducer from './reducer';
import slotApiService from './slotsApiService';
jest.mock('../../ArmHelper');
import MakeArmCall from '../../ArmHelper';

describe('Slots Store Epics', () => {
  const successDeps = {
    slotsApi: {
      fetchSlots: async (state: RootState): Promise<ArmArray<Site>> => {
        return { value: [{ name: 'testSlot' } as ArmObj<Site>] };
      },
    },
  } as Services;

  const failDeps = {
    slotsApi: {
      fetchSlots: async (state: RootState): Promise<ArmArray<Site>> => {
        throw new Error('failuremessage');
      },
    },
  } as Services;
  it('Sends Success Action with slots object on Successful Fetch', function(done) {
    let action$ = ActionsObservable.of(fetchSlotsRequest());
    const output$ = fetchSlotsFlow(action$, {} as any, successDeps);
    output$.pipe(toArray()).subscribe(actions => {
      expect(actions.length).toBe(1);
      const action = actions[0];
      expect(action.type).toBe(SLOTS_FETCH_SUCCESS);
      if (action.type === SLOTS_FETCH_SUCCESS) {
        expect(action.slotList.value[0].name).toBe('testSlot');
      }

      done();
    });
  });

  it('Sends Error Action with error on failed Fetch', function(done) {
    let action$ = ActionsObservable.of(fetchSlotsRequest());
    const output$ = fetchSlotsFlow(action$, {} as any, failDeps);
    output$.pipe(toArray()).subscribe(actions => {
      expect(actions.length).toBe(1);
      const action = actions[0];
      expect(action.type).toBe(SLOTS_FETCH_FAILURE);
      if (action.type === SLOTS_FETCH_FAILURE) {
        expect(action.error.message).toBe('failuremessage');
      }
      done();
    });
  });
});

describe('Slots Store Reducer', () => {
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
      const action = fetchSlotsRequest();
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(true);
    });

    it('metadata and site should update on successful load', () => {
      const action = fetchSlotsSuccess({ value: [{ name: 'testsite' }] } as any);
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.data.value[0].name).toBe('testsite');
    });

    it('error should be reflected on failed load', () => {
      const action = fetchSlotsFailure(new Error('testerror'));
      const state = reducer(initialState, action);
      expect(state.metadata.loading).toBe(false);
      expect(state.metadata.fetchError).toBe(true);
      expect(state.metadata.fetchErrorObject.message).toBe('testerror');
    });
  });
});

describe('Slots Service', () => {
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
    slotApiService.fetchSlots(state);
    expect(MakeArmCall).toHaveBeenCalledWith({ resourceId: 'resourceid/slots', commandName: 'FetchSlots' });
  });

  it('Fetch Api calls api with appropriate info from slots app', async () => {
    const updateResourceIdAction = updateResourceId('resourceid/slots/slot');
    state = rootReducer(state, updateResourceIdAction);
    slotApiService.fetchSlots(state);
    expect(MakeArmCall).toHaveBeenCalledWith({ resourceId: 'resourceid/slots', commandName: 'FetchSlots' });
  });
});
