import { ArmArray, Site } from '../../../models/WebAppModels';
import { MakeArmCall } from '../../ApiHelpers';
import * as Types from '../../types';

const slotApiService = {
  fetchSlots: async (state: Types.RootState): Promise<ArmArray<Site>> => {
    let productionResourceId = state.site.resourceId;
    if (productionResourceId.includes('/slots/')) {
      productionResourceId = productionResourceId.split('/slots/')[0];
    }
    return await MakeArmCall<ArmArray<Site>>(state, `${productionResourceId}/slots`);
  },
};

export default slotApiService;
