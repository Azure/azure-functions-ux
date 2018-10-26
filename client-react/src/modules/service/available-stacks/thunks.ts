import { updateAvailableStacks, updateStacksLoading } from './actions';
import { checkCacheValid } from 'redux-cache';
import axios from 'axios';
import { ArmArray } from '../../../models/WebAppModels';
import { AvailableStack } from '../../../models/available-stacks';

export function fetchStacks(osType = 'Windows') {
  return async (dispatch: any, getState: any) => {
    const startupInfo = getState().portalService.startupInfo;
    const armToken = startupInfo.token;
    const armEndpoint = startupInfo.armEndpoint;
    const currentStacksCall = getState().stacks;
    const isCacheValid = checkCacheValid(getState, 'stacks');
    if (isCacheValid || currentStacksCall.loading) {
      return;
    }

    dispatch(updateStacksLoading(true));

    try {
      const stacksFetch = await axios.get<ArmArray<AvailableStack>>(
        `${armEndpoint}/providers/Microsoft.Web/availableStacks?osTypeSelected=${osType}&api-version=2018-02-01`,
        {
          headers: {
            Authorization: `Bearer ${armToken}`,
          },
        }
      );
      const stacksResult = stacksFetch.data;
      dispatch(updateAvailableStacks(stacksResult));
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(updateStacksLoading(false));
    }
  };
}
