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
      case CommonConstants.CosmosDbTypes.globalDocumentDb:
        endpoint += !isContainer ? 'sqlDatabases' : `sqlDatabases/${databaseName}/containers`;
        break;

      case CommonConstants.CosmosDbTypes.mongoDb:
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

  public static getNewDatabaseArmTemplate = (
    databaseName: string,
    formProps: any,
    armResources: any[],
    dbAcctName: string | undefined = undefined
  ) => {
    const dbAcct = dbAcctName ? dbAcctName : formProps.values.connectionStringSetting.split('_')[0];

    let databaseTemplate: any = {
      type: 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases',
      apiVersion: CommonConstants.ApiVersions.documentDBApiVersion20210415,
      name: `${dbAcct}/${databaseName}`,
      properties: {
        resource: {
          id: `${databaseName}`,
        },
      },
    };

    // Handle MongoDB CosmosDB stuff (in addition to SQL)
    if (formProps.status && formProps.status.dbAcctType === CommonConstants.CosmosDbTypes.mongoDb) {
      databaseTemplate.type = 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases';
    }

    // If we're creating a new DB account, make sure to dependsOn it
    if (!dbAcctName) {
      armResources.forEach(rsc => {
        if (rsc.type === 'Microsoft.DocumentDB/databaseAccounts') {
          databaseTemplate.dependsOn = [`[resourceId('Microsoft.DocumentDB/databaseAccounts', '${dbAcct}')]`];
          return;
        }
      });
    } else {
      databaseTemplate.dependsOn = [`[resourceId('Microsoft.DocumentDB/databaseAccounts', '${dbAcct}')]`];
    }

    return databaseTemplate;
  };

  public static getNewContainerArmTemplate = (
    containerName: string,
    formProps: any,
    armResources: any[],
    dbAcctName: string | undefined = undefined,
    databaseName: string | undefined = undefined
  ) => {
    const dbAcct = dbAcctName ? dbAcctName : formProps.values.connectionStringSetting.split('_')[0];
    const database = databaseName ? databaseName : formProps.values.databaseName;

    let containerTemplate: any = {
      type: 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers',
      apiVersion: CommonConstants.ApiVersions.documentDBApiVersion20210415,
      name: `${dbAcct}/${database}/${containerName}`,
      properties: {
        resource: {
          id: `${containerName}`,
          partitionKey: {
            paths: ['/id'],
            kind: 'Hash',
          },
        },
      },
    };

    // If we're creating a new DB account and/or database, make sure to dependsOn it
    if (!dbAcctName && !databaseName) {
      armResources.forEach(rsc => {
        if (rsc.type === 'Microsoft.DocumentDB/databaseAccounts') {
          containerTemplate.dependsOn = [`[resourceId('Microsoft.DocumentDB/databaseAccounts/sqlDatabases', '${dbAcct}', '${database}')]`];
          return;
        }
      });
    } else {
      containerTemplate.dependsOn = [`[resourceId('Microsoft.DocumentDB/databaseAccounts/sqlDatabases', '${dbAcct}', '${database}')]`];
    }

    // Handle MongoDB CosmosDB stuff (in addition to SQL)
    if (formProps.status && formProps.status.dbAcctType === CommonConstants.CosmosDbTypes.mongoDb) {
      containerTemplate.type = 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases/collections';
      delete containerTemplate.properties.resource.partitionKey;
      if (containerTemplate.dependsOn) {
        containerTemplate.dependsOn = [`[resourceId('Microsoft.DocumentDB/databaseAccounts/mongodbDatabases', '${dbAcct}', '${database}')`];
      }
    }

    return containerTemplate;
  };
}
