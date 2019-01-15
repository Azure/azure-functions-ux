import { ArmArray, Site } from '../../../models/WebAppModels';
import MakeArmCall from '../../ArmHelper';
import * as Types from '../../types';
import { getArmEndpointAndTokenFromState } from '../../StateUtilities';

const slotApiService = {
  fetchSlots: async (state: Types.RootState): Promise<ArmArray<Site>> => {
    let productionResourceId = state.site.resourceId;
    if (productionResourceId.includes('/slots/')) {
      productionResourceId = productionResourceId.split('/slots/')[0];
    }
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return await MakeArmCall<ArmArray<Site>>(armEndpoint, authToken, `${productionResourceId}/slots`, 'FetchSlots');
  },
};

export default slotApiService;
