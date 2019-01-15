import { ArmObj, Site } from '../../models/WebAppModels';
import MakeArmCall from '../ArmHelper';
import { RootState } from '../types';
import { getArmEndpointAndTokenFromState } from '../StateUtilities';

const siteApiService = {
  fetchSite: (state: RootState): Promise<ArmObj<Site>> => {
    const resourceId = state.site.resourceId;
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return MakeArmCall<ArmObj<Site>>(armEndpoint, authToken, resourceId, 'FetchSite');
  },
  updateSite: (state: RootState, site: ArmObj<Site>): Promise<ArmObj<Site>> => {
    const resourceId = state.site.resourceId;
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return MakeArmCall<ArmObj<Site>>(armEndpoint, authToken, resourceId, 'UpdateSite', 'PUT', site);
  },
};

export default siteApiService;
