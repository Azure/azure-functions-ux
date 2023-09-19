import { sendHttpRequest } from './HttpClient';
import Url from '../utils/url';

export default class GraphService {
  public static getUser = () => {
    return sendHttpRequest<any>({ url: `${Url.serviceHost}api/graph/getUser`, method: 'POST' });
  };
}
