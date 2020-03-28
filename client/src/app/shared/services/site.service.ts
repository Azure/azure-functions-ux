import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ConditionalHttpClient } from './../../shared/conditional-http-client';
import { ArmSiteDescriptor } from './../../shared/resourceDescriptors';
import { Availability } from './../../site/site-notifications/notifications';
import { HttpResult } from './../models/http-result';
import { ApplicationSettings } from './../models/arm/application-settings';
import { ArmArrayResult } from './../models/arm/arm-obj';
import { ArmObj } from './../models/arm/arm-obj';
import { AuthSettings } from './../models/arm/auth-settings';
import { ConnectionStrings } from './../models/arm/connection-strings';
import { Site } from './../models/arm/site';
import { SiteConfig } from './../models/arm/site-config';
import { SiteExtension } from './../models/arm/site-extension';
import { SlotConfigNames } from './../models/arm/slot-config-names';
import { SlotsDiff } from './../models/arm//slots-diff';
import { AvailableStack, OsType } from './../models/arm/stacks';
import { ArmService } from './arm.service';
import { CacheService } from './cache.service';
import { UserService } from './user.service';
import { PublishingCredentials } from '../models/publishing-credentials';
import { ARMApiVersions } from '../models/constants';
import { ByosStorageAccounts } from 'app/site/byos/byos';
import { HostingEnvironment } from '../models/arm/hosting-environment';
import { PublishingUser } from '../models/arm/publishing-users';
import { Deployment, SourceControlData } from 'app/site/deployment-center/Models/deployment-data';
import { AppSettingsHelper } from '../Utilities/application-settings-helper';

type Result<T> = Observable<HttpResult<T>>;

@Injectable()
export class SiteService {
  private readonly _client: ConditionalHttpClient;

  constructor(userService: UserService, injector: Injector, private _cacheService: CacheService) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  getSite(resourceId: string, force?: boolean): Result<ArmObj<Site>> {
    const getSite = this._cacheService.getArm(resourceId, force).map(r => r.json());
    return this._client.execute({ resourceId: resourceId }, t => getSite);
  }

  getSlots(resourceId: string, force?: boolean): Result<ArmArrayResult<Site>> {
    const siteDescriptor = new ArmSiteDescriptor(resourceId);
    const slotsId = `${siteDescriptor.getSiteOnlyResourceId()}/slots`;
    const getSlots = this._cacheService.getArm(slotsId, force, ARMApiVersions.antaresApiVersion20181101).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getSlots);
  }

  getSiteConfig(resourceId: string, force?: boolean): Result<ArmObj<SiteConfig>> {
    const getSiteConfig = this._cacheService.getArm(`${resourceId}/config/web`, force, ARMApiVersions.antaresApiVersion20181101).map(r => {
      const siteConfig: ArmObj<SiteConfig> = r.json();

      if (siteConfig && siteConfig.properties && siteConfig.properties.azureStorageAccounts) {
        delete siteConfig.properties.azureStorageAccounts;
      }

      return siteConfig;
    });
    return this._client.execute({ resourceId: resourceId }, t => getSiteConfig);
  }

  getAppSettings(resourceId: string, force?: boolean): Result<ArmObj<ApplicationSettings>> {
    const getAppSettings = this._cacheService.postArm(`${resourceId}/config/appSettings/list`, force).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getAppSettings);
  }

  getConnectionStrings(resourceId: string, force?: boolean): Result<ArmObj<ConnectionStrings>> {
    const getConnectionStrings = this._cacheService.postArm(`${resourceId}/config/connectionstrings/list`, force).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getConnectionStrings);
  }

  getSlotConfigNames(resourceId: string, force?: boolean): Result<ArmObj<SlotConfigNames>> {
    const slotsConfigNamesId = `${new ArmSiteDescriptor(resourceId).getSiteOnlyResourceId()}/config/slotConfigNames`;
    const getSlotConfigNames = this._cacheService.getArm(slotsConfigNamesId, force).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getSlotConfigNames);
  }

  getAvailableStacks(osType?: OsType): Result<ArmArrayResult<AvailableStack>> {
    const queryString = !osType ? '' : `?osTypeSelected=${osType}`;
    const getAvailableStacks = this._cacheService.getArm(`/providers/Microsoft.Web/availablestacks${queryString}`).map(r => r.json());
    return this._client.execute({ resourceId: null }, t => getAvailableStacks);
  }

  getAvailability(resourceId: string): Result<ArmObj<Availability>> {
    const subscriptionId = new ArmSiteDescriptor(resourceId).subscription;
    const availabilityId = `${resourceId}/providers/Microsoft.ResourceHealth/availabilityStatuses/current`;
    const getAvailability = this._cacheService
      .getArm(availabilityId, false, ArmService.availabilityApiVersion)
      .map(r => r.json())
      .catch((e: any) => {
        // this call fails with 409 is Microsoft.ResourceHealth is not registered
        if (e.status === 409) {
          return this._cacheService
            .postArm(`/subscriptions/${subscriptionId}/providers/Microsoft.ResourceHealth/register`)
            .mergeMap(() => {
              return this._cacheService.getArm(availabilityId, false, ArmService.availabilityApiVersion);
            })
            .map(r => r.json());
        }

        return Observable.throw(e);
      });

    return this._client.execute({ resourceId: resourceId }, t => getAvailability);
  }

  getAuthSettings(resourceId: string, force?: boolean): Result<ArmObj<AuthSettings>> {
    const getAuthSettings = this._cacheService.postArm(`${resourceId}/config/authsettings/list`, force).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getAuthSettings);
  }

  getSiteExtensions(resourceId: string): Result<ArmArrayResult<SiteExtension>> {
    const getSiteExtensions = this._cacheService.getArm(`${resourceId}/siteExtensions`, false).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getSiteExtensions);
  }

  getPublishingProfile(resourceId: string): Result<string> {
    const getPublishingProfile = this._cacheService
      .postArm(`${resourceId}/publishxml`, true, ARMApiVersions.antaresApiVersion20181101)
      .map(r => r.text());
    return this._client.execute({ resourceId: resourceId }, t => getPublishingProfile);
  }

  addOrUpdateAppSettings(resourceId: string, newOrUpdatedSettings: ApplicationSettings): Result<ArmObj<ApplicationSettings>> {
    const addOrUpdateAppSettings = this._cacheService
      .postArm(`${resourceId}/config/appSettings/list`, true)
      .mergeMap(r => {
        const appSettingsArm = r.json() as ArmObj<ApplicationSettings>;
        if (appSettingsArm && newOrUpdatedSettings) {
          appSettingsArm.properties = AppSettingsHelper.mergeAppSettings(appSettingsArm.properties, newOrUpdatedSettings);
          return this._cacheService.putArm(appSettingsArm.id, null, appSettingsArm);
        }
        return Observable.of(r);
      })
      .map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => addOrUpdateAppSettings);
  }

  createSlot(resourceId: string, slotName: string, loc: string, serverfarmId: string, config?: SiteConfig | {}): Result<ArmObj<Site>> {
    if (!!config) {
      ['experiments', 'routingRules'].forEach(propertyName => {
        if (config.hasOwnProperty(propertyName)) {
          config[propertyName] = null;
        }
      });
    }

    const payload = JSON.stringify({
      location: loc,
      properties: {
        serverFarmId: serverfarmId,
        siteConfig: config,
      },
    });
    const newSlotId = `${resourceId}/slots/${slotName}`;
    const createSlot = this._cacheService.putArm(newSlotId, ARMApiVersions.antaresApiVersion20181101, payload).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => createSlot);
  }

  getSlotDiffs(resourceId: string, slotName: string): Result<ArmArrayResult<SlotsDiff>> {
    const payload = { targetSlot: slotName };

    const slotDiffsId = `${resourceId}/slotsdiffs`;
    const getSlotDiffs = this._cacheService.postArm(slotDiffsId, true, null, payload).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getSlotDiffs);
  }

  getPublishingCredentials(resourceId: string, force?: boolean): Result<ArmObj<PublishingCredentials>> {
    const getPublishingCredentials = this._cacheService
      .postArm(`${resourceId}/config/publishingcredentials/list`, force)
      .map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getPublishingCredentials);
  }

  updateSiteConfig(resourceId: string, siteConfig: ArmObj<SiteConfig>) {
    const putSiteConfig = this._cacheService.putArm(`${resourceId}/config/web`, ARMApiVersions.antaresApiVersion20181101, siteConfig);
    return this._client.execute({ resourceId: resourceId }, t => putSiteConfig);
  }

  updateAppSettings(resourceId: string, appSettings: ArmObj<ApplicationSettings>) {
    const putAppSettings = this._cacheService.putArm(`${resourceId}/config/appSettings`, null, appSettings);
    return this._client.execute({ resourceId: resourceId }, t => putAppSettings);
  }

  getAzureStorageAccounts(resourceId: string, force?: boolean): Result<ArmObj<ByosStorageAccounts>> {
    const getSiteConfig = this._cacheService
      .postArm(`${resourceId}/config/azureStorageAccounts/list`, force, ARMApiVersions.antaresApiVersion20181101)
      .map(r => r.json());
    return this._client.execute({ resourceId: resourceId }, t => getSiteConfig);
  }

  getHostingEnvironment(resourceId: string, force?: boolean): Result<ArmObj<HostingEnvironment>> {
    const getHostingEnvironment = this._cacheService.getArm(resourceId, force, ARMApiVersions.antaresApiVersion20181101).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getHostingEnvironment);
  }

  resetPublishProfile(resourceId: string): Result<any> {
    const resetPublishProfile = this._cacheService.postArm(`${resourceId}/newpassword`, true).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => resetPublishProfile);
  }

  getPublishingUser(): Result<ArmObj<PublishingUser>> {
    const getPublishingUser = this._cacheService.getArm(`/providers/Microsoft.Web/publishingUsers/web`, true).map(r => r.json());

    return this._client.execute({ resourceId: '' }, t => getPublishingUser);
  }

  updatePublishingUser(properties: PublishingUser): Result<ArmObj<PublishingUser>> {
    const updatePublishingUser = this._cacheService
      .putArm(`/providers/Microsoft.Web/publishingUsers/web`, null, { properties })
      .map(r => r.json());

    return this._client.execute({ resourceId: '' }, t => updatePublishingUser);
  }

  getSiteSourceControlConfig(resourceId: string, force?: boolean): Result<ArmObj<SourceControlData>> {
    const getSiteSourceControlConfig = this._cacheService.getArm(`${resourceId}/sourcecontrols/web`, force).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getSiteSourceControlConfig);
  }

  deleteSiteSourceControlConfig(resourceId: string): Result<any> {
    const deleteSiteSourceControlConfig = this._cacheService.deleteArm(`${resourceId}/sourcecontrols/web`);

    return this._client.execute({ resourceId: resourceId }, t => deleteSiteSourceControlConfig);
  }

  getSiteDeployments(resourceId: string): Result<ArmArrayResult<Deployment>> {
    const getSiteDeployments = this._cacheService.getArm(`${resourceId}/deployments`, true).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getSiteDeployments);
  }

  clearSiteConfigArmCache(resourceId: string): void {
    this._cacheService.clearArmIdCachePrefix(`${resourceId}/config/web`);
  }

  fetchSiteConfigMetadata(resourceId: string, force?: boolean): Result<ArmObj<{ [key: string]: string }>> {
    const fetchSiteConfigMetadata = this._cacheService
      .postArm(`${resourceId}/config/metadata/list`, force, ARMApiVersions.antaresApiVersion20181101)
      .map(r => r.json());
    return this._client.execute({ resourceId: resourceId }, t => fetchSiteConfigMetadata);
  }
}
