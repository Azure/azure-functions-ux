import { sendHttpRequest } from './HttpClient';
import { GraphApiVersion, graphApiUrl } from '../utils/CommonConstants';
import { User } from '../pages/app/deployment-center/DeploymentCenter.types';

export default class GraphService {
  public static getUser = (adToken: string) => {
    return sendHttpRequest<User>({
      url: `${graphApiUrl}/${GraphApiVersion.V1}/me`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adToken}`,
      },
    });
  };
}
