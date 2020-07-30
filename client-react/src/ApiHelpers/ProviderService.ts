import MakeArmCall from './ArmHelper';
import { ArmObj, ArmArray } from '../models/arm-obj';
import { PublishingUser } from '../models/site/publish';
import { SourceControl } from '../models/provider';

export default class ProviderService {
  public static getUserSourceControls = () => {
    return MakeArmCall<ArmArray<SourceControl>>({
      method: 'GET',
      resourceId: `/providers/Microsoft.Web/sourcecontrols`,
      commandName: 'getUserSourceControls',
      skipBatching: true,
    });
  };

  public static getUserSourceControl = (provider: string) => {
    return MakeArmCall<ArmObj<SourceControl>>({
      method: 'GET',
      resourceId: `/providers/Microsoft.Web/sourcecontrols/${provider}`,
      commandName: 'getUserSourceControl',
      skipBatching: true,
    });
  };

  public static updateUserSourceControl(provider: string, token: string, refreshToken?: string, environment?: string) {
    return MakeArmCall<ArmObj<SourceControl>>({
      method: 'PUT',
      resourceId: `/providers/Microsoft.Web/sourcecontrols/${provider}`,
      commandName: 'updateUserSourceControl',
      body: {
        id: '',
        location: '',
        name: provider,
        type: 'Microsoft.Web/sourcecontrols',
        properties: {
          token,
          refreshToken,
          environment,
          name: provider,
        },
      },
    });
  }

  public static getPublishingUser = () => {
    const id = `/providers/Microsoft.Web/publishingUsers/web`;
    return MakeArmCall<ArmObj<PublishingUser>>({ method: 'GET', resourceId: id, commandName: 'getPublishingUser' });
  };

  public static updatePublishingUser = (user: ArmObj<PublishingUser>) => {
    const id = `/providers/Microsoft.Web/publishingUsers/web`;
    return MakeArmCall<ArmObj<PublishingUser>>({ method: 'PUT', resourceId: id, commandName: 'updatePublishingUser', body: user });
  };
}
