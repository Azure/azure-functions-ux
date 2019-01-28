import { ArmArray, Site } from '../../../models/WebAppModels';
import MakeArmCall from '../../ArmHelper';
import { RootState } from '../../types';

const slotApiService = {
  fetchSlots: async (state: RootState): Promise<ArmArray<Site>> => {
    let productionResourceId = state.site.resourceId;
    if (productionResourceId.includes('/slots/')) {
      productionResourceId = productionResourceId.split('/slots/')[0];
    }
    const resourceId = `${productionResourceId}/slots`;
    return await MakeArmCall<ArmArray<Site>>({ resourceId, commandName: 'fetchSlots' });
  },
};

export default slotApiService;
