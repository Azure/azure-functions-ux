import { ArmObj, SiteConfig } from '../../../../models/WebAppModels';
import { MakeArmCall } from '../../../ApiHelpers';
import { RootState } from '../../../types';

const webConfigApiService = {
  fetchWebConfig: (state: RootState): Promise<ArmObj<SiteConfig>> => {
    const resourceId = `${state.site.resourceId}/config/web`;
    return MakeArmCall(state, resourceId);
  },
  updateWebConfig: (state: RootState, newConfig: ArmObj<SiteConfig>): Promise<ArmObj<SiteConfig>> => {
    const resourceId = `${state.site.resourceId}/config/web`;
    return MakeArmCall(state, resourceId, 'PUT', newConfig);
  },
};

export default webConfigApiService;
