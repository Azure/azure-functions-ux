import MakeArmCall from './ArmHelper';
import { ArmObj, Site, SiteConfig, SlotConfigNames, ArmArray, ArmAzureStorageMount, SiteLogsConfig } from '../models/WebAppModels';
import { AvailableStack } from '../models/available-stacks';
import { CommonConstants } from '../utils/CommonConstants';

export default class SiteService {
  public static getProductionId = (resourceId: string) => resourceId.split('/slots/')[0];

  public static fetchSite = (resourceId: string) => {
    return MakeArmCall<ArmObj<Site>>({ resourceId, commandName: 'fetchSite' });
  };

  public static updateSite = (resourceId: string, site: ArmObj<Site>) => {
    return MakeArmCall<ArmObj<Site>>({ resourceId, commandName: 'updateSite', method: 'PUT', body: site });
  };

  public static fetchWebConfig = (resourceId: string) => {
    const id = `${resourceId}/config/web`;
    return MakeArmCall<ArmObj<SiteConfig>>({
      resourceId: id,
      commandName: 'fetchConfig',
      apiVersion: CommonConstants.ApiVersions.websiteApiVersion20181101,
    });
  };

  public static updateWebConfig = (resourceId: string, siteConfig: ArmObj<SiteConfig>) => {
    const id = `${resourceId}/config/web`;

    if (siteConfig.properties.azureStorageAccounts) {
      delete siteConfig.properties.azureStorageAccounts;
    }

    return MakeArmCall<ArmObj<SiteConfig>>({
      resourceId: id,
      commandName: 'updateWebConfig',
      method: 'PUT',
      body: siteConfig,
      apiVersion: CommonConstants.ApiVersions.websiteApiVersion20181101,
    });
  };

  public static fetchConnectionStrings = (resourceId: string) => {
    const id = `${resourceId}/config/connectionStrings/list`;
    return MakeArmCall<ArmObj<{ [key: string]: { type: string; value: string } }>>({
      resourceId: id,
      commandName: 'fetchConnectionStrings',
      method: 'POST',
    });
  };

  public static fetchApplicationSettings = (resourceId: string) => {
    const id = `${resourceId}/config/appsettings/list`;
    return MakeArmCall<ArmObj<{ [key: string]: string }>>({ resourceId: id, commandName: 'fetchApplicationSettings', method: 'POST' });
  };

  public static fetchMetadata = (resourceId: string) => {
    const id = `${resourceId}/config/metadata/list`;
    return MakeArmCall<ArmObj<{ [key: string]: string }>>({ resourceId: id, commandName: 'fetchMetadata', method: 'POST' });
  };

  public static fetchSlotConfigNames = (resourceId: string) => {
    const id = `${SiteService.getProductionId(resourceId)}/config/slotconfignames`;
    return MakeArmCall<ArmObj<SlotConfigNames>>({ resourceId: id, commandName: 'fetchSlotConfigNames' });
  };

  public static updateSlotConfigNames = (resourceId: string, slotConfigNames: ArmObj<SlotConfigNames>) => {
    const id = `${SiteService.getProductionId(resourceId)}/config/slotconfignames`;
    return MakeArmCall<ArmObj<SlotConfigNames>>({ resourceId: id, commandName: 'updateWebConfig', method: 'PUT', body: slotConfigNames });
  };

  public static fetchAzureStorageMounts = (resourceId: string) => {
    const id = `${resourceId}/config/azureStorageAccounts/list`;
    return MakeArmCall<ArmObj<ArmAzureStorageMount>>({ resourceId: id, commandName: 'fetchAzureStorageMount', method: 'POST' });
  };

  public static fetchStacks = (stacksOs: 'Linux' | 'Windows') => {
    const queryString = `?osTypeSelected=${stacksOs}`;
    const resourceId = `/providers/Microsoft.Web/availableStacks`;
    return MakeArmCall<ArmArray<AvailableStack>>({
      resourceId,
      queryString,
      commandName: 'fetchAvailableStacks',
    });
  };

  public static fetchSlots = (resourceId: string) => {
    const id = `${SiteService.getProductionId(resourceId)}/slots`;
    return MakeArmCall<ArmArray<Site>>({ resourceId: id, commandName: 'fetchSlots' });
  };

  public static fetchLogsConfig = (resourceId: string) => {
    const id = `${SiteService.getProductionId(resourceId)}/config/logs`;
    return MakeArmCall<ArmObj<SiteLogsConfig>>({ resourceId: id, commandName: 'fetchLogsConfig' });
  };
}
