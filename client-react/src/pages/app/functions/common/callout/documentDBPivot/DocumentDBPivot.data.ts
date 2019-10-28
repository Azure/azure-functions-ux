import DocumentDBService from '../../../../../../ApiHelpers/DocumentDBService';
import UserService from '../../../../../../ApiHelpers/UserService';

export default class DocumentDBPivotData {
  public fetchSubscriptions() {
    return UserService.fetchSubscriptions();
  }

  public fetchDatabaseAccounts(resourceId: string) {
    return DocumentDBService.fetchDatabaseAccounts(resourceId);
  }

  public fetchKeyList(resourceId: string) {
    return DocumentDBService.fetchKeyList(resourceId);
  }
}
