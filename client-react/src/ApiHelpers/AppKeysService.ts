import { AppKeysInfo, AppKeysTypes } from '../pages/app/functions/app-keys/AppKeys.types';
import { ArmObj } from '../models/arm-obj';
import MakeArmCall from './ArmHelper';

export default class AppKeyService {
  public static getKeys = (resourceId: string) => {
    const id = `${resourceId}/host/default/listkeys`;
    return MakeArmCall<AppKeysInfo>({
      resourceId: id,
      commandName: 'getAppKeys',
      method: 'POST',
    });
  };

  public static createKey = (resourceId: string, keyType: AppKeysTypes, keyName: string, keyValue?: string) => {
    const body = {
      id: '',
      location: '',
      name: '',
      properties: {},
    };
    if (keyValue && keyValue.length > 0) {
      body.properties['name'] = keyName;
      body.properties['value'] = keyValue;
    }
    const id = `${resourceId}/host/default/${keyType}/${keyName}`;

    return MakeArmCall<ArmObj<{ [key: string]: string }>>({
      resourceId: id,
      commandName: 'createAppKey',
      method: 'PUT',
      body: body,
    });
  };

  public static deleteKey = (resourceId: string, keyName: string, keyType: AppKeysTypes) => {
    const id = `${resourceId}/host/default/${keyType}/${keyName}`;
    return MakeArmCall<{}>({
      resourceId: id,
      commandName: 'deleteAppKey',
      method: 'DELETE',
    });
  };
}
