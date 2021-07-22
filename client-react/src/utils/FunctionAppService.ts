import { ArmObj } from '../models/arm-obj';
import { CommonConstants, WorkerRuntimeLanguages } from './CommonConstants';
import { KeyValue } from '../models/portal-models';
import Url from './url';
import { Site } from '../models/site/site';
import { isLinuxDynamic } from './arm-utils';

export default class FunctionAppService {
  public static getRFPSetting(appSettings: ArmObj<KeyValue<string>>): string {
    return (
      appSettings.properties[CommonConstants.AppSettingNames.websiteUseZip] ||
      appSettings.properties[CommonConstants.AppSettingNames.websiteRunFromZip] ||
      appSettings.properties[CommonConstants.AppSettingNames.websiteRunFromPackage] ||
      appSettings.properties[CommonConstants.AppSettingNames.enableOryxBuild] ||
      '0'
    );
  }

  public static getWorkerRuntimeSetting(appSettings: ArmObj<KeyValue<string>>): string {
    return appSettings.properties[CommonConstants.AppSettingNames.functionsWorkerRuntime] || '';
  }

  public static usingRunFromPackage(appSettings: ArmObj<KeyValue<string>>): boolean {
    return FunctionAppService.getRFPSetting(appSettings) !== '0';
  }

  public static usingLocalCache(appSettings: ArmObj<KeyValue<string>>): boolean {
    return (
      !!appSettings.properties[CommonConstants.AppSettingNames.localCacheOptionSettingName] &&
      appSettings.properties[CommonConstants.AppSettingNames.localCacheOptionSettingName] === CommonConstants.localCacheOptionSettingValue
    );
  }

  public static usingPythonWorkerRuntime(appSettings: ArmObj<KeyValue<string>>): boolean {
    const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);
    return !!workerRuntime && workerRuntime === WorkerRuntimeLanguages.python;
  }

  public static usingJavaWorkerRuntime(appSettings: ArmObj<KeyValue<string>>): boolean {
    const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);
    return !!workerRuntime && workerRuntime === WorkerRuntimeLanguages.java;
  }

  public static usingNodeWorkerRuntime(appSettings: ArmObj<KeyValue<string>>): boolean {
    const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);
    return !!workerRuntime && workerRuntime === WorkerRuntimeLanguages.nodejs;
  }

  public static usingCustomWorkerRuntime(appSettings: ArmObj<KeyValue<string>>): boolean {
    const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);
    return !!workerRuntime && workerRuntime === WorkerRuntimeLanguages.custom;
  }

  public static usingDotnet5WorkerRuntime(appSettings: ArmObj<KeyValue<string>>): boolean {
    const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);
    return !!workerRuntime && workerRuntime === WorkerRuntimeLanguages.dotnet5;
  }

  public static usingPythonLinuxConsumption(site: ArmObj<Site>, appSettings?: ArmObj<KeyValue<string>>): boolean {
    return (
      !!Url.getFeatureValue(CommonConstants.FeatureFlags.enableEditingForLinuxConsumption) &&
      isLinuxDynamic(site) &&
      !!appSettings &&
      FunctionAppService.usingPythonWorkerRuntime(appSettings)
    );
  }

  public static usingNodeLinuxConsumption(site: ArmObj<Site>, appSettings?: ArmObj<KeyValue<string>>): boolean {
    return (
      !!Url.getFeatureValue(CommonConstants.FeatureFlags.enableEditingForLinuxConsumption) &&
      isLinuxDynamic(site) &&
      !!appSettings &&
      FunctionAppService.usingNodeWorkerRuntime(appSettings)
    );
  }
}
