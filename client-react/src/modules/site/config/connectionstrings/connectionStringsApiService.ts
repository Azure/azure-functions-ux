import { ArmObj } from '../../../../models/WebAppModels';
import MakeArmCall from '../../../ArmHelper';
import { RootState } from '../../../types';
import { ConnectionString } from './reducer';

const connectionStringsApiService = {
  fetchConnectionStrings: (state: RootState): Promise<ArmObj<ConnectionString>> => {
    const resourceId = `${state.site.resourceId}/config/connectionstrings/list`;
    return MakeArmCall({ resourceId, commandName: 'FetchConnectionStrings', method: 'POST' });
  },
  updateConnectionStrings: (state: RootState, newConnectionStrings: ArmObj<ConnectionString>): Promise<ArmObj<ConnectionString>> => {
    const resourceId = `${state.site.resourceId}/config/connectionstrings`;
    return MakeArmCall({
      resourceId,
      commandName: 'UpdateConnectionStrings',
      method: 'PUT',
      body: newConnectionStrings,
    });
  },
};

export default connectionStringsApiService;
