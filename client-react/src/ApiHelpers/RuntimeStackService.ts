import { CommonConstants } from '../utils/CommonConstants';
import Url from '../utils/url';
import { sendHttpRequest } from './HttpClient';
import { HttpResponseObject } from '../ArmHelper.types';
import { AppOsType } from '../models/site/site';
import { WebAppStack } from '../models/stacks/web-app-stacks';
import { FunctionAppStack } from '../models/stacks/function-app-stacks';
import { AppStackOs } from '../models/stacks/app-stacks';

export default class RuntimeStackService {
  public static getWebAppConfigurationStacks = (stacksOs: AppStackOs) => {
    return sendHttpRequest<WebAppStack[]>({
      url: `${Url.serviceHost}stacks/webAppStacks?${RuntimeStackService._getStackUrlParameter(stacksOs)}`,
      method: 'GET',
    }).then(result => {
      const success = result.metadata.success && !!result.data;
      const mappedResult: HttpResponseObject<WebAppStack[]> = {
        ...result,
        metadata: {
          ...result.metadata,
          success,
        },
        data: success ? result.data : [],
      };
      return mappedResult;
    });
  };

  public static getFunctionAppConfigurationStacks = (stacksOs: AppStackOs) => {
    return sendHttpRequest<FunctionAppStack[]>({
      url: `${Url.serviceHost}stacks/functionAppStacks?${RuntimeStackService._getStackUrlParameter(stacksOs)}`,
      method: 'GET',
    }).then(result => {
      const success = result.metadata.success && !!result.data;
      const mappedResult: HttpResponseObject<FunctionAppStack[]> = {
        ...result,
        metadata: {
          ...result.metadata,
          success,
        },
        data: success ? result.data : [],
      };
      return mappedResult;
    });
  };

  public static getWebAppGitHubActionStacks = async (stacksOs: AppOsType) => {
    const stacksResponse = await sendHttpRequest<WebAppStack[]>({
      url: `${
        Url.serviceHost
      }stacks/webAppStacks?os=${stacksOs}&removeDeprecatedStacks=${true}&removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}&api-version=${
        CommonConstants.ApiVersions.stacksApiVersion20200601
      }`,
      method: 'GET',
    });

    const success = stacksResponse.metadata.success && !!stacksResponse.data;
    const mappedResult: HttpResponseObject<WebAppStack[]> = {
      ...stacksResponse,
      metadata: {
        ...stacksResponse.metadata,
        success,
      },
      data: RuntimeStackService._filterGitHubActionStacks(stacksResponse),
    };
    return mappedResult;
  };

  private static _filterGitHubActionStacks = (stacksResponse: HttpResponseObject<WebAppStack[]>) => {
    let gitHubActionStacks: WebAppStack[] = [];
    if (stacksResponse.metadata.success) {
      stacksResponse.data.forEach(currentStack => {
        currentStack.majorVersions.forEach(majorVersion => {
          majorVersion.minorVersions.forEach(minorVersion => {
            if (
              minorVersion.stackSettings.windowsRuntimeSettings &&
              minorVersion.stackSettings.windowsRuntimeSettings.gitHubActionSettings.isSupported &&
              !gitHubActionStacks.find(val => val === currentStack)
            ) {
              gitHubActionStacks.push(currentStack);
            }

            if (
              minorVersion.stackSettings.linuxRuntimeSettings &&
              minorVersion.stackSettings.linuxRuntimeSettings.gitHubActionSettings.isSupported &&
              !gitHubActionStacks.find(val => val === currentStack)
            ) {
              gitHubActionStacks.push(currentStack);
            }
          });
        });
      });
    }
    return gitHubActionStacks;
  };

  private static _getStackUrlParameter = (stacksOs: AppStackOs) => {
    return `api-version=${
      CommonConstants.ApiVersions.stacksApiVersion20200601
    }&os=${stacksOs}&removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`;
  };

  private static _isShowHiddenStackFlagPassed = () => {
    const flagValue = Url.getFeatureValue(CommonConstants.FeatureFlags.showHiddenStacks);
    return flagValue && flagValue.toLocaleLowerCase() === 'true';
  };
}
