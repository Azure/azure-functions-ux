import { ArmObj } from '../../../../models/WebAppModels';
import MakeArmCall from '../../../ArmHelper';
import { RootState } from '../../../types';
import { Metadata } from './reducer';

const metadataApiService = {
  fetchMetadata: async (state: RootState): Promise<ArmObj<Metadata>> => {
    const resourceId = `${state.site.resourceId}/config/metadata/list`;
    return MakeArmCall({ resourceId, commandName: 'FetchMetadata', method: 'POST' });
  },
  updateMetadata: (state: RootState, newMetadata: ArmObj<Metadata>): Promise<ArmObj<Metadata>> => {
    const resourceId = `${state.site.resourceId}/config/metadata`;
    return MakeArmCall({ resourceId, commandName: 'UpdateMetadata', method: 'PUT', body: newMetadata });
  },
};

export default metadataApiService;
