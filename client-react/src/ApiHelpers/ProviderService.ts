import MakeArmCall from './ArmHelper';
import { ArmObj } from '../models/arm-obj';
import { PublishingUser } from '../models/site/publish';

export default class ProviderService {
  public static getPublishingUser = () => {
    const id = `/providers/Microsoft.Web/publishingUsers/web`;
    return MakeArmCall<ArmObj<PublishingUser>>({ method: 'GET', resourceId: id, commandName: 'getPublishingUser' });
  };

  public static updatePublishingUser = (user: ArmObj<PublishingUser>) => {
    const id = `/providers/Microsoft.Web/publishingUsers/web`;
    return MakeArmCall<ArmObj<PublishingUser>>({ method: 'PUT', resourceId: id, commandName: 'updatePublishingUser', body: user });
  };
}
