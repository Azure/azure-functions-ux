import { ArmObj } from '../../../../models/WebAppModels';
import { MakeArmCall } from '../../../ArmHelper';
import { RootState } from '../../../types';
import { Metadata } from './reducer';
import { getArmEndpointAndTokenFromState } from '../../../StateUtilities';

const metadataApiService = {
  fetchMetadata: async (state: RootState): Promise<ArmObj<Metadata>> => {
    const resourceId = `${state.site.resourceId}/config/metadata/list`;
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return MakeArmCall(armEndpoint, authToken, resourceId, 'FetchMetadata', 'POST');
  },
  updateMetadata: (state: RootState, newMetadata: ArmObj<Metadata>): Promise<ArmObj<Metadata>> => {
    const resourceId = `${state.site.resourceId}/config/metadata`;
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return MakeArmCall(armEndpoint, authToken, resourceId, 'UpdateMetadata', 'PUT', newMetadata);
  },
};

export default metadataApiService;
