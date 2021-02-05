import { CommonConstants } from '../utils/CommonConstants';
import Url from '../utils/url';
import { sendHttpRequest } from './HttpClient';
import { HttpResponseObject } from '../ArmHelper.types';
import { WebAppStack } from '../models/stacks/web-app-stacks';
import { FunctionAppStack } from '../models/stacks/function-app-stacks';
import { AppStackOs } from '../models/stacks/app-stacks';

export default class RuntimeStackService {
  public static getWebAppConfigurationStacks = (stacksOs: AppStackOs) => {
    const queryParams = [
      `os=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
      `api-version=${CommonConstants.ApiVersions.stacksApiVersion20201001}`,
    ];

    const url = `${Url.serviceHost}stacks/webAppStacks?${queryParams.join('&')}`;
    return RuntimeStackService._getStacksResponse<WebAppStack>(url);
  };

  public static getFunctionAppConfigurationStacks = (stacksOs: AppStackOs) => {
    const queryParams = [
      `os=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
      `api-version=${CommonConstants.ApiVersions.stacksApiVersion20201001}`,
    ];

    const url = `${Url.serviceHost}stacks/functionAppStacks?${queryParams.join('&')}`;
    return RuntimeStackService._getStacksResponse<FunctionAppStack>(url);
  };

  public static getWebAppGitHubActionStacks = async (stacksOs: AppStackOs) => {
    const queryParams = [
      `os=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
      `removeDeprecatedStacks=${true}`,
      `removeNonGitHubActionStacks=${true}`,
      `api-version=${CommonConstants.ApiVersions.stacksApiVersion20201001}`,
    ];

    const url = `${Url.serviceHost}stacks/webAppStacks?${queryParams.join('&')}`;
    return RuntimeStackService._getStacksResponse<WebAppStack>(url);
  };

  public static getFunctionAppGitHubActionStacks = async (stacksOs: AppStackOs) => {
    const queryParams = [
      `os=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
      `removeDeprecatedStacks=${true}`,
      `removeNonGitHubActionStacks=${true}`,
      `api-version=${CommonConstants.ApiVersions.stacksApiVersion20201001}`,
    ];

    const url = `${Url.serviceHost}stacks/functionAppStacks?${queryParams.join('&')}`;
    return RuntimeStackService._getStacksResponse<FunctionAppStack>(url);
  };

  private static _getStacksResponse = async <T>(url: string) => {
    const stacksResponse = await sendHttpRequest<T[]>({
      url,
      method: 'GET',
    });

    const success = stacksResponse.metadata.success && !!stacksResponse.data;
    const mappedResult: HttpResponseObject<T[]> = {
      ...stacksResponse,
      metadata: {
        ...stacksResponse.metadata,
        success,
      },
      data: success ? stacksResponse.data : [],
    };

    return mappedResult;
  };

  private static _isShowHiddenStackFlagPassed = () => {
    const flagValue = Url.getFeatureValue(CommonConstants.FeatureFlags.showHiddenStacks);
    return flagValue && flagValue.toLocaleLowerCase() === 'true';
  };
}
