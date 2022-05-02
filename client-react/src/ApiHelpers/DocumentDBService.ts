import { ArmArray } from '../models/arm-obj';
import { DatabaseAccount, KeyList } from '../models/documentDB';
import { CommonConstants } from '../utils/CommonConstants';
import { ArmResourceDescriptor } from '../utils/resourceDescriptors';
import MakeArmCall from './ArmHelper';
import { sendHttpRequest } from './HttpClient';

export default class DocumentDBService {
  public static fetchDatabaseAccounts = (resourceId: string) => {
    const { subscription } = new ArmResourceDescriptor(resourceId);
    const id = `/subscriptions/${subscription}/providers/${CommonConstants.resourceTypes.cosmosDbAccount}`;
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

  public static validateDatabaseAccountName = (armEndpoint: string, token: string, name: string) => {
    // https://docs.microsoft.com/rest/api/cosmos-db-resource-provider/2021-07-01-preview/database-accounts/check-name-exists
    return sendHttpRequest<void>({
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'HEAD',
      url: `${armEndpoint}/providers/Microsoft.DocumentDB/databaseAccountNames/${name}?api-version=${CommonConstants.ApiVersions.documentDBApiVersion20210415}`,
    });
  };
}
