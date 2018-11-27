import { ArmArray } from '../../../models/WebAppModels';
import { IAction } from '../../../models/action';
import { UPDATE_BILLING_METERS_LOADING, UPDATE_BILLING_METERS } from './actions';
import { DEFAULT_KEY, generateCacheTTL } from 'redux-cache';
import { BillingMeter } from '../../../models/BillingModels';

export interface IBillingMetersState {
  loading: boolean;
  billingMeters: ArmArray<BillingMeter>;
}
export const InitialState: IBillingMetersState = {
  [DEFAULT_KEY]: null,
  loading: false,
  billingMeters: {
    value: [],
  },
};

const billingMeters = (state = InitialState, action: IAction<any>) => {
  switch (action.type) {
    case UPDATE_BILLING_METERS_LOADING:
      return { ...state, loading: action.payload };
    case UPDATE_BILLING_METERS:
      return {
        ...state,
        [DEFAULT_KEY]: generateCacheTTL(60000),
        billingMeters: action.payload,
      };
    default:
      return state;
  }
};

export default billingMeters;
