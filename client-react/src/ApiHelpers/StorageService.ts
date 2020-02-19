import { ArmResourceDescriptor } from '../utils/resourceDescriptors';
import MakeArmCall from './ArmHelper';
import { ArmArray } from '../models/arm-obj';
import { StorageAccount, StorageAccountKeys } from '../models/storage-account';
import { CommonConstants } from '../utils/CommonConstants';

export default class StorageService {
  public static fetchAzureStorageAccounts = (resourceId: string) => {
    const { subscription } = new ArmResourceDescriptor(resourceId);
    const id = `/subscriptions/${subscription}/providers/Microsoft.Storage/storageAccounts`;
    return MakeArmCall<ArmArray<StorageAccount>>({
      resourceId: id,
      commandName: 'fetchStorageAccounts',
      apiVersion: CommonConstants.ApiVersions.storageApiVersion20180701,
    });
  };

  public static fetchStorageAccountKeys = (resourceId: string) => {
    const id = `${resourceId}/listKeys`;
    return MakeArmCall<StorageAccountKeys>({
      resourceId: id,
      method: 'POST',
      commandName: 'fetchStorageAccountKeys',
      apiVersion: CommonConstants.ApiVersions.storageApiVersion20180701,
    });
  };
}
