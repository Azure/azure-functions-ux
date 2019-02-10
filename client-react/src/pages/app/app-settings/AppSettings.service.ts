import MakeArmCall from '../../../ArmHelper';
import { ArmResourceDescriptor } from '../../../utils/resourceDescriptors';
import { StorageAccount, ArmArray, ArmObj, Site, SiteConfig, SlotConfigNames, ArmAzureStorageMount } from '../../../models/WebAppModels';
import { AvailableStack } from '../../../models/available-stacks';

const getProductionId = (resourceId: string) => resourceId.split('/slots/')[0];

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
    fetchWebConfig(resourceId),
    fetchSite(resourceId),
    fetchMetadata(resourceId),
    fetchSlotConfigNames(resourceId),
    fetchConnectionStrings(resourceId),
    fetchApplicationSettings(resourceId),
    fetchAzureStorageAccounts(resourceId),
    fetchAzureStorageMounts(resourceId),
    fetchStacks('Windows'),
    fetchStacks('Linux'),
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

export const fetchSite = (resourceId: string) => {
  return MakeArmCall<ArmObj<Site>>({ resourceId, commandName: 'fetchSite' });
};

export const updateSite = (resourceId: string, site: ArmObj<Site>) => {
  return MakeArmCall<ArmObj<Site>>({ resourceId, commandName: 'updateSite', method: 'PUT', body: site });
};

export const fetchWebConfig = (resourceId: string) => {
  const id = `${resourceId}/config/web`;
  return MakeArmCall<ArmObj<SiteConfig>>({ resourceId: id, commandName: 'fetchConfig' });
};

export const updateWebConfig = (resourceId: string, siteConfig: ArmObj<SiteConfig>) => {
  const id = `${resourceId}/config/web`;
  return MakeArmCall<ArmObj<SiteConfig>>({ resourceId: id, commandName: 'updateWebConfig', method: 'PUT', body: siteConfig });
};

export const fetchConnectionStrings = (resourceId: string) => {
  const id = `${resourceId}/config/connectionStrings/list`;
  return MakeArmCall<ArmObj<{ [key: string]: { type: string; value: string } }>>({
    resourceId: id,
    commandName: 'fetchConnectionStrings',
    method: 'POST',
  });
};

export const fetchApplicationSettings = (resourceId: string) => {
  const id = `${resourceId}/config/appsettings/list`;
  return MakeArmCall<ArmObj<{ [key: string]: string }>>({ resourceId: id, commandName: 'fetchApplicationSettings', method: 'POST' });
};

export const fetchMetadata = (resourceId: string) => {
  const id = `${resourceId}/config/metadata/list`;
  return MakeArmCall<ArmObj<{ [key: string]: string }>>({ resourceId: id, commandName: 'fetchMetadata', method: 'POST' });
};

export const fetchSlotConfigNames = (resourceId: string) => {
  const id = `${getProductionId(resourceId)}/config/slotconfignames`;
  return MakeArmCall<ArmObj<SlotConfigNames>>({ resourceId: id, commandName: 'fetchSlotConfigNames' });
};

export const updateSlotConfigNames = (resourceId: string, slotConfigNames: ArmObj<SlotConfigNames>) => {
  const id = `${getProductionId(resourceId)}/config/slotconfignames`;
  return MakeArmCall<ArmObj<SlotConfigNames>>({ resourceId: id, commandName: 'updateWebConfig', method: 'PUT', body: slotConfigNames });
};
export const fetchAzureStorageAccounts = (resourceId: string) => {
  const { subscription } = new ArmResourceDescriptor(resourceId);
  const id = `/subscriptions/${subscription}/providers/Microsoft.Storage/storageAccounts`;
  return MakeArmCall<ArmArray<StorageAccount>>({ resourceId: id, commandName: 'fetchStorageAccounts' });
};

export const fetchAzureStorageMounts = (resourceId: string) => {
  const id = `${resourceId}/config/azureStorageAccounts/list`;
  return MakeArmCall<ArmObj<ArmAzureStorageMount>>({ resourceId: id, commandName: 'fetchAzureStorageMount', method: 'POST' });
};

export const fetchStacks = (stacksOs: 'Linux' | 'Windows') => {
  const queryString = `?osTypeSelected=${stacksOs}`;
  const resourceId = `/providers/Microsoft.Web/availableStacks`;
  return MakeArmCall<ArmArray<AvailableStack>>({
    resourceId,
    queryString,
    commandName: 'fetchAvailableStacks',
  });
};

export const fetchReadonly = (resourceId: string) => {
  return true;
};
export const fetchSlots = (resourceId: string) => {
  const id = `${getProductionId(resourceId)}/slots`;
  return MakeArmCall<ArmArray<Site>>({ resourceId: id, commandName: 'fetchSlots' });
};
