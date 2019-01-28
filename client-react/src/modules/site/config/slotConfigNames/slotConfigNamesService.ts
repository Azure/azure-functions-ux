import { ArmObj, SlotConfigNames } from '../../../../models/WebAppModels';
import MakeArmCall from '../../../ArmHelper';
import { RootState } from '../../../types';

const slotConfigNamesApiService = {
  fetchSlotConfig: async (state: RootState): Promise<ArmObj<SlotConfigNames>> => {
    let productionResourceId = state.site.resourceId;
    if (productionResourceId.includes('/slots/')) {
      productionResourceId = productionResourceId.split('/slots/')[0];
    }
    const resourceId = `${productionResourceId}/config/slotconfignames`;
    return await MakeArmCall({ resourceId, commandName: 'fetchSlotConfig' });
  },
  updateSlotConfig: async (state: RootState, newConfigName: ArmObj<SlotConfigNames>): Promise<ArmObj<SlotConfigNames>> => {
    let productionResourceId = state.site.resourceId;
    if (productionResourceId.includes('/slots/')) {
      productionResourceId = productionResourceId.split('/slots/')[0];
    }
    const resourceId = `${productionResourceId}/config/slotconfignames`;
    return await MakeArmCall({ resourceId, commandName: 'updateSlotConfig', method: 'PUT', body: newConfigName });
  },
};

export default slotConfigNamesApiService;
