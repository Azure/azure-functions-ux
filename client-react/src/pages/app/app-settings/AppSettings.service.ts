import SiteService from '../../../ApiHelpers/SiteService';
import StorageService from '../../../ApiHelpers/StorageService';
import RbacConstants from '../../../utils/rbac-constants';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { SiteConfig, KeyVaultReference } from '../../../models/site/config';
import { SlotConfigNames } from '../../../models/site/slot-config-names';
import MakeArmCall from '../../../ApiHelpers/ArmHelper';
import { HttpResponseObject } from '../../../ArmHelper.types';
import PortalCommunicator from '../../../portal-communicator';
import FunctionsService from '../../../ApiHelpers/FunctionsService';

export const fetchApplicationSettingValues = async (resourceId: string) => {
  const [webConfig, metadata, slotConfigNames, connectionStrings, applicationSettings, azureStorageMounts] = await Promise.all([
    SiteService.fetchWebConfig(resourceId),
    SiteService.fetchMetadata(resourceId),
    SiteService.fetchSlotConfigNames(resourceId),
    SiteService.fetchConnectionStrings(resourceId),
    SiteService.fetchApplicationSettings(resourceId),
    SiteService.fetchAzureStorageMounts(resourceId),
  ]);

  return {
    webConfig,
    metadata,
    slotConfigNames,
    connectionStrings,
    applicationSettings,
    azureStorageMounts,
  };
};

export const fetchFunctionsHostStatus = async (resourceId: string, force?: boolean) => {
  return SiteService.fetchFunctionsHostStatus(resourceId, force);
};

export const getFunctions = async (resourceId: string, force?: boolean) => {
  return FunctionsService.getFunctions(resourceId, force);
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
  return MakeArmCall<ArmObj<{ [keyToReferenceStatuses: string]: { [key: string]: KeyVaultReference } }>>({
    resourceId: id,
    commandName: 'getApplicationSettingReference',
    method: 'GET',
  });
};

export const getConnectionStringReference = async (
  resourceId: string,
  connectionstringName: string
): Promise<HttpResponseObject<ArmObj<KeyVaultReference>>> => {
  const id = `${resourceId}/config/configreferences/connectionstrings/${connectionstringName}`;
  return MakeArmCall<ArmObj<KeyVaultReference>>({
    resourceId: id,
    commandName: 'getConnectionStringReference',
    method: 'GET',
  });
};

export const getAllAppSettingReferences = async (resourceId: string) => {
  const id = `${resourceId}/config/configreferences/appsettings`;
  return MakeArmCall<ArmObj<{ [keyToReferenceStatuses: string]: { [key: string]: KeyVaultReference } }>>({
    resourceId: id,
    commandName: 'getAllAppSettingReferences',
    method: 'GET',
  });
};

export const getAllConnectionStringsReferences = async (resourceId: string) => {
  const id = `${resourceId}/config/configreferences/connectionstrings`;
  return MakeArmCall<ArmObj<{ [keyToReferenceStatuses: string]: { [key: string]: KeyVaultReference } }>>({
    resourceId: id,
    commandName: 'getAllConnectionStringsReferences',
    method: 'GET',
  });
};
