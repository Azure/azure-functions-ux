import { AvailableStack, WebAppCreateStack } from '../models/available-stacks';
import { CommonConstants } from '../utils/CommonConstants';
import { ArmArray } from '../models/arm-obj';
import Url from '../utils/url';
import { sendHttpRequest } from './HttpClient';
import { HttpResponseObject } from '../ArmHelper.types';
import { AppOsType } from '../models/site/site';

export default class RuntimeStackService {
  public static getWebAppConfigurationStacks = (stacksOs: 'linux' | 'windows') => {
    return sendHttpRequest<AvailableStack[]>({
      url: `${Url.serviceHost}stacks/webAppConfigStacks?os=${stacksOs}&api-version=${CommonConstants.ApiVersions.stacksApiVersion20200501}`,
      method: 'POST',
    }).then(result => {
      const success = result.metadata.success && !!result.data;
      const mappedResult: HttpResponseObject<ArmArray<AvailableStack>> = {
        ...result,
        metadata: {
          ...result.metadata,
          success,
        },
        data: success ? { value: result.data } : (null as any),
      };
      return mappedResult;
    });
  };

  public static getWebAppGitHubActionStacks = (stacksOs: AppOsType) => {
    return sendHttpRequest<WebAppCreateStack[]>({
      url: `${Url.serviceHost}stacks/webAppGitHubActionStacks?os=${stacksOs}&api-version=${
        CommonConstants.ApiVersions.stacksApiVersion20200501
      }`,
      method: 'POST',
    });
  };
}
