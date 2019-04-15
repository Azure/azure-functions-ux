import SiteService from '../../../ApiHelpers/SiteService';
import StorageService from '../../../ApiHelpers/StorageService';
import { ArmObj, Site, SiteConfig, SlotConfigNames, ArmAzureStorageMount } from '../../../models/WebAppModels';
import RbacHelper from '../../../utils/rbac-helper';

export const fetchApplicationSettingValues = async (resourceId: string) => {
  const [
    webConfig,
    site,
    metadata,
    slotConfigNames,
    connectionStrings,
    applicationSettings,
    storageAccounts,
    azureStorageMounts,
    windowsStacks,
    linuxStacks,
  ] = await Promise.all([
    SiteService.fetchWebConfig(resourceId),
    SiteService.fetchSite(resourceId),
    SiteService.fetchMetadata(resourceId),
    SiteService.fetchSlotConfigNames(resourceId),
    SiteService.fetchConnectionStrings(resourceId),
    SiteService.fetchApplicationSettings(resourceId),
    StorageService.fetchAzureStorageAccounts(resourceId),
    SiteService.fetchAzureStorageMounts(resourceId),
    SiteService.fetchStacks('Windows'),
    SiteService.fetchStacks('Linux'),
  ]);
  return {
    webConfig,
    site,
    metadata,
    slotConfigNames,
    connectionStrings,
    applicationSettings,
    storageAccounts,
    azureStorageMounts,
    windowsStacks,
    linuxStacks,
  };
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

export const getProductionAppWritePermissions = async (resourceId: string) => {
  const productionResourceId = SiteService.getProductionId(resourceId);
  const [hasRbacPermission, hasReadonlyLock] = await Promise.all([
    RbacHelper.hasPermission(productionResourceId, [RbacHelper.writeScope]),
    RbacHelper.hasReadOnlyLock(productionResourceId),
  ]);

  return hasRbacPermission && !hasReadonlyLock;
};
