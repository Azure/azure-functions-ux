import { AvailableStack } from '../../../models/available-stacks';
import { ArmArray } from '../../../models/WebAppModels';
import { MakeArmCall } from '../../ApiHelpers';
import * as Types from '../../types';
import { StacksOS } from './actions';

const availableStacksApiService = {
  fetchAvailableStacks: async (state: Types.RootState, stacksOs: StacksOS): Promise<ArmArray<AvailableStack>> => {
    const resourceId = `/providers/Microsoft.Web/availableStacks?osTypeSelected=${stacksOs}`;
    return await MakeArmCall<ArmArray<AvailableStack>>(state, resourceId);
  },
};

export default availableStacksApiService;
