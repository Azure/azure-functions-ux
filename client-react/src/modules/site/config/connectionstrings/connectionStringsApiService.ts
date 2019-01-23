import { ArmObj } from '../../../../models/WebAppModels';
import { MakeArmCall } from '../../../ApiHelpers';
import { RootState } from '../../../types';
import { ConnectionString } from './reducer';

const connectionStringsApiService = {
  fetchConnectionStrings: (state: RootState): Promise<ArmObj<ConnectionString>> => {
    const resourceId = `${state.site.resourceId}/config/connectionstrings/list`;
    return MakeArmCall(state, resourceId, 'POST');
  },
  updateConnectionStrings: (state: RootState, newConnectionStrings: ArmObj<ConnectionString>): Promise<ArmObj<ConnectionString>> => {
    const resourceId = `${state.site.resourceId}/config/connectionstrings`;
    return MakeArmCall(state, resourceId, 'PUT', newConnectionStrings);
  },
};

export default connectionStringsApiService;
