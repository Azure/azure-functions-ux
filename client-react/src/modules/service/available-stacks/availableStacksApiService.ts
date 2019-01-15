import { AvailableStack } from '../../../models/available-stacks';
import { ArmArray } from '../../../models/WebAppModels';
import { MakeArmCall } from '../../ArmHelper';
import { StacksOS } from './actions';
import { getArmEndpointAndTokenFromState } from '../../StateUtilities';
import { RootState } from '../../types';

const availableStacksApiService = {
  fetchAvailableStacks: async (state: RootState, stacksOs: StacksOS): Promise<ArmArray<AvailableStack>> => {
    const resourceId = `/providers/Microsoft.Web/availableStacks?osTypeSelected=${stacksOs}`;
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return await MakeArmCall<ArmArray<AvailableStack>>(armEndpoint, authToken, resourceId, 'FetchAvailableStacks');
  },
};

export default availableStacksApiService;
