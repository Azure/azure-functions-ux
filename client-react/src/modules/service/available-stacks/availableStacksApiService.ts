import { AvailableStack } from '../../../models/available-stacks';
import { ArmArray } from '../../../models/WebAppModels';
import MakeArmCall from '../../ArmHelper';
import { StacksOS } from './actions';

const availableStacksApiService = {
  fetchAvailableStacks: async (stacksOs: StacksOS): Promise<ArmArray<AvailableStack>> => {
    const queryString = `?osTypeSelected=${stacksOs}`;
    const resourceId = `/providers/Microsoft.Web/availableStacks`;
    return await MakeArmCall<ArmArray<AvailableStack>>({
      resourceId,
      queryString,
      commandName: 'FetchAvailableStacks',
    });
  },
};

export default availableStacksApiService;
