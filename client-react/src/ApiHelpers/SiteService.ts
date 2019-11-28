import MakeArmCall from './ArmHelper';
import { AvailableStack } from '../models/available-stacks';
import { CommonConstants } from '../utils/CommonConstants';
import LogService from '../utils/LogService';
import { ArmObj, ArmArray } from '../models/arm-obj';
import { Site } from '../models/site/site';
import { SiteConfig, ArmAzureStorageMount } from '../models/site/config';
import { SlotConfigNames } from '../models/site/slot-config-names';
import { SiteLogsConfig } from '../models/site/logs-config';
import { HostStatus } from '../models/functions/host-status';

export default class SiteService {
  public static getProductionId = (resourceId: string) => resourceId.split('/slots/')[0];

  public static fetchSite = (resourceId: string) => {
    return MakeArmCall<ArmObj<Site>>({ resourceId, commandName: 'fetchSite' });
  };

  public static updateSite = (resourceId: string, site: ArmObj<Site>) => {
    const { identity, ...rest } = site;
    return MakeArmCall<ArmObj<Site>>({ resourceId, commandName: 'updateSite', method: 'PUT', body: rest });
  };

  public static fetchWebConfig = (resourceId: string) => {
    const id = `${resourceId}/config/web`;
    return MakeArmCall<ArmObj<SiteConfig>>({
      resourceId: id,
      commandName: 'fetchConfig',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
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
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });
  };

  public static fetchConnectionStrings = async (resourceId: string) => {
    const id = `${resourceId}/config/connectionStrings/list`;
    const result = await MakeArmCall<ArmObj<{ [key: string]: { type: string; value: string } }>>({
      resourceId: id,
      commandName: 'fetchConnectionStrings',
      method: 'POST',
    });
    LogService.trackEvent('site-service', 'connectionStringsLoaded', {
      success: result.metadata.success,
      resultCount: result.data && Object.keys(result.data.properties).length,
    });
    return result;
  };

  public static fetchApplicationSettings = async (resourceId: string) => {
    const id = `${resourceId}/config/appsettings/list`;
    const result = await MakeArmCall<ArmObj<{ [key: string]: string }>>({
      resourceId: id,
      commandName: 'fetchApplicationSettings',
      method: 'POST',
    });
    LogService.trackEvent('site-service', 'appSettingsLoaded', {
      success: result.metadata.success,
      resultCount: result.data && Object.keys(result.data.properties).length,
    });
    return result;
  };

  public static updateApplicationSettings = async (resourceId: string, appSettings: ArmObj<{ [key: string]: string }>) => {
    const id = `${resourceId}/config/appsettings`;
    const result = await MakeArmCall<ArmObj<{ [key: string]: string }>>({
      resourceId: id,
      commandName: 'updateApplicationSettings',
      method: 'PUT',
      body: appSettings,
    });
    LogService.trackEvent('site-service', 'appSettingsUpdated', {
      success: result.metadata.success,
      resultCount: result.data && Object.keys(result.data.properties).length,
    });
    return result;
  };

  public static fetchMetadata = async (resourceId: string) => {
    const id = `${resourceId}/config/metadata/list`;
    const result = await MakeArmCall<ArmObj<{ [key: string]: string }>>({ resourceId: id, commandName: 'fetchMetadata', method: 'POST' });
    LogService.trackEvent('site-service', 'metadataLoaded', {
      success: result.metadata.success,
      resultCount: result.data && Object.keys(result.data.properties).length,
    });
    return result;
  };

  public static fetchSlotConfigNames = (resourceId: string) => {
    const id = `${SiteService.getProductionId(resourceId)}/config/slotconfignames`;
    return MakeArmCall<ArmObj<SlotConfigNames>>({ resourceId: id, commandName: 'fetchSlotConfigNames' });
  };

  public static updateSlotConfigNames = (resourceId: string, slotConfigNames: ArmObj<SlotConfigNames>) => {
    const id = `${SiteService.getProductionId(resourceId)}/config/slotconfignames`;
    return MakeArmCall<ArmObj<SlotConfigNames>>({
      resourceId: id,
      commandName: 'updateSlotConfigNames',
      method: 'PUT',
      body: slotConfigNames,
    });
  };

  public static fetchAzureStorageMounts = (resourceId: string) => {
    const id = `${resourceId}/config/azureStorageAccounts/list`;
    return MakeArmCall<ArmObj<ArmAzureStorageMount>>({ resourceId: id, commandName: 'fetchAzureStorageMount', method: 'POST' });
  };

  public static updateStorageMounts = (resourceId: string, storageAccountMounts: ArmObj<ArmAzureStorageMount>) => {
    const id = `${resourceId}/config/azureStorageAccounts`;
    return MakeArmCall<ArmObj<ArmAzureStorageMount>>({
      resourceId: id,
      commandName: 'updateAzureStorageMount',
      method: 'PUT',
      body: storageAccountMounts,
    });
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
    const id = `${resourceId}/config/logs`;
    return MakeArmCall<ArmObj<SiteLogsConfig>>({ resourceId: id, commandName: 'fetchLogsConfig' });
  };

  public static fetchFunctionsHostStatus = async (resourceId: string, force?: boolean) => {
    const id = `${resourceId}/host/default/properties/status`;
    return MakeArmCall<ArmObj<HostStatus>>({ resourceId: id, commandName: 'getHostStatus', skipBuffer: force });
  };
}
