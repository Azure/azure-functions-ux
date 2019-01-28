import { ArmObj, Site } from '../../models/WebAppModels';
import MakeArmCall from '../ArmHelper';
import { RootState } from '../types';

const siteApiService = {
  fetchSite: (state: RootState): Promise<ArmObj<Site>> => {
    const resourceId = state.site.resourceId;
    return MakeArmCall<ArmObj<Site>>({ resourceId, commandName: 'fetchSite' });
  },
  updateSite: (state: RootState, site: ArmObj<Site>): Promise<ArmObj<Site>> => {
    const resourceId = state.site.resourceId;
    return MakeArmCall<ArmObj<Site>>({ resourceId, commandName: 'updateSite', method: 'PUT', body: site });
  },
};

export default siteApiService;
