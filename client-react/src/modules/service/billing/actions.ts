import { createStandardAction } from 'typesafe-actions';

import { BillingMeter } from '../../../models/BillingModels';
import { ArmArray } from '../../../models/WebAppModels';
import { StacksOS } from '../available-stacks/actions';
import { BILLING_METERS_FETCH_FAILURE, BILLING_METERS_FETCH_REQUEST, BILLING_METERS_FETCH_SUCCESS } from './actionTypes';

export const fetchBillingMetersRequest = createStandardAction(BILLING_METERS_FETCH_REQUEST).map(
  (payload: { subscriptionId: string; location?: string; osType?: StacksOS }) => ({
    subscriptionId: payload.subscriptionId,
    location: payload.location,
    osType: payload.osType,
  })
);
export const fetchBillingMetersSuccess = createStandardAction(BILLING_METERS_FETCH_SUCCESS).map((meters: ArmArray<BillingMeter>) => ({
  meters,
}));
export const fetchBillingMetersFailure = createStandardAction(BILLING_METERS_FETCH_FAILURE).map((error: Error) => ({
  error,
}));
