import { CommonConstants } from '../utils/CommonConstants';
import Url from '../utils/url';
import { WebAppStack } from '../models/stacks/web-app-stacks';
import { FunctionAppStack } from '../models/stacks/function-app-stacks';
import { AppStackOs } from '../models/stacks/app-stacks';
import MakeArmCall from './ArmHelper';
import { ArmArray } from '../models/arm-obj';

export default class RuntimeStackService {
  public static getWebAppConfigurationStacks = (stacksOs: AppStackOs) => {
    const queryParams = [`os=${stacksOs}`, `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`];

    return MakeArmCall<ArmArray<WebAppStack>>({
      resourceId: `/providers/Microsoft.Web/webAppStacks?${queryParams.join('&')}`,
      commandName: 'GetWebAppConfigurationStacks',
      apiVersion: CommonConstants.ApiVersions.stacksApiVersion20201001,
      method: 'GET',
    });
  };

  public static getFunctionAppConfigurationStacks = (stacksOs: AppStackOs) => {
    const queryParams = [`os=${stacksOs}`, `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`];

    return MakeArmCall<ArmArray<FunctionAppStack>>({
      resourceId: `/providers/Microsoft.Web/functionAppStacks?${queryParams.join('&')}`,
      commandName: 'GetFunctionAppConfigurationStacks',
      apiVersion: CommonConstants.ApiVersions.stacksApiVersion20201001,
      method: 'GET',
    });
  };

  public static getWebAppGitHubActionStacks = async (stacksOs: AppStackOs) => {
    const queryParams = [
      `os=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
      `removeDeprecatedStacks=${true}`,
      `removeNonGitHubActionStacks=${true}`,
    ];

    return MakeArmCall<ArmArray<WebAppStack>>({
      resourceId: `/providers/Microsoft.Web/webAppStacks?${queryParams.join('&')}`,
      commandName: 'GetWebAppGitHubActionStacks',
      apiVersion: CommonConstants.ApiVersions.stacksApiVersion20201001,
      method: 'GET',
    });
  };

  public static getFunctionAppGitHubActionStacks = async (stacksOs: AppStackOs) => {
    const queryParams = [
      `os=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
      `removeDeprecatedStacks=${true}`,
      `removeNonGitHubActionStacks=${true}`,
    ];

    return MakeArmCall<ArmArray<FunctionAppStack>>({
      resourceId: `/providers/Microsoft.Web/functionAppStacks?${queryParams.join('&')}`,
      commandName: 'GetFunctionAppGitHubActionStacks',
      apiVersion: CommonConstants.ApiVersions.stacksApiVersion20201001,
      method: 'GET',
    });
  };

  private static _isShowHiddenStackFlagPassed = () => {
    const flagValue = Url.getFeatureValue(CommonConstants.FeatureFlags.showHiddenStacks);
    return flagValue && flagValue.toLocaleLowerCase() === 'true';
  };
}
