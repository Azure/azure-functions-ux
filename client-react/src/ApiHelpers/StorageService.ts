import { ArmResourceDescriptor } from '../utils/resourceDescriptors';
import MakeArmCall from './ArmHelper';
import { ArmArray } from '../models/arm-obj';
import { StorageAccount } from '../models/storage-account';

export default class StorageService {
  public static fetchAzureStorageAccounts = (resourceId: string) => {
    const { subscription } = new ArmResourceDescriptor(resourceId);
    const id = `/subscriptions/${subscription}/providers/Microsoft.Storage/storageAccounts`;
    return MakeArmCall<ArmArray<StorageAccount>>({ resourceId: id, commandName: 'fetchStorageAccounts' });
  };
}
