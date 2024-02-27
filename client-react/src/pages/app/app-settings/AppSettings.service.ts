import SiteService from '../../../ApiHelpers/SiteService';
import StorageService from '../../../ApiHelpers/StorageService';
import RbacConstants from '../../../utils/rbac-constants';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { SiteConfig, Reference } from '../../../models/site/config';
import { SlotConfigNames } from '../../../models/site/slot-config-names';
import MakeArmCall, { MakePagedArmCall } from '../../../ApiHelpers/ArmHelper';
import { HttpResponseObject } from '../../../ArmHelper.types';
import PortalCommunicator from '../../../portal-communicator';
import FunctionsService from '../../../ApiHelpers/FunctionsService';
import { CommonConstants } from '../../../utils/CommonConstants';

export const fetchApplicationSettingValues = async (resourceId: string) => {
  const [webConfig, metadata, slotConfigNames, connectionStrings, applicationSettings] = await Promise.all([
    SiteService.fetchWebConfig(resourceId),
    SiteService.fetchMetadata(resourceId),
    SiteService.fetchSlotConfigNames(resourceId),
    SiteService.fetchConnectionStrings(resourceId),
    SiteService.fetchApplicationSettings(resourceId),
  ]);

  return {
    webConfig,
    metadata,
    slotConfigNames,
    connectionStrings,
    applicationSettings,
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

export const updateSite = (resourceId: string, site: ArmObj<Site>, configSettingsToIgnore?: string[], usePatch?: boolean) => {
  return SiteService.updateSite(resourceId, site, configSettingsToIgnore, usePatch);
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
  appSettingName: string,
  apiVersion = CommonConstants.ApiVersions.antaresApiVersion20220301
): Promise<HttpResponseObject<ArmObj<{ [keyToReferenceStatuses: string]: { [key: string]: Reference } }>>> => {
  const id = `${resourceId}/config/configreferences/appsettings/${appSettingName}`;
  return MakeArmCall<ArmObj<Record<string, Record<string, Reference>>>>({
    resourceId: id,
    commandName: 'getApplicationSettingReference',
    method: 'GET',
    apiVersion,
  });
};

export const getConnectionStringReference = async (
  resourceId: string,
  connectionstringName: string,
  apiVersion = CommonConstants.ApiVersions.antaresApiVersion20220301
): Promise<HttpResponseObject<ArmObj<Reference>>> => {
  const id = `${resourceId}/config/configreferences/connectionstrings/${connectionstringName}`;
  return MakeArmCall<ArmObj<Reference>>({
    resourceId: id,
    commandName: 'getConnectionStringReference',
    method: 'GET',
    apiVersion,
  });
};

export const getAllAppSettingReferences = async (
  resourceId: string,
  apiVersion = CommonConstants.ApiVersions.antaresApiVersion20220301
) => {
  const id = `${resourceId}/config/configreferences/appsettings`;
  return MakePagedArmCall<Reference>({
    resourceId: id,
    commandName: 'getAllAppSettingReferences',
    method: 'GET',
    apiVersion,
  });
};

export const getAllConnectionStringsReferences = async (
  resourceId: string,
  apiVersion = CommonConstants.ApiVersions.antaresApiVersion20220301
) => {
  const id = `${resourceId}/config/configreferences/connectionstrings`;
  return MakePagedArmCall<Reference>({
    resourceId: id,
    commandName: 'getAllConnectionStringsReferences',
    method: 'GET',
    apiVersion,
  });
};

export const getCustomErrorPagesForSite = async (resourceId: string) => {
  return SiteService.GetCustomErrorPagesForSite(resourceId);
};

export const getCustomErrorPageForSite = async (resourceId: string, errorCode: string) => {
  return SiteService.GetCustomErrorPageForSite(resourceId, errorCode);
};

export const addOrUpdateCustomErrorPageForSite = async (resourceId: string, errorCode: string, content: string) => {
  return SiteService.AddOrUpdateCustomErrorPageForSite(resourceId, errorCode, content);
};

export const deleteCustomErrorPageForSite = async (resourceId: string, errorCode: string) => {
  return SiteService.DeleteCustomErrorPageForSite(resourceId, errorCode);
};
