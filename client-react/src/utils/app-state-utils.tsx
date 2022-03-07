import { getErrorMessageOrStringify } from '../ApiHelpers/ArmHelper';
import FunctionsService from '../ApiHelpers/FunctionsService';
import SiteService from '../ApiHelpers/SiteService';
import { AppSettings } from '../models/app-setting';
import { ArmArray, ArmObj } from '../models/arm-obj';
import { HostStatus, FunctionAppContentEditingState } from '../models/functions/host-status';
import { FunctionAppEditMode, SiteReadWriteState } from '../models/portal-models';
import { SiteConfig } from '../models/site/config';
import { Site } from '../models/site/site';
import PortalCommunicator from '../portal-communicator';
import { isContainerApp, isElastic, isFunctionApp, isKubeApp, isLinuxApp, isLinuxDynamic } from './arm-utils';
import { CommonConstants, ExperimentationConstants } from './CommonConstants';
import FunctionAppService from './FunctionAppService';
import LogService from './LogService';
import RbacConstants from './rbac-constants';
import { ArmSiteDescriptor } from './resourceDescriptors';
import SiteHelper from './SiteHelper';

export async function resolveState(
  portalContext: PortalCommunicator,
  resourceId: string,
  logCategory: string,
  site: ArmObj<Site>,
  appSettings?: ArmObj<AppSettings>
) {
  const readOnlyLock = await portalContext.hasLock(resourceId, 'ReadOnly');
  if (readOnlyLock) {
    return FunctionAppEditMode.ReadOnlyLock;
  }

  const writePermission = await portalContext.hasPermission(resourceId, [RbacConstants.writeScope]);
  if (!writePermission) {
    return FunctionAppEditMode.ReadOnlyRbac;
  }

  const isLinuxSkuFlightingEnabled = await portalContext.hasFlightEnabled(ExperimentationConstants.TreatmentFlight.linuxPortalEditing);

  // NOTE (krmitta): We only want to get the edit state from other scenarios for function-apps
  if (isFunctionApp(site)) {
    return await resolveStateForFunctionApp(resourceId, isLinuxSkuFlightingEnabled, logCategory, site, appSettings);
  }

  return FunctionAppEditMode.ReadWrite;
}

async function resolveStateForFunctionApp(
  resourceId: string,
  isLinuxSkuFlightingEnabled: boolean,
  logCategory: string,
  site: ArmObj<Site>,
  appSettings?: ArmObj<AppSettings>
) {
  let state = resolveStateFromSite(site, isLinuxSkuFlightingEnabled, appSettings);
  // NOTE(krmitta): State is only returned if it is defined otherwise we move to the next check
  if (state) {
    return state;
  }

  if (appSettings) {
    state = resolveStateFromAppSetting(appSettings, site, isLinuxSkuFlightingEnabled);
    if (state) {
      return state;
    }
  }

  state = await fetchAndResolveStateFromConfig(resourceId, logCategory);
  if (state) {
    return state;
  }

  state = await fetchAndResolveStateFromSlots(resourceId, logCategory);
  if (state) {
    return state;
  }

  // NOTE(krmitta): Host status API check is currently behind feature-flag and only for Linux apps
  if (FunctionAppService.isEditingCheckNeededForLinuxSku(site, isLinuxSkuFlightingEnabled)) {
    state = await fetchAndResolveStateFromHostStatus(resourceId, logCategory);
    if (state) {
      return state;
    }
  }

  return FunctionAppEditMode.ReadWrite;
}

function resolveStateFromSite(site: ArmObj<Site>, isLinuxSkuFlightingEnabled: boolean, appSettings?: ArmObj<AppSettings>) {
  const workerRuntime = FunctionAppService.getWorkerRuntimeSetting(appSettings);

  if (isLinuxDynamic(site) && !FunctionAppService.enableEditingForLinux(site, isLinuxSkuFlightingEnabled, workerRuntime)) {
    return FunctionAppEditMode.ReadOnlyLinuxDynamic;
  }

  if (isContainerApp(site)) {
    return FunctionAppEditMode.ReadOnlyBYOC;
  }

  if (isLinuxApp(site) && isElastic(site) && !FunctionAppService.enableEditingForLinux(site, isLinuxSkuFlightingEnabled, workerRuntime)) {
    return FunctionAppEditMode.ReadOnlyLinuxCodeElastic;
  }

  return undefined;
}

function resolveStateFromAppSetting(appSettings: ArmObj<AppSettings>, site: ArmObj<Site>, isLinuxSkuFlightingEnabled: boolean) {
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

  if (
    FunctionAppService.usingPythonWorkerRuntime(appSettings) &&
    !FunctionAppService.enableEditingForLinux(site, isLinuxSkuFlightingEnabled, workerRuntime)
  ) {
    return FunctionAppEditMode.ReadOnlyPython;
  }

  if (FunctionAppService.usingJavaWorkerRuntime(appSettings)) {
    return FunctionAppEditMode.ReadOnlyJava;
  }

  if (isLinuxAppEditingDisabledForAzureFiles(site, appSettings, isLinuxSkuFlightingEnabled)) {
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

async function fetchAndResolveStateFromHostStatus(resourceId: string, logCategory: string): Promise<FunctionAppEditMode | undefined> {
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

async function fetchAndResolveStateFromConfig(resourceId: string, logCategory: string): Promise<FunctionAppEditMode | undefined> {
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

async function fetchAndResolveStateFromSlots(resourceId: string, logCategory: string): Promise<FunctionAppEditMode | undefined> {
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
  isLinuxSkuFlightingEnabled: boolean
): boolean => {
  // NOTE(krmitta):AzureFiles check is currently behind feature-flag and only for Linux apps
  return (
    FunctionAppService.isEditingCheckNeededForLinuxSku(site, isLinuxSkuFlightingEnabled, false) &&
    !FunctionAppService.getAzureFilesSetting(appSettings)
  );
};
