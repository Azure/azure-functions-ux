import { CommonConstants } from '../utils/CommonConstants';
import Url from '../utils/url';
import { sendHttpRequest } from './HttpClient';
import { HttpResponseObject } from '../ArmHelper.types';
import { WebAppStack } from '../models/stacks/web-app-stacks';
import { FunctionAppStack } from '../models/stacks/function-app-stacks';
import { AppStackOs, CommonSettings } from '../models/stacks/app-stacks';

export default class RuntimeStackService {
  public static getWebAppConfigurationStacks = (stacksOs: AppStackOs) => {
    return sendHttpRequest<WebAppStack[]>({
      url: `${Url.serviceHost}stacks/webAppStacks?${RuntimeStackService._getCommonQueryParams(stacksOs).join('&')}`,
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
      url: `${Url.serviceHost}stacks/functionAppStacks?${RuntimeStackService._getCommonQueryParams(stacksOs).join('&')}`,
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

  public static getWebAppGitHubActionStacks = async (stacksOs: AppStackOs) => {
    const queryParams = [...RuntimeStackService._getCommonQueryParams(stacksOs), `removeDeprecatedStacks=${true}`];

    const stacksResponse = await sendHttpRequest<WebAppStack[]>({
      url: `${Url.serviceHost}stacks/webAppStacks?${queryParams.join('&')}`,
      method: 'GET',
    });

    const success = stacksResponse.metadata.success && !!stacksResponse.data;
    const mappedResult: HttpResponseObject<WebAppStack[]> = {
      ...stacksResponse,
      metadata: {
        ...stacksResponse.metadata,
        success,
      },
      data: RuntimeStackService._filterWebAppGitHubActionStacks(stacksResponse),
    };
    return mappedResult;
  };

  public static getFunctionAppGitHubActionStacks = async (stacksOs: AppStackOs) => {
    const queryParams = [...RuntimeStackService._getCommonQueryParams(stacksOs), `removeDeprecatedStacks=${true}`];

    const stacksResponse = await sendHttpRequest<FunctionAppStack[]>({
      url: `${Url.serviceHost}stacks/functionAppStacks?${queryParams.join('&')}`,
      method: 'GET',
    });

    const success = stacksResponse.metadata.success && !!stacksResponse.data;
    const mappedResult: HttpResponseObject<FunctionAppStack[]> = {
      ...stacksResponse,
      metadata: {
        ...stacksResponse.metadata,
        success,
      },
      data: RuntimeStackService._filterFunctionAppGitHubActionStacks(stacksResponse),
    };
    return mappedResult;
  };

  private static _filterWebAppGitHubActionStacks = (stacksResponse: HttpResponseObject<WebAppStack[]>) => {
    const gitHubActionStacks: WebAppStack[] = [];
    if (stacksResponse.metadata.success) {
      RuntimeStackService._populateGitHubActionStacks(stacksResponse.data, gitHubActionStacks);
    }
    return gitHubActionStacks;
  };

  private static _filterFunctionAppGitHubActionStacks = (stacksResponse: HttpResponseObject<FunctionAppStack[]>) => {
    const gitHubActionStacks: FunctionAppStack[] = [];
    if (stacksResponse.metadata.success) {
      RuntimeStackService._populateGitHubActionStacks(stacksResponse.data, gitHubActionStacks);
    }
    return gitHubActionStacks;
  };

  // NOTE(michinoy): disabling array literal rule allowing the '.find' method to be discovered on the incoming array.
  // tslint:disable-next-line: prefer-array-literal
  private static _populateGitHubActionStacks(
    stacks: WebAppStack[] | FunctionAppStack[],
    gitHubActionStacks: Array<WebAppStack | FunctionAppStack>
  ) {
    stacks.forEach(currentStack => {
      currentStack.majorVersions.forEach(majorVersion => {
        majorVersion.minorVersions.forEach(minorVersion => {
          if (
            (RuntimeStackService._isGitHubActionSupported(minorVersion.stackSettings.windowsRuntimeSettings) ||
              RuntimeStackService._isGitHubActionSupported(minorVersion.stackSettings.linuxRuntimeSettings)) &&
            !gitHubActionStacks.find(val => val === currentStack)
          ) {
            gitHubActionStacks.push(currentStack);
          }
        });
      });
    });
  }

  private static _getCommonQueryParams(stacksOs: AppStackOs) {
    return [
      `api-version=${CommonConstants.ApiVersions.stacksApiVersion20200601}`,
      `os=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
    ];
  }

  private static _isGitHubActionSupported(commonSettings?: CommonSettings) {
    return commonSettings && commonSettings.gitHubActionSettings && commonSettings.gitHubActionSettings.isSupported;
  }

  private static _isShowHiddenStackFlagPassed = () => {
    const flagValue = Url.getFeatureValue(CommonConstants.FeatureFlags.showHiddenStacks);
    return flagValue && flagValue.toLocaleLowerCase() === 'true';
  };
}
