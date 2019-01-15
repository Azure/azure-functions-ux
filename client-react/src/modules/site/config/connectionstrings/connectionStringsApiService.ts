import { ArmObj } from '../../../../models/WebAppModels';
import { MakeArmCall } from '../../../ArmHelper';
import { RootState } from '../../../types';
import { ConnectionString } from './reducer';
import { getArmEndpointAndTokenFromState } from '../../../StateUtilities';

const connectionStringsApiService = {
  fetchConnectionStrings: (state: RootState): Promise<ArmObj<ConnectionString>> => {
    const resourceId = `${state.site.resourceId}/config/connectionstrings/list`;
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return MakeArmCall(armEndpoint, authToken, resourceId, 'FetchConnectionStrings', 'POST');
  },
  updateConnectionStrings: (state: RootState, newConnectionStrings: ArmObj<ConnectionString>): Promise<ArmObj<ConnectionString>> => {
    const resourceId = `${state.site.resourceId}/config/connectionstrings`;
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return MakeArmCall(armEndpoint, authToken, resourceId, 'UpdateConnectionStrings', 'PUT', newConnectionStrings);
  },
};

export default connectionStringsApiService;
