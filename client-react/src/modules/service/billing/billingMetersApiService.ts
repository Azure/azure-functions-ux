import { BillingMeter } from '../../../models/BillingModels';
import { ArmArray } from '../../../models/WebAppModels';
import Url from '../../../utils/url';
import MakeArmCall from '../../ArmHelper';
import * as Types from '../../types';
import { StacksOS } from '../available-stacks/actions';
import { getArmEndpointAndTokenFromState } from '../../StateUtilities';

const billingMetersApiService = {
  fetchBillingMeters: async (
    state: Types.RootState,
    subscriptionId: string,
    osType?: StacksOS,
    location?: string
  ): Promise<ArmArray<BillingMeter>> => {
    let resourceId = `/subscriptions/${subscriptionId}/providers/Microsoft.Web/billingMeters`;
    if (location) {
      resourceId = Url.appendQueryString(resourceId, `billingLocation=${location.replace(/\s/g, '')}`);
    }

    if (osType) {
      resourceId = Url.appendQueryString(resourceId, `osType=${osType}`);
    }
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return await MakeArmCall(armEndpoint, authToken, resourceId, 'FetchBillingMeters');
  },
};

export default billingMetersApiService;
