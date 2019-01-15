import { BillingMeter } from '../../../models/BillingModels';
import { ArmArray } from '../../../models/WebAppModels';
import Url from '../../../utils/url';
import MakeArmCall from '../../ArmHelper';
import { StacksOS } from '../available-stacks/actions';
const billingMetersApiService = {
  fetchBillingMeters: async (subscriptionId: string, osType?: StacksOS, location?: string): Promise<ArmArray<BillingMeter>> => {
    let queryString = '';
    let resourceId = `/subscriptions/${subscriptionId}/providers/Microsoft.Web/billingMeters`;
    if (location) {
      queryString = Url.appendQueryString(queryString, `billingLocation=${location.replace(/\s/g, '')}`);
    }

    if (osType) {
      queryString = Url.appendQueryString(queryString, `osType=${osType}`);
    }
    return await MakeArmCall({ resourceId, queryString, commandName: 'fetchBillingMeters' });
  },
};

export default billingMetersApiService;
