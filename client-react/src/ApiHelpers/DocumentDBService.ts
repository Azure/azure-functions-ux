import { ArmResourceDescriptor } from '../utils/resourceDescriptors';
import MakeArmCall from './ArmHelper';
import { ArmArray } from '../models/arm-obj';
import { CommonConstants } from '../utils/CommonConstants';
import { DatabaseAccount, KeyList } from '../models/documentDB';

export default class DocumentDBService {
  public static fetchDatabaseAccounts = (resourceId: string) => {
    const { subscription } = new ArmResourceDescriptor(resourceId);
    const id = `/subscriptions/${subscription}/providers/Microsoft.DocumentDB/DatabaseAccounts`;
    return MakeArmCall<ArmArray<DatabaseAccount>>({
      resourceId: id,
      commandName: 'fetchDatabaseAccounts',
      apiVersion: CommonConstants.ApiVersions.documentDBApiVersion20150408,
    });
  };

  public static fetchKeyList = (resourceId: string) => {
    const id = `${resourceId}/listKeys`;
    return MakeArmCall<KeyList>({
      method: 'POST',
      resourceId: id,
      commandName: 'fetchKeyList',
      apiVersion: CommonConstants.ApiVersions.documentDBApiVersion20150408,
    });
  };

  // Note(nlayne): We'll just support SQL & MongoDB for now (6/30/2021)
  private static _addDbAcctType = (
    endpoint: string,
    dbAcctType: string,
    isContainer: boolean = false,
    databaseName: string | undefined = undefined
  ) => {
    if (isContainer && !databaseName) return '';

    switch (dbAcctType) {
      case 'GlobalDocumentDB':
        endpoint += !isContainer ? 'sqlDatabases' : `sqlDatabases/${databaseName}/containers`;
        break;

      case 'MongoDB':
        endpoint += !isContainer ? 'mongodbDatabases' : `mongodbDatabases/${databaseName}/collections`;
        break;

      default:
        return '';
    }

    return endpoint;
  };

  public static fetchDatabases = (resourceId: string, dbAcctName: string, dbAcctType: string) => {
    const { subscription, resourceGroup } = new ArmResourceDescriptor(resourceId);

    let endpoint = `/subscriptions/${subscription}/resourceGroups/${resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${dbAcctName}/`;
    endpoint = DocumentDBService._addDbAcctType(endpoint, dbAcctType);

    return MakeArmCall<any>({
      resourceId: endpoint,
      commandName: 'fetchDatabases',
      apiVersion: CommonConstants.ApiVersions.documentDBApiVersion20150408,
    });
  };

  public static fetchContainers = (resourceId: string, dbAcctName: string, dbAcctType: string, databaseName: string) => {
    const { subscription, resourceGroup } = new ArmResourceDescriptor(resourceId);

    let endpoint = `/subscriptions/${subscription}/resourceGroups/${resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${dbAcctName}/`;
    endpoint = DocumentDBService._addDbAcctType(endpoint, dbAcctType, true, databaseName);

    return MakeArmCall<any>({
      resourceId: endpoint,
      commandName: 'fetchContainers',
      apiVersion: CommonConstants.ApiVersions.documentDBApiVersion20150408,
    });
  };
}
