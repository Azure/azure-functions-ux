import MakeArmCall from './ArmHelper';
import { AppKeysInfo } from '../pages/app/functions/app-keys/AppKeys.types';

export default class AppKeyService {
  public static getKeys = (resourceId: string) => {
    const id = `${resourceId}/host/default/listkeys`;
    return MakeArmCall<AppKeysInfo>({
      resourceId: id,
      commandName: 'getAppKeys',
      method: 'POST',
    });
  };
}
