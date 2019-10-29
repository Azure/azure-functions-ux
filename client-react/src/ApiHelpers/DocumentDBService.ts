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
}
