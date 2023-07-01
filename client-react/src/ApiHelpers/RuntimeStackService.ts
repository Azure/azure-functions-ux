import { HttpResponseObject } from '../ArmHelper.types';
import { ArmArray, ArmObj } from '../models/arm-obj';
import { AppStackOs } from '../models/stacks/app-stacks';
import { FunctionAppStack } from '../models/stacks/function-app-stacks';
import { WebAppStack } from '../models/stacks/web-app-stacks';
import { CommonConstants } from '../utils/CommonConstants';
import { NationalCloudEnvironment } from '../utils/scenario-checker/national-cloud.environment';
import Url from '../utils/url';

import MakeArmCall from './ArmHelper';
import { sendHttpRequest } from './HttpClient';

export default class RuntimeStackService {
  public static getWebAppConfigurationStacks = (stacksOs: AppStackOs) => {
    if (RuntimeStackService._useFusionApi()) {
      return RuntimeStackService._getWebAppConfigurationStacksNonArm(stacksOs);
    }

    const queryParams = [
      `stackOsType=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
      `useCanaryFusionServer=${Url.isNextEnvironment()}`,
    ];

    return MakeArmCall<ArmArray<WebAppStack>>({
      resourceId: `/providers/Microsoft.Web/webAppStacks?${queryParams.join('&')}`,
      commandName: 'GetWebAppConfigurationStacks',
      apiVersion: CommonConstants.ApiVersions.stacksApiVersion20201001,
      method: 'GET',
    });
  };

  public static getFunctionAppConfigurationStacks = (stacksOs: AppStackOs) => {
    if (RuntimeStackService._useFusionApi()) {
      return RuntimeStackService._getFunctionAppConfigurationStacksNonArm(stacksOs);
    }

    const queryParams = [
      `stackOsType=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
      `useCanaryFusionServer=${Url.isNextEnvironment()}`,
    ];

    return MakeArmCall<ArmArray<FunctionAppStack>>({
      resourceId: `/providers/Microsoft.Web/functionAppStacks?${queryParams.join('&')}`,
      commandName: 'GetFunctionAppConfigurationStacks',
      apiVersion: CommonConstants.ApiVersions.stacksApiVersion20201001,
      method: 'GET',
    });
  };

  public static getWebAppGitHubActionStacks = async (stacksOs: AppStackOs) => {
    if (RuntimeStackService._useFusionApi()) {
      return RuntimeStackService._getWebAppGitHubActionStacksNonArm(stacksOs);
    }

    const queryParams = [
      `stackOsType=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
      `removeDeprecatedStacks=${true}`,
      `removeNonGitHubActionStacks=${true}`,
      `useCanaryFusionServer=${Url.isNextEnvironment()}`,
    ];

    return MakeArmCall<ArmArray<WebAppStack>>({
      resourceId: `/providers/Microsoft.Web/webAppStacks?${queryParams.join('&')}`,
      commandName: 'GetWebAppGitHubActionStacks',
      apiVersion: CommonConstants.ApiVersions.stacksApiVersion20201001,
      method: 'GET',
    });
  };

  public static getFunctionAppGitHubActionStacks = async (stacksOs: AppStackOs) => {
    if (RuntimeStackService._useFusionApi()) {
      return RuntimeStackService._getFunctionAppGitHubActionStacksNonArm(stacksOs);
    }

    const queryParams = [
      `stackOsType=${stacksOs}`,
      `removeHiddenStacks=${false}`, // to allow dotnet-isolated to be handled on portal
      `removeDeprecatedStacks=${true}`,
      `removeNonGitHubActionStacks=${true}`,
      `useCanaryFusionServer=${Url.isNextEnvironment()}`,
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

  private static _useFusionApi() {
    return NationalCloudEnvironment.isUSNat() || NationalCloudEnvironment.isUSSec();
  }

  private static _getWebAppConfigurationStacksNonArm = (stacksOs: AppStackOs) => {
    const queryParams = [
      `os=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
      `api-version=${CommonConstants.ApiVersions.stacksApiVersion20201001}`,
    ];

    const url = `${Url.serviceHost}stacks/webAppStacks?${queryParams.join('&')}`;
    return RuntimeStackService._getStacksResponse<WebAppStack>(url);
  };

  private static _getFunctionAppConfigurationStacksNonArm = (stacksOs: AppStackOs) => {
    const queryParams = [
      `os=${stacksOs}`,
      `removeHiddenStacks=${!RuntimeStackService._isShowHiddenStackFlagPassed()}`,
      `api-version=${CommonConstants.ApiVersions.stacksApiVersion20201001}`,
    ];

    const url = `${Url.serviceHost}stacks/functionAppStacks?${queryParams.join('&')}`;
    return RuntimeStackService._getStacksResponse<FunctionAppStack>(url);
  };

  private static _getWebAppGitHubActionStacksNonArm = async (stacksOs: AppStackOs) => {
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

  private static _getFunctionAppGitHubActionStacksNonArm = async (stacksOs: AppStackOs) => {
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
    const mappedResult: HttpResponseObject<ArmArray<T>> = {
      ...stacksResponse,
      metadata: {
        ...stacksResponse.metadata,
        success,
      },
      data: RuntimeStackService._convertToArmArrayResult(success ? stacksResponse.data : []),
    };

    return mappedResult;
  };

  private static _convertToArmArrayResult<T>(data: T[]): ArmArray<T> {
    const armObjectArray: ArmObj<T>[] = data.map(stack => {
      return {
        id: '',
        location: '',
        name: '',
        properties: stack,
      };
    });
    return { value: armObjectArray };
  }
}
