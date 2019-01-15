import { ArmObj, SiteConfig } from '../../../../models/WebAppModels';
import { MakeArmCall } from '../../../ArmHelper';
import { RootState } from '../../../types';
import { getArmEndpointAndTokenFromState } from '../../../StateUtilities';

const webConfigApiService = {
  fetchWebConfig: (state: RootState): Promise<ArmObj<SiteConfig>> => {
    const resourceId = `${state.site.resourceId}/config/web`;
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return MakeArmCall(armEndpoint, authToken, resourceId, 'FetchWebConfig');
  },
  updateWebConfig: (state: RootState, newConfig: ArmObj<SiteConfig>): Promise<ArmObj<SiteConfig>> => {
    const resourceId = `${state.site.resourceId}/config/web`;
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return MakeArmCall(armEndpoint, authToken, resourceId, 'UpdateWebConfig', 'PUT', newConfig);
  },
};

export default webConfigApiService;
