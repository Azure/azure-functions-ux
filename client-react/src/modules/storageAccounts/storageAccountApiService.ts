import { ArmArray, StorageAccount } from '../../models/WebAppModels';
import MakeArmCall from '../ArmHelper';
import { RootState } from '../types';
import { ArmResourceDescriptor } from '../../utils/resourceDescriptors';

const storageAccountsApiService = {
  fetchStorageAccounts: (state: RootState): Promise<ArmArray<StorageAccount>> => {
    const { subscription } = new ArmResourceDescriptor(state.site.resourceId);
    const resourceId = `/subscriptions/${subscription}/providers/Microsoft.Storage/storageAccounts`;
    return MakeArmCall<ArmArray<StorageAccount>>({ resourceId, commandName: 'fetchStorageAccounts' });
  },
};

export default storageAccountsApiService;
