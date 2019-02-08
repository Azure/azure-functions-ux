import { ArmObj } from '../../../../models/WebAppModels';
import MakeArmCall from '../../../ArmHelper';
import { RootState } from '../../../types';
import { ArmAzureStorageMount } from './reducer';

const appSettingsApiService = {
  fetchAzureStorageMount: (state: RootState): Promise<ArmObj<ArmAzureStorageMount>> => {
    const resourceId = `${state.site.resourceId}/config/azureStorageAccounts/list`;
    return MakeArmCall({ resourceId, commandName: 'fetchAzureStorageMount', method: 'POST' });
  },
  updateAzureStorageMount: (state: RootState, newAppSettings: ArmObj<ArmAzureStorageMount>) => {
    const resourceId = `${state.site.resourceId}/config/azureStorageAccounts`;
    return MakeArmCall({
      resourceId,
      commandName: 'updateAzureStorageMount',
      method: 'PUT',
      body: newAppSettings,
    });
  },
};

export default appSettingsApiService;
