import { ArmObj, SlotConfigNames } from '../../../../models/WebAppModels';
import { MakeArmCall } from '../../../ApiHelpers';
import { RootState } from '../../../types';

const slotConfigNamesApiService = {
  fetchSlotConfig: async (state: RootState): Promise<ArmObj<SlotConfigNames>> => {
    let productionResourceId = state.site.resourceId;
    if (productionResourceId.includes('/slots/')) {
      productionResourceId = productionResourceId.split('/slots/')[0];
    }
    const resourceId = `${productionResourceId}/config/slotconfignames`;
    return await MakeArmCall(state, resourceId);
  },
  updateSlotConfig: async (state: RootState, newConfigName: ArmObj<SlotConfigNames>): Promise<ArmObj<SlotConfigNames>> => {
    let productionResourceId = state.site.resourceId;
    if (productionResourceId.includes('/slots/')) {
      productionResourceId = productionResourceId.split('/slots/')[0];
    }
    const resourceId = `${productionResourceId}/config/slotconfignames`;
    return await MakeArmCall(state, resourceId, 'PUT', newConfigName);
  },
};

export default slotConfigNamesApiService;
