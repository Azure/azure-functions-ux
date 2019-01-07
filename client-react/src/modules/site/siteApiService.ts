import { ArmObj, Site } from '../../models/WebAppModels';
import { MakeArmCall } from '../ApiHelpers';
import { RootState } from '../types';

const siteApiService = {
  fetchSite: (state: RootState): Promise<ArmObj<Site>> => {
    const resourceId = state.site.resourceId;
    return MakeArmCall<ArmObj<Site>>(state, resourceId);
  },
  updateSite: (state: RootState, site: ArmObj<Site>): Promise<ArmObj<Site>> => {
    const resourceId = state.site.resourceId;
    return MakeArmCall<ArmObj<Site>>(state, resourceId, 'PUT', site);
  },
};

export default siteApiService;
