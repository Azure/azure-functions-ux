import { sendHttpRequest } from './HttpClient';
import { GraphApiVersion, graphApiUrl } from '../utils/CommonConstants';

export default class GraphService {
  public static getUser = (adToken: string) => {
    return sendHttpRequest<any>({
      url: `${graphApiUrl}/${GraphApiVersion.V1}/me`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adToken}`,
      },
    });
  };
}
