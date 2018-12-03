import { updateBillingMeters, updateBillingMetersLoading } from './actions';
import { checkCacheValid } from 'redux-cache';
import axios from 'axios';
import { ArmArray } from '../../../models/WebAppModels';
import { BillingMeter } from '../../../models/BillingModels';

export type OSType = 'Windows' | 'Linux';
export function fetchBillingMeters(subscriptionId: string, osType: OSType, location?: string) {
  return async (dispatch: any, getState: any) => {
    const startupInfo = getState().portalService.startupInfo;
    const armToken = startupInfo.token;
    const armEndpoint = startupInfo.armEndpoint;
    const currentBillingMetersCall = getState().billingMeters;
    const isCacheValid = checkCacheValid(getState, 'billingMeters');
    if (isCacheValid || currentBillingMetersCall.loading) {
      return;
    }

    dispatch(updateBillingMetersLoading(true));

    try {
      let url = `${armEndpoint}/subscriptions/${subscriptionId}/providers/Microsoft.Web/billingMeters?api-version=2015-08-01`;
      if (location) {
        url += `&billingLocation=${location.replace(/\s/g, '')}`;
      }

      if (osType) {
        url += `&osType=${osType}`;
      }
      const billingMetersFetch = await axios.get<ArmArray<BillingMeter>>(url, {
        headers: {
          Authorization: `Bearer ${armToken}`,
        },
      });
      const billingMetersResult = billingMetersFetch.data;
      dispatch(updateBillingMeters(billingMetersResult));
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(updateBillingMetersLoading(false));
    }
  };
}
