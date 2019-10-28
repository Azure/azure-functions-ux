import DocumentDBService from '../../../../../../ApiHelpers/DocumentDBService';

export default class DocumentDBPivotData {
  public fetchDatabaseAccounts(resourceId: string) {
    return DocumentDBService.fetchDatabaseAccounts(resourceId);
  }

  public fetchKeyList(resourceId: string) {
    return DocumentDBService.fetchKeyList(resourceId);
  }
}
