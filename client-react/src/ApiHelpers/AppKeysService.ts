import { AppKeysInfo, AppKeysTypes } from '../pages/app/functions/app-keys/AppKeys.types';
import { ArmObj } from '../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { sendHttpRequest, getJsonHeaders } from './HttpClient';

export default class AppKeyService {
  public static getKeys = (resourceId: string) => {
    const id = `${resourceId}/host/default/listkeys`;
    return MakeArmCall<AppKeysInfo>({
      resourceId: id,
      commandName: 'getAppKeys',
      method: 'POST',
    });
  };

  public static createKey = (resourceId: string, keyType: AppKeysTypes, keyName: string, keyValue?: string, mainUrl?: string) => {
    if (!keyValue) {
      const url = `${mainUrl}/admin/host/keys/${keyName}`;
      return sendHttpRequest<ArmObj<{ [key: string]: string }>>({
        url: url,
        method: 'POST',
        headers: getJsonHeaders(),
      });
    }
    const id = `${resourceId}/host/default/${keyType}/${keyName}`;
    const body = {
      id: '',
      location: '',
      name: '',
      properties: {
        name: keyName,
        value: keyValue,
      },
    };
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
