import { ArmArray } from '../models/arm-obj';
import { BlobContainer, FileShareContainer, StorageAccount, StorageAccountKeys } from '../models/storage-account';
import { CommonConstants } from '../utils/CommonConstants';
import { ArmResourceDescriptor } from '../utils/resourceDescriptors';

import MakeArmCall from './ArmHelper';

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

  public static fetchStorageBlobContainers = (resourceId: string) => {
    const id = `${resourceId}/blobServices/default/containers`;
    return MakeArmCall<ArmArray<BlobContainer>>({
      resourceId: id,
      method: 'GET',
      commandName: 'fetchStorageAccountBlobContainers',
      apiVersion: CommonConstants.ApiVersions.storageApiVersion20180701,
    });
  };

  public static fetchStorageFileShareContainers = (resourceId: string) => {
    const id = `${resourceId}/fileServices/default/shares`;
    return MakeArmCall<ArmArray<FileShareContainer>>({
      resourceId: id,
      method: 'GET',
      commandName: 'fetchStorageAccountFileShareContainers',
      apiVersion: CommonConstants.ApiVersions.storageApiVersion20210401,
    });
  };
}
