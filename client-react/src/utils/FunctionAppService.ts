import { ArmObj } from '../models/arm-obj';
import { CommonConstants } from './CommonConstants';
import { KeyValue } from '../models/portal-models';

export default class FunctionAppService {
  public static getRFPSetting(appSettings: ArmObj<KeyValue<string>>): string {
    return (
      appSettings.properties[CommonConstants.AppSettingNames.websiteUseZip] ||
      appSettings.properties[CommonConstants.AppSettingNames.websiteRunFromZip] ||
      appSettings.properties[CommonConstants.AppSettingNames.websiteRunFromPackage] ||
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
    return !!workerRuntime && CommonConstants.WorkerRuntimeLanguages[workerRuntime] === CommonConstants.WorkerRuntimeLanguages.python;
  }

  public static usingJavaWorkerRuntime(appSettings: ArmObj<KeyValue<string>>): boolean {
    const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);
    return !!workerRuntime && CommonConstants.WorkerRuntimeLanguages[workerRuntime] === CommonConstants.WorkerRuntimeLanguages.java;
  }
}
