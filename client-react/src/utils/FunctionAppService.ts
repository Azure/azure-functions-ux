import { ArmObj } from '../models/arm-obj';
import { CommonConstants } from './CommonConstants';

export default class FunctionAppService {
  public static getRFPSetting(appSettings: ArmObj<{ [key: string]: string }>): string {
    return (
      appSettings.properties[CommonConstants.AppSettingNames.websiteUseZip] ||
      appSettings.properties[CommonConstants.AppSettingNames.websiteRunFromZip] ||
      appSettings.properties[CommonConstants.AppSettingNames.websiteRunFromPackage] ||
      '0'
    );
  }

  public static getWorkerRuntimeSetting(appSettings: ArmObj<{ [key: string]: string }>): string {
    return appSettings.properties[CommonConstants.AppSettingNames.functionsWorkerRuntime] || '';
  }

  public static usingRunFromPackage(appSettings: ArmObj<{ [key: string]: string }>): boolean {
    return FunctionAppService.getRFPSetting(appSettings) !== '0';
  }

  public static usingLocalCache(appSettings: ArmObj<{ [key: string]: string }>): boolean {
    return (
      !!appSettings.properties[CommonConstants.AppSettingNames.localCacheOptionSettingName] &&
      appSettings.properties[CommonConstants.AppSettingNames.localCacheOptionSettingName] === CommonConstants.localCacheOptionSettingValue
    );
  }

  public static usingPythonWorkerRuntime(appSettings: ArmObj<{ [key: string]: string }>): boolean {
    const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);
    return !!workerRuntime && CommonConstants.WorkerRuntimeLanguages[workerRuntime] === CommonConstants.WorkerRuntimeLanguages.python;
  }

  public static usingJavaWorkerRuntime(appSettings: ArmObj<{ [key: string]: string }>): boolean {
    const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);
    return !!workerRuntime && CommonConstants.WorkerRuntimeLanguages[workerRuntime] === CommonConstants.WorkerRuntimeLanguages.java;
  }
}
