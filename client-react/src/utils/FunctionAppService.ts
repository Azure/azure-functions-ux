import { ArmObj } from '../models/arm-obj';
import { KeyValue } from '../models/portal-models';
import { Site } from '../models/site/site';
import { CommonConstants, WorkerRuntimeLanguages } from './CommonConstants';
import {
  isBasic,
  isIsolatedV2,
  isLinuxDynamic,
  isLinuxElastic,
  isPremium0V3,
  isPremiumMV3,
  isPremiumV2,
  isPremiumV3,
  isStandard,
} from './arm-utils';

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

  public static usingDotnetIsolatedRuntime(appSettings: ArmObj<KeyValue<string>>): boolean {
    const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);
    return !!workerRuntime && workerRuntime === WorkerRuntimeLanguages.dotnetIsolated;
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

  public static isEditingCheckNeededForLinuxPythonSku = (site: ArmObj<Site>) => {
    return (
      !!site &&
      (isLinuxDynamic(site) ||
        isLinuxElastic(site) ||
        isPremiumV2(site) ||
        isBasic(site) ||
        isIsolatedV2(site) ||
        isPremium0V3(site) ||
        isPremiumMV3(site) ||
        isPremiumV3(site) ||
        isStandard(site))
    );
  };

  public static isEditingCheckNeededForLinuxSku = (site: ArmObj<Site>, addPremiumV2Check: boolean = true) => {
    return !!site && (isLinuxDynamic(site) || isLinuxElastic(site) || (addPremiumV2Check && isPremiumV2(site)));
  };

  public static enableEditingForLinux(site: ArmObj<Site>, workerRuntime?: string) {
    if (!workerRuntime) {
      return false;
    } else if (workerRuntime === WorkerRuntimeLanguages.nodejs || workerRuntime === WorkerRuntimeLanguages.powershell) {
      return FunctionAppService.isEditingCheckNeededForLinuxSku(site);
    } else if (workerRuntime === WorkerRuntimeLanguages.python) {
      return FunctionAppService.isEditingCheckNeededForLinuxPythonSku(site);
    } else {
      return false;
    }
  }
}
