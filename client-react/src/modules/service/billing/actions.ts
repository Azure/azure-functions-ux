import { IAction } from '../../../models/action';
import { ArmArray } from '../../../models/WebAppModels';
import { BillingMeter } from '../../../models/BillingModels';

export const UPDATE_BILLING_METERS = 'UPDATE_BILLING_METERS';
export const updateBillingMeters = (billingMeters: ArmArray<BillingMeter>): IAction<ArmArray<BillingMeter>> => ({
  payload: billingMeters,
  type: UPDATE_BILLING_METERS,
});

export const UPDATE_BILLING_METERS_LOADING = 'UPDATE_BILLING_METERS_LOADING';
export const updateBillingMetersLoading = (loading: boolean): IAction<boolean> => ({
  payload: loading,
  type: UPDATE_BILLING_METERS_LOADING,
});
