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
import { AvailableStack } from '../../../models/available-stacks';
import { markEndOfLifeStacksInPlace } from '../../../utils/stacks-utils';
import { sortBy } from 'lodash-es';
import Url from '../../../utils/url';
import { CommonConstants } from '../../../utils/CommonConstants';
import RuntimeStackService from '../../../ApiHelpers/RuntimeStackService';

const insertDotNetCore31ForLinuxInPlace = (linuxStacks: HttpResponseObject<ArmArray<AvailableStack>>) => {
  const dotNetCore31Static = {
    displayVersion: '3.1',
    runtimeVersion: 'DOTNETCORE|3.1',
    isDefault: false,
    applicationInsights: false,
    minorVersions: [
      {
        displayVersion: '3.1.0',
        runtimeVersion: 'DOTNETCORE|3.1',
        isDefault: false,
        isRemoteDebuggingEnabled: false,
      },
    ],
  };

  if (!!linuxStacks && !!linuxStacks.metadata.success && !!linuxStacks.data && !!linuxStacks.data.value) {
    const dotNetCoreStack = linuxStacks.data.value.find(s => !!s.name && s.name.toLocaleLowerCase() === 'dotnetcore');
    const dotNetCoreMajorVersions = !!dotNetCoreStack && !!dotNetCoreStack.properties && dotNetCoreStack.properties.majorVersions;
    if (!!dotNetCoreMajorVersions) {
      const dotNetCore31 = dotNetCoreMajorVersions.find(
        v => !!v.runtimeVersion && v.runtimeVersion.toLocaleUpperCase() === 'DOTNETCORE|3.1'
      );
      if (!dotNetCore31) {
        const dotNetCoreMajorVersionsUpdated = sortBy([...dotNetCoreMajorVersions, dotNetCore31Static], o =>
          o.displayVersion.toLocaleLowerCase()
        );
        dotNetCoreStack!.properties.majorVersions = dotNetCoreMajorVersionsUpdated;
      }
    }
  }
};

const markEndOfLifeInPlace = (stacksResponse: HttpResponseObject<ArmArray<AvailableStack>>) => {
  const stacksArray = !!stacksResponse && !!stacksResponse.metadata.success && !!stacksResponse.data && stacksResponse.data.value;
  markEndOfLifeStacksInPlace(stacksArray || []);
};

export const fetchApplicationSettingValues = async (resourceId: string) => {
  const [windowsStacksPromise, linuxStacksPromise] =
    Url.getFeatureValue(CommonConstants.FeatureFlags.UseNewStacksApi) === 'true'
      ? [RuntimeStackService.getWebAppConfigurationStacks('windows'), RuntimeStackService.getWebAppConfigurationStacks('linux')]
      : [SiteService.fetchStacks('Windows'), SiteService.fetchStacks('Linux')];

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
    windowsStacksPromise,
    linuxStacksPromise,
  ]);

  // TODO (andimarc): Remove this once the availableStacks API has been updated to include .NET Core 3.1. TASK: 5854457
  // This is a temporary fix because the response from the availableStacks API doesn't include .NET Core 3.1.
  // We only care about this for Linux apps because the .NET Core version isn't configurable for Windows apps.
  insertDotNetCore31ForLinuxInPlace(linuxStacks);

  // Mark stacks as EOL based on hard-coded logic, since they aren't marked as EOL in the payload returned by the availableStacks API
  markEndOfLifeInPlace(windowsStacks);
  markEndOfLifeInPlace(linuxStacks);

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
