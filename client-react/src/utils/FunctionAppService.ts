import { ArmObj } from '../models/arm-obj';
import { CommonConstants, WorkerRuntimeLanguages } from './CommonConstants';
import { KeyValue } from '../models/portal-models';
import { Site } from '../models/site/site';
import { isLinuxDynamic, isLinuxElastic, isPremiumV2 } from './arm-utils';

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

  public static getWorkerRuntimeSetting(appSettings?: ArmObj<KeyValue<string>>): string {
    return (!!appSettings && appSettings.properties[CommonConstants.AppSettingNames.functionsWorkerRuntime]) || '';
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

  public static usingPowershellWorkerRuntime(appSettings: ArmObj<KeyValue<string>>): boolean {
    const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);
    return !!workerRuntime && workerRuntime === WorkerRuntimeLanguages.powershell;
  }

  public static getAzureFilesSetting(appSettings: ArmObj<KeyValue<string>>): string {
    return appSettings.properties[CommonConstants.AppSettingNames.azureFilesSettingName] || '';
  }

  public static getAzureWebJobsStorageSetting(appSettings: ArmObj<KeyValue<string>>): string {
    return (
      appSettings.properties[CommonConstants.AppSettingNames.azureWebJobsSecretStorageType] ||
      appSettings.properties[CommonConstants.AppSettingNames.azureWebJobsStorage] ||
      ''
    );
  }

  public static isEditingCheckNeededForLinuxSku = (
    site: ArmObj<Site>,
    isLinuxSkuFlightingEnabled: boolean,
    addPremiumV2Check: boolean = true
  ) => {
    return (
      !!site && isLinuxSkuFlightingEnabled && (isLinuxDynamic(site) || isLinuxElastic(site) || (addPremiumV2Check && isPremiumV2(site)))
    );
  };

  public static enableEditingForLinux(site: ArmObj<Site>, isLinuxSkuFlightingEnabled: boolean, workerRuntime?: string) {
    // NOTE (krmitta): Editing is only enabled for Linux Consumption or Linux Elastic Premium and Node/Python stack only.
    // For Powershell, we still need to use the feature-flag.
    return (
      !!workerRuntime &&
      FunctionAppService.isEditingCheckNeededForLinuxSku(site, isLinuxSkuFlightingEnabled) &&
      (workerRuntime === WorkerRuntimeLanguages.nodejs ||
        workerRuntime === WorkerRuntimeLanguages.python ||
        workerRuntime === WorkerRuntimeLanguages.powershell)
    );
  }
}
