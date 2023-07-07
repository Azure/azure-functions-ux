import MakeArmCall from '../ArmHelper';
import { CommonConstants } from '../../utils/CommonConstants';
import { Environment } from '../../models/static-site/environment';
import { Function as StaticSiteFunction } from '../../models/static-site/function';
import { ArmObj, ArmArray } from '../../models/arm-obj';
import { KeyValue } from '../../models/portal-models';

export default class EnvironmentService {
  // Environment is called build in the backend
  public static getEnvironments = (resourceId: string) => {
    return MakeArmCall<ArmArray<Environment>>({
      resourceId: `${resourceId}/builds`,
      commandName: 'getEnvironments',
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };

  public static fetchEnvironmentSettings = (resourceId: string) => {
    return MakeArmCall<ArmObj<KeyValue<string>>>({
      resourceId: `${resourceId}/listAppSettings`,
      commandName: 'fetchEnvironmentSettings',
      method: 'POST',
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };

  public static saveEnvironmentVariables = (resourceId: string, body: ArmObj<KeyValue<string>>) => {
    return MakeArmCall<ArmObj<KeyValue<string>>>({
      body,
      resourceId: `${resourceId}/config/appsettings`,
      commandName: 'saveEnvironmentSettings',
      method: 'PUT',
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };

  public static fetchFunctions = (resourceId: string) => {
    return MakeArmCall<ArmArray<StaticSiteFunction>>({
      resourceId: `${resourceId}/functions`,
      commandName: 'fetchFunctions',
      method: 'GET',
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };
}
