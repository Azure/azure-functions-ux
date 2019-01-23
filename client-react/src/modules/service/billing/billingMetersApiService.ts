import { BillingMeter } from '../../../models/BillingModels';
import { ArmArray } from '../../../models/WebAppModels';
import Url from '../../../utils/url';
import { MakeArmCall } from '../../ApiHelpers';
import * as Types from '../../types';
import { StacksOS } from '../available-stacks/actions';

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
    return await MakeArmCall(state, resourceId);
  },
};

export default billingMetersApiService;
