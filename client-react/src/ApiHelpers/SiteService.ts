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
import { KeyValue } from '../models/portal-models';
import { PublishingCredentials } from '../models/site/publish';
import { DeploymentProperties, DeploymentLogsItem, SourceControlProperties } from '../pages/app/deployment-center/DeploymentCenter.types';

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

  public static fetchApplicationSettings = async (resourceId: string, force?: boolean) => {
    const id = `${resourceId}/config/appsettings/list`;
    const result = await MakeArmCall<ArmObj<KeyValue<string>>>({
      resourceId: id,
      commandName: 'fetchApplicationSettings',
      method: 'POST',
      skipBatching: force,
    });
    LogService.trackEvent('site-service', 'appSettingsLoaded', {
      success: result.metadata.success,
      resultCount: result.data && Object.keys(result.data.properties).length,
    });
    return result;
  };

  public static getSiteDeployments = async (resourceId: string, force?: boolean) => {
    return MakeArmCall<ArmArray<DeploymentProperties>>({
      resourceId: `${resourceId}/deployments`,
      commandName: 'fetchDeployments',
      method: 'GET',
      skipBatching: force,
    });
  };

  public static getDeploymentLogs = async (deploymentId: string) => {
    return MakeArmCall<ArmArray<DeploymentLogsItem>>({
      resourceId: `${deploymentId}/log`,
      commandName: 'fetchDeploymentLogs',
      method: 'GET',
    });
  };

  public static getLogDetails = async (deploymentId: string, logId: string) => {
    return MakeArmCall<ArmArray<DeploymentLogsItem>>({
      resourceId: `${deploymentId}/log/${logId}`,
      commandName: 'fetchLogDetails',
      method: 'GET',
    });
  };

  public static getSourceControlDetails = async (resourceId: string) => {
    return MakeArmCall<ArmObj<SourceControlProperties>>({
      resourceId: `${resourceId}/sourcecontrols/web`,
      commandName: 'fetchSourceControl',
      method: 'GET',
    });
  };

  public static deleteSourceControlDetails = async (resourceId: string) => {
    return MakeArmCall<{}>({
      resourceId: `${resourceId}/sourcecontrols/web`,
      commandName: 'deleteSourceControl',
      method: 'DELETE',
    });
  };

  public static updateSourceControlDetails = (resourceId: string, body: any) => {
    return MakeArmCall<void>({
      method: 'PUT',
      resourceId: `${resourceId}/sourcecontrols/web`,
      body: body,
      commandName: 'updateDeployment',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });
  };

  public static updatePathSiteConfig = (resourceId: string, body: any) => {
    return MakeArmCall<void>({
      method: 'PATCH',
      resourceId: `${resourceId}/config/web`,
      body: body,
      commandName: 'updateDeploymentLocalGit',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });
  };

  public static updateApplicationSettings = async (resourceId: string, appSettings: ArmObj<KeyValue<string>>) => {
    const id = `${resourceId}/config/appsettings`;
    const result = await MakeArmCall<ArmObj<KeyValue<string>>>({
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
    const result = await MakeArmCall<ArmObj<KeyValue<string>>>({ resourceId: id, commandName: 'fetchMetadata', method: 'POST' });
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
    return MakeArmCall<ArmObj<HostStatus>>({ resourceId: id, commandName: 'getHostStatus', skipBatching: force });
  };

  public static fireSyncTrigger = (site: ArmObj<Site>, token: string) => {
    return MakeArmCall<any>({ resourceId: `${site.id}/host/default/sync`, commandName: 'syncTrigger', method: 'POST' });
  };

  public static getPublishProfile = (resourceId: string) => {
    const id = `${resourceId}/publishxml`;

    // NOTE(michinoy): Do not batch this call as it does not return application/json response.
    return MakeArmCall<string>({ method: 'POST', resourceId: id, commandName: 'getPublishProfile', skipBatching: true });
  };

  public static resetPublishProfile = (resourceId: string) => {
    const id = `${resourceId}/newpassword`;
    return MakeArmCall<void>({ method: 'POST', resourceId: id, commandName: 'resetPublishProfile' });
  };

  public static getPublishingCredentials = (resourceId: string) => {
    const id = `${resourceId}/config/publishingcredentials/list`;
    return MakeArmCall<ArmObj<PublishingCredentials>>({ method: 'POST', resourceId: id, commandName: 'getPublishingCredentials' });
  };
}
