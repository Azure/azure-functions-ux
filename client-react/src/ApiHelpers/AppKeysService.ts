import { UntrackedArmObj } from '../models/arm-obj';
import { AppKeysInfo, AppKeysTypes } from '../pages/app/functions/app-keys/AppKeys.types';
import MakeArmCall from './ArmHelper';

export default class AppKeyService {
  public static fetchKeys = (resourceId: string) => {
    const id = `${resourceId}/host/default/listkeys`;
    return MakeArmCall<AppKeysInfo>({
      resourceId: id,
      commandName: 'fetchAppKeys',
      method: 'POST',
    });
  };

  public static createKey = (resourceId: string, keyType: AppKeysTypes, keyName: string, keyValue: string) => {
    const body = {
      id: '',
      properties: keyName && keyValue ? { name: keyName, value: keyValue } : {},
    };

    const id = `${resourceId}/host/default/${keyType}/${keyName}`;

    return MakeArmCall<UntrackedArmObj<{ name?: string; value?: string }>>({
      resourceId: id,
      commandName: 'createAppKey',
      method: 'PUT',
      body: body,
    });
  };

  public static deleteKey = (resourceId: string, keyName: string, keyType: AppKeysTypes) => {
    const id = `${resourceId}/host/default/${keyType}/${keyName}`;
    return MakeArmCall<void>({
      resourceId: id,
      commandName: 'deleteAppKey',
      method: 'DELETE',
    });
  };
}
