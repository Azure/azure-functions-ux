import { ArmObj } from '../../../../models/WebAppModels';
import { MakeArmCall } from '../../../ApiHelpers';
import { RootState } from '../../../types';
import { Metadata } from './reducer';

const metadataApiService = {
  fetchMetadata: async (state: RootState): Promise<ArmObj<Metadata>> => {
    const resourceId = `${state.site.resourceId}/config/metadata/list`;
    return MakeArmCall(state, resourceId, 'POST');
  },
  updateMetadata: (state: RootState, newMetadata: ArmObj<Metadata>): Promise<ArmObj<Metadata>> => {
    const resourceId = `${state.site.resourceId}/config/metadata`;
    return MakeArmCall(state, resourceId, 'PUT', newMetadata);
  },
};

export default metadataApiService;
