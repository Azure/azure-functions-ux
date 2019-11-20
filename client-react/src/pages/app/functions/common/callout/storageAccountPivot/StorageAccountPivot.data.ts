import StorageService from '../../../../../../ApiHelpers/StorageService';

export default class StorageAccountPivotData {
  public fetchAzureStorageAccounts(resourceId: string) {
    return StorageService.fetchAzureStorageAccounts(resourceId);
  }
}
