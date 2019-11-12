import SiteService from '../../../ApiHelpers/SiteService';
import StorageService from '../../../ApiHelpers/StorageService';
import RbacConstants from '../../../utils/rbac-constants';
import { ArmObj, ArmArray } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { SiteConfig, ArmAzureStorageMount, KeyVaultReference } from '../../../models/site/config';
import { SlotConfigNames } from '../../../models/site/slot-config-names';
import LogService from '../../../utils/LogService';
import MakeArmCall from '../../../ApiHelpers/ArmHelper';
import { HttpResponseObject } from '../../../ArmHelper.types';
import PortalCommunicator from '../../../portal-communicator';
import FunctionsService from '../../../ApiHelpers/FunctionsService';
import { HostStatus } from '../../../models/functions/host-status';
import { FunctionInfo } from '../../../models/functions/function-info';

export const fetchApplicationSettingValues = async (resourceId: string) => {
  const [
    webConfig,
    metadata,
    slotConfigNames,
    connectionStrings,
    applicationSettings,
    azureStorageMounts,
    windowsStacks,
    linuxStacks,
  ] = await Promise.all([
    SiteService.fetchWebConfig(resourceId),
    SiteService.fetchMetadata(resourceId),
    SiteService.fetchSlotConfigNames(resourceId),
    SiteService.fetchConnectionStrings(resourceId),
    SiteService.fetchApplicationSettings(resourceId),
    SiteService.fetchAzureStorageMounts(resourceId),
    SiteService.fetchStacks('Windows'),
    SiteService.fetchStacks('Linux'),
  ]);
  return {
    webConfig,
    metadata,
    slotConfigNames,
    connectionStrings,
    applicationSettings,
    azureStorageMounts,
    windowsStacks,
    linuxStacks,
  };
};

const delay = async (func: () => Promise<any>, ms: number = 0) => {
  const sleepPromise = new Promise(resolve => setTimeout(resolve, ms));
  return await sleepPromise.then(func);
};

export const fetchFunctionsHostStatus = async (resourceId: string, shouldRetry?: (hostStatus: ArmObj<HostStatus>) => boolean) => {
  let retries = 3;
  let result: HttpResponseObject<ArmObj<HostStatus>> = await SiteService.fetchFunctionsHostStatus(resourceId, true);

  while (retries) {
    if (result.metadata.status === 200 && (!shouldRetry || !shouldRetry(result.data))) {
      return result;
    }

    retries = retries - 1;

    result = await delay(() => SiteService.fetchFunctionsHostStatus(resourceId, true));
  }

  return result;
};

export const getFunctions = async (resourceId: string) => {
  let retries = 3;
  let result: HttpResponseObject<ArmArray<FunctionInfo>> = await FunctionsService.getFunctions(resourceId, true);

  while (retries) {
    if (result.metadata.status === 200) {
      return result;
    }

    retries = retries - 1;

    result = await FunctionsService.getFunctions(resourceId, true);
  }

  return result;
};

export const fetchAzureStorageAccounts = (resourceId: string) => {
  return StorageService.fetchAzureStorageAccounts(resourceId);
};

export const fetchSlots = (resourceId: string) => {
  return SiteService.fetchSlots(resourceId);
};

export const updateSite = (resourceId: string, site: ArmObj<Site>) => {
  return SiteService.updateSite(resourceId, site);
};

export const updateWebConfig = (resourceId: string, siteConfig: ArmObj<SiteConfig>) => {
  return SiteService.updateWebConfig(resourceId, siteConfig);
};

export const updateStorageMounts = (resourceId: string, storageAccountMounts: ArmObj<ArmAzureStorageMount>) => {
  return SiteService.updateStorageMounts(resourceId, storageAccountMounts);
};
export const updateSlotConfigNames = (resourceId: string, slotConfigNames: ArmObj<SlotConfigNames>) => {
  return SiteService.updateSlotConfigNames(resourceId, slotConfigNames);
};

export const getProductionAppWritePermissions = async (portalContext: PortalCommunicator, resourceId: string) => {
  const productionResourceId = SiteService.getProductionId(resourceId);
  const [hasRbacPermission, hasReadonlyLock] = await Promise.all([
    portalContext.hasPermission(productionResourceId, [RbacConstants.writeScope]),
    portalContext.hasLock(productionResourceId, 'ReadOnly'),
  ]);

  return hasRbacPermission && !hasReadonlyLock;
};

export const getApplicationSettingReference = async (
  resourceId: string,
  appSettingName: string
): Promise<HttpResponseObject<ArmObj<{ [keyToReferenceStatuses: string]: { [key: string]: KeyVaultReference } }>>> => {
  const id = `${resourceId}/config/configreferences/appsettings/${appSettingName}`;
  const result = await MakeArmCall<ArmObj<{ [keyToReferenceStatuses: string]: { [key: string]: KeyVaultReference } }>>({
    resourceId: id,
    commandName: 'getApplicationSettingReference',
    method: 'GET',
  });
  LogService.trackEvent('site-service', 'getApplicationSettingReference', {
    success: result.metadata.success,
    resultCount: result.data && Object.keys(result.data.properties).length,
  });
  return result;
};

export const getAllAppSettingReferences = async (resourceId: string) => {
  const id = `${resourceId}/config/configreferences/appsettings`;
  const result = await MakeArmCall<ArmObj<{ [keyToReferenceStatuses: string]: { [key: string]: KeyVaultReference } }>>({
    resourceId: id,
    commandName: 'getAllAppSettingReferences',
    method: 'GET',
  });
  LogService.trackEvent('site-service', 'getAllAppSettingReferences', {
    success: result.metadata.success,
    resultCount: result.data && Object.keys(result.data.properties).length,
  });
  return result;
};
