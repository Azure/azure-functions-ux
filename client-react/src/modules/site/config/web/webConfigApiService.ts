import { ArmObj, SiteConfig } from '../../../../models/WebAppModels';
import MakeArmCall from '../../../ArmHelper';
import { RootState } from '../../../types';

const webConfigApiService = {
  fetchWebConfig: (state: RootState): Promise<ArmObj<SiteConfig>> => {
    const resourceId = `${state.site.resourceId}/config/web`;
    return MakeArmCall({ resourceId, commandName: 'fetchWebConfig' });
  },
  updateWebConfig: (state: RootState, newConfig: ArmObj<SiteConfig>): Promise<ArmObj<SiteConfig>> => {
    const resourceId = `${state.site.resourceId}/config/web`;
    return MakeArmCall({ resourceId, commandName: 'updateWebConfig', method: 'PUT', body: newConfig });
  },
};

export default webConfigApiService;
