import MakeArmCall from './ArmHelper';
import { AvailableStack } from '../models/available-stacks';
import { CommonConstants } from '../utils/CommonConstants';
import LogService from '../utils/LogService';
import { ArmObj, ArmArray } from '../models/arm-obj';
import { Site, PublishingCredentialPolicies, CredentialPolicy } from '../models/site/site';
import { SiteConfig, ArmAzureStorageMount, ErrorPage } from '../models/site/config';
import { SlotConfigNames } from '../models/site/slot-config-names';
import { SiteLogsConfig } from '../models/site/logs-config';
import { HostStatus } from '../models/functions/host-status';
import { KeyValue } from '../models/portal-models';
import { PublishingCredentials } from '../models/site/publish';
import { DeploymentProperties, DeploymentLogsItem, SourceControlProperties } from '../pages/app/deployment-center/DeploymentCenter.types';

export default class SiteService {
  private static readonly _configSettingsToIgnore = ['ipSecurityRestrictions', 'scmIpSecurityRestrictions', 'azureStorageAccounts'];

  private static _removePropertiesFromSiteConfig = (siteConfig: Partial<SiteConfig>, settingsToIgnore: string[]) => {
    if (!!siteConfig && !!settingsToIgnore) {
      settingsToIgnore.forEach(settingToIgnore => {
        delete siteConfig[settingToIgnore];
      });
    }
  };

  public static getProductionId = (resourceId: string) => resourceId.split('/slots/')[0];

  public static fetchSite = (resourceId: string) => {
    return MakeArmCall<ArmObj<Site>>({ resourceId, commandName: 'fetchSite' });
  };

  public static updateSite = (
    resourceId: string,
    site: ArmObj<Site>,
    configSettingsToIgnore: string[] = SiteService._configSettingsToIgnore,
    usePatch?: boolean
  ) => {
    const rest: ArmObj<Site> = { ...site };
    delete rest.identity;

    const siteConfig = !!rest && !!rest.properties && rest.properties.siteConfig;
    SiteService._removePropertiesFromSiteConfig(siteConfig, configSettingsToIgnore);

    // Setting virtualNetworkSubnetId to undefined since we do a linked access check against the network RP for this property.
    // So if the user doesn't have permissions to that RP, then this call will fail.
    const virtualNetworkSubnetId = undefined;

    const payload = {
      ...rest,
      properties: {
        ...rest.properties,
        virtualNetworkSubnetId,
        siteConfig,
      },
    };

    return MakeArmCall<ArmObj<Site>>({
      resourceId,
      commandName: usePatch ? 'patchSite' : 'updateSite',
      method: usePatch ? 'PATCH' : 'PUT',
      body: payload,
    });
  };

  public static fetchWebConfig = (resourceId: string) => {
    const id = `${resourceId}/config/web`;
    return MakeArmCall<ArmObj<SiteConfig>>({
      resourceId: id,
      commandName: 'fetchConfig',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });
  };

  public static getSiteConfigSettingsToIgnore() {
    return SiteService._configSettingsToIgnore;
  }

  public static updateWebConfig = (
    resourceId: string,
    siteConfig: ArmObj<SiteConfig>,
    settingsToIgnore: string[] = SiteService._configSettingsToIgnore
  ) => {
    const payload = { ...siteConfig };
    SiteService._removePropertiesFromSiteConfig(siteConfig.properties, settingsToIgnore);

    const id = `${resourceId}/config/web`;

    return MakeArmCall<ArmObj<SiteConfig>>({
      resourceId: id,
      commandName: 'updateWebConfig',
      method: 'PUT',
      body: payload,
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

  public static deleteSiteDeployment = async (deploymentId: string) => {
    return MakeArmCall({
      resourceId: `${deploymentId}`,
      commandName: 'deleteSiteDeployment',
      method: 'DELETE',
    });
  };

  public static getDeploymentLogs = async (deploymentId: string) => {
    return MakeArmCall<ArmArray<DeploymentLogsItem>>({
      resourceId: `${deploymentId}/log`,
      commandName: 'fetchDeploymentLogs',
      method: 'GET',
    });
  };

  public static redeployCommit = async (resourceId: string, commitId: string) => {
    return MakeArmCall<ArmArray<DeploymentLogsItem>>({
      resourceId: `${resourceId}/deployments/${commitId}`,
      commandName: 'redeployCommit',
      method: 'PUT',
    });
  };

  public static getLogDetails = async (deploymentId: string, logId: string) => {
    return MakeArmCall<ArmArray<DeploymentLogsItem>>({
      resourceId: `${deploymentId}/log/${logId}`,
      commandName: 'fetchLogDetails',
      method: 'GET',
    });
  };

  public static getSourceControlDetails = (resourceId: string, apiVersion = CommonConstants.ApiVersions.antaresApiVersion20201201) => {
    return MakeArmCall<ArmObj<SourceControlProperties>>({
      resourceId: `${resourceId}/sourcecontrols/web`,
      commandName: 'fetchSourceControl',
      method: 'GET',
      apiVersion: apiVersion,
    });
  };

  public static deleteSourceControlDetails = (
    resourceId: string,
    deleteWorkflow: boolean = true,
    apiVersion = CommonConstants.ApiVersions.antaresApiVersion20201201
  ) => {
    const id = deleteWorkflow
      ? `${resourceId}/sourcecontrols/web`
      : `${resourceId}/sourcecontrols/web/?additionalFlags=ScmGitHubActionSkipWorkflowDelete`;

    return MakeArmCall<void>({
      resourceId: id,
      commandName: 'deleteSourceControl',
      method: 'DELETE',
      apiVersion: apiVersion,
    });
  };

  public static updateSourceControlDetails = (
    resourceId: string,
    body: any,
    apiVersion = CommonConstants.ApiVersions.antaresApiVersion20201201
  ) => {
    return MakeArmCall<void>({
      method: 'PUT',
      resourceId: `${resourceId}/sourcecontrols/web`,
      body: body,
      commandName: 'updateDeployment',
      apiVersion: apiVersion,
    });
  };

  public static syncSourceControls = (resourceId: string) => {
    const id = `${resourceId}/sync`;
    return MakeArmCall<void>({ method: 'POST', resourceId: id, commandName: 'syncSourceControls' });
  };

  public static patchSiteConfig = (resourceId: string, body: any) => {
    return MakeArmCall<void>({
      method: 'PATCH',
      resourceId: `${resourceId}/config/web`,
      body: body,
      commandName: 'patchSiteConfig',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });
  };

  public static patchSite = (resourceId: string, body: any) => {
    return MakeArmCall<void>({
      method: 'PATCH',
      resourceId: resourceId,
      body: body,
      commandName: 'patchSite',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });
  };

  public static updateApplicationSettings = async (resourceId: string, appSettings: Partial<ArmObj<KeyValue<string>>>) => {
    const id = `${resourceId}/config/appsettings`;
    const result = await MakeArmCall<Partial<ArmObj<KeyValue<string>>>>({
      resourceId: id,
      commandName: 'updateApplicationSettings',
      method: 'PUT',
      body: appSettings,
    });
    LogService.trackEvent('site-service', 'appSettingsUpdated', {
      success: result.metadata.success,
      resultCount: result.data && Object.keys(result.data.properties ?? {}).length,
    });
    return result;
  };

  public static fetchMetadata = async (resourceId: string) => {
    const id = `${resourceId}/config/metadata/list`;
    const result = await MakeArmCall<ArmObj<KeyValue<string>>>({ resourceId: id, commandName: 'fetchMetadata', method: 'POST' });
    const properties = !!result.data && !!result.data.properties ? result.data.properties : {};

    LogService.trackEvent('site-service', 'metadataLoaded', {
      success: result.metadata.success,
      resultCount: Object.keys(properties).length,
    });
    return result;
  };

  public static updateMetadata = async (resourceId: string, properties: KeyValue<string>) => {
    const id = `${resourceId}/config/metadata`;
    const result = await MakeArmCall<any>({
      resourceId: id,
      commandName: 'updateMetadata',
      method: 'PUT',
      body: { properties },
    });
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

  public static fireSyncTrigger = (site: ArmObj<Site>) => {
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

  public static getBasicPublishingCredentialsPolicies = (resourceId: string) => {
    const id = `${resourceId}/basicPublishingCredentialsPolicies`;
    return MakeArmCall<ArmObj<PublishingCredentialPolicies>>({
      method: 'GET',
      resourceId: id,
      commandName: 'getBasicPublishingCredentialsPolicies',
    });
  };

  public static putBasicAuthCredentials = async (
    resourceId: string,
    newBasicPublishingCredentials: ArmObj<PublishingCredentialPolicies>,
    type: 'scm' | 'ftp'
  ) => {
    const id = `${resourceId}/basicPublishingCredentialsPolicies/${type}`;
    const content = {
      ...newBasicPublishingCredentials,
      properties: {
        allow: type === 'scm' ? newBasicPublishingCredentials.properties.scm.allow : newBasicPublishingCredentials.properties.ftp.allow,
      },
    };
    return MakeArmCall<ArmObj<CredentialPolicy>>({
      method: 'PUT',
      resourceId: id,
      body: content,
      commandName: `put${type}BasicPublishingCredentialsPolicies`,
    });
  };

  public static AddOrUpdateCustomErrorPageForSite = (
    resourceId: string,
    errorCode: string,
    content: string,
    apiVersion = CommonConstants.ApiVersions.antaresApiVersion20141101
  ) => {
    const id = `${resourceId}/errorpages/${errorCode}`;

    return MakeArmCall({
      method: 'PUT',
      resourceId: id,
      commandName: 'AddOrUpdateCustomErrorPageForSite',
      apiVersion: apiVersion,
      body: {
        properties: {
          content,
        },
      },
    });
  };

  public static GetCustomErrorPagesForSite = (resourceId: string, apiVersion = CommonConstants.ApiVersions.antaresApiVersion20141101) => {
    const id = `${resourceId}/errorpages`;
    return MakeArmCall<ArmArray<ErrorPage>>({
      method: 'GET',
      resourceId: id,
      commandName: 'GetCustomErrorPagesForSite',
      apiVersion: apiVersion,
    });
  };

  public static GetCustomErrorPageForSite = (
    resourceId: string,
    errorCode: string,
    apiVersion = CommonConstants.ApiVersions.antaresApiVersion20141101
  ) => {
    const id = `${resourceId}/errorpages/${errorCode}`;
    return MakeArmCall<ArmObj<ErrorPage>>({
      method: 'GET',
      resourceId: id,
      commandName: 'GetCustomErrorPageForSite',
      apiVersion: apiVersion,
    });
  };

  public static DeleteCustomErrorPageForSite = (
    resourceId: string,
    errorCode: string,
    apiVersion = CommonConstants.ApiVersions.antaresApiVersion20141101
  ) => {
    const id = `${resourceId}/errorpages/${errorCode}`;
    return MakeArmCall<void>({
      method: 'DELETE',
      resourceId: id,
      commandName: 'DeleteCustomErrorPageForSite',
      apiVersion: apiVersion,
    });
  };
}
