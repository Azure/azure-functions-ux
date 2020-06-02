import { sendHttpRequest } from './HttpClient';
import Url from '../utils/url';
import { GitHubUser } from '../models/github';
import { HttpResponseObject } from '../ArmHelper.types';

export default class GitHubService {
  public static authorizeUrl = `${Url.serviceHost}auth/github/authorize`;

  public static getUser = (authToken: string) => {
    const data = {
      url: 'https://api.github.com/user',
      authToken,
    };

    return sendHttpRequest<GitHubUser>({ url: `${Url.serviceHost}api/github/passthrough`, method: 'POST', data });
  };

  public static storeToken = (redirectUrl: string, authToken: string): Promise<HttpResponseObject<void>> => {
    const data = {
      redirUrl: redirectUrl,
      authToken: authToken,
    };

    return sendHttpRequest<void>({ url: `${Url.serviceHost}auth/github/storeToken`, method: 'POST', data });
  };
}
