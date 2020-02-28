import StorageService from '../../../../../../ApiHelpers/StorageService';

export default class StorageAccountPivotData {
  public fetchAzureStorageAccounts(resourceId: string) {
    return StorageService.fetchAzureStorageAccounts(resourceId);
  }

  public fetchStorageAccountKeys(resourceId: string) {
    return StorageService.fetchStorageAccountKeys(resourceId);
  }
}
