import { getErrorMessageOrStringify } from '../ApiHelpers/ArmHelper';
import FunctionsService from '../ApiHelpers/FunctionsService';
import SiteService from '../ApiHelpers/SiteService';
import { AppSettings } from '../models/app-setting';
import { ArmArray, ArmObj } from '../models/arm-obj';
import { HostStatus, FunctionAppContentEditingState } from '../models/functions/host-status';
import { FunctionAppEditMode, SiteReadWriteState } from '../models/portal-models';
import { SiteConfig } from '../models/site/config';
import { Site } from '../models/site/site';
import { ISubscription } from '../models/subscription';
import { isContainerApp, isElastic, isFunctionApp, isKubeApp, isLinuxApp, isLinuxDynamic } from './arm-utils';
import { isDreamsparkSubscription, isFreeTrialSubscription } from './billing-utils';
import { CommonConstants } from './CommonConstants';
import FunctionAppService from './FunctionAppService';
import LogService from './LogService';
import { ArmSiteDescriptor } from './resourceDescriptors';
import SiteHelper from './SiteHelper';

export function resolveStateFromSite(site: ArmObj<Site>, appSettings?: ArmObj<AppSettings>) {
  const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);

  if (isLinuxDynamic(site) && !FunctionAppService.enableEditingForLinux(site, workerRuntime)) {
    return FunctionAppEditMode.ReadOnlyLinuxDynamic;
  }

  if (isContainerApp(site)) {
    return FunctionAppEditMode.ReadOnlyBYOC;
  }

  if (isLinuxApp(site) && isElastic(site) && !FunctionAppService.enableEditingForLinux(site, workerRuntime)) {
    return FunctionAppEditMode.ReadOnlyLinuxCodeElastic;
  }

  return undefined;
}

export function resolveStateFromAppSetting(appSettings: ArmObj<AppSettings>, site: ArmObj<Site>, subscription: ISubscription) {
  const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);

  if (isKubeApp(site)) {
    return FunctionAppEditMode.ReadOnlyArc;
  }

  if (FunctionAppService.usingCustomWorkerRuntime(appSettings)) {
    return FunctionAppEditMode.ReadOnlyCustom;
  }

  if (isFunctionApp(site) && FunctionAppService.usingDotnet5WorkerRuntime(appSettings)) {
    return FunctionAppEditMode.ReadOnlyDotnet5;
  }

  if (FunctionAppService.usingRunFromPackage(appSettings)) {
    return FunctionAppEditMode.ReadOnlyRunFromPackage;
  }

  if (FunctionAppService.usingLocalCache(appSettings)) {
    return FunctionAppEditMode.ReadOnlyLocalCache;
  }

  if (FunctionAppService.usingPythonWorkerRuntime(appSettings) && !FunctionAppService.enableEditingForLinux(site, workerRuntime)) {
    return FunctionAppEditMode.ReadOnlyPython;
  }

  if (FunctionAppService.usingJavaWorkerRuntime(appSettings)) {
    return FunctionAppEditMode.ReadOnlyJava;
  }

  if (isLinuxAppEditingDisabledForAzureFiles(site, appSettings, subscription)) {
    return FunctionAppEditMode.ReadOnlyAzureFiles;
  }

  const editModeString = appSettings.properties[CommonConstants.AppSettingNames.functionAppEditModeSettingName] || '';
  if (editModeString.toLowerCase() === SiteReadWriteState.readonly) {
    return FunctionAppEditMode.ReadOnly;
  }

  if (editModeString.toLowerCase() === SiteReadWriteState.readwrite) {
    return FunctionAppEditMode.ReadWrite;
  }

  return undefined;
}

export async function fetchAndResolveStateFromHostStatus(
  resourceId: string,
  logCategory: string
): Promise<FunctionAppEditMode | undefined> {
  const hostStatusResponse = await FunctionsService.getHostStatus(resourceId);

  if (hostStatusResponse.metadata.success) {
    return resolveStateFromHostStatus(hostStatusResponse.data);
  } else {
    LogService.error(
      logCategory,
      'getHostStatus',
      `Failed to get function host status: ${getErrorMessageOrStringify(hostStatusResponse.metadata.error)}`
    );
    return undefined;
  }
}

export async function fetchAndResolveStateFromConfig(resourceId: string, logCategory: string): Promise<FunctionAppEditMode | undefined> {
  const configResponse = await SiteService.fetchWebConfig(resourceId);

  if (configResponse.metadata.success) {
    return resolveStateFromConfig(configResponse.data);
  } else {
    LogService.error(
      logCategory,
      'fetchWebConfig',
      `Failed to get web config: ${getErrorMessageOrStringify(configResponse.metadata.error)}`
    );
    return undefined;
  }
}

export async function fetchAndResolveStateFromSlots(resourceId: string, logCategory: string): Promise<FunctionAppEditMode | undefined> {
  const armSiteDescriptor = new ArmSiteDescriptor(resourceId);

  if (armSiteDescriptor.slot) {
    return FunctionAppEditMode.ReadOnlySlots;
  }

  const slotsResponse = await SiteService.fetchSlots(resourceId);

  if (slotsResponse.metadata.success) {
    return resolveStateFromSlots(slotsResponse.data);
  } else {
    LogService.error(logCategory, 'getSlots', `Failed to get slots: ${getErrorMessageOrStringify(slotsResponse.metadata.error)}`);
    return undefined;
  }
}

const resolveStateFromSlots = (slots: ArmArray<Site>): FunctionAppEditMode | undefined => {
  if (slots.value.length > 0) {
    return FunctionAppEditMode.ReadOnlySlots;
  }

  return undefined;
};

const resolveStateFromConfig = (config: ArmObj<SiteConfig>): FunctionAppEditMode | undefined => {
  if (SiteHelper.isSourceControlEnabled(config)) {
    return FunctionAppEditMode.ReadOnlySourceControlled;
  }

  return undefined;
};

const resolveStateFromHostStatus = (hostStatus: ArmObj<HostStatus>): FunctionAppEditMode | undefined => {
  if (hostStatus.properties.functionAppContentEditingState === FunctionAppContentEditingState.NotAllowed) {
    return FunctionAppEditMode.ReadOnlyAzureFiles;
  }

  return undefined;
};

const isLinuxAppEditingDisabledForAzureFiles = (
  site: ArmObj<Site>,
  appSettings: ArmObj<AppSettings>,
  subscription: ISubscription
): boolean => {
  // NOTE(krmitta): Defaulting to true since we are explicitly checking the two cases of the app-setting below
  let azureFilesAppSettingAbsent = true;
  if (!!FunctionAppService.getAzureFilesSetting(appSettings)) {
    azureFilesAppSettingAbsent = false;
  } else {
    if (
      !!subscription &&
      (isDreamsparkSubscription(subscription) || isFreeTrialSubscription(subscription)) &&
      !!FunctionAppService.getAzureWebJobsStorageSetting(appSettings)
    ) {
      azureFilesAppSettingAbsent = false;
    }
  }
  return FunctionAppService.isEditingCheckNeededForLinuxSku(site) && azureFilesAppSettingAbsent;
};
