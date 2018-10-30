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
    const getSlots = this._cacheService.getArm(slotsId, force).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getSlots);
  }

  getSiteConfig(resourceId: string, force?: boolean): Result<ArmObj<SiteConfig>> {
    const getSiteConfig = this._cacheService.getArm(`${resourceId}/config/web`, force).map(r => r.json());
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
    const getPublishingProfile = this._cacheService.postArm(`${resourceId}/publishxml`, true).map(r => r.text());
    return this._client.execute({ resourceId: resourceId }, t => getPublishingProfile);
  }

  addOrUpdateAppSettings(resourceId: string, newOrUpdatedSettings: ApplicationSettings): Result<ArmObj<ApplicationSettings>> {
    const addOrUpdateAppSettings = this._cacheService
      .postArm(`${resourceId}/config/appSettings/list`, true)
      .mergeMap(r => {
        if (newOrUpdatedSettings) {
          const keys = Object.keys(newOrUpdatedSettings);
          if (keys.length !== 0) {
            const appSettingsArm = r.json() as ArmObj<ApplicationSettings>;
            keys.forEach(key => (appSettingsArm.properties[key] = newOrUpdatedSettings[key]));
            return this._cacheService.putArm(appSettingsArm.id, null, appSettingsArm);
          }
        }
        return Observable.of(r);
      })
      .map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => addOrUpdateAppSettings);
  }

  createSlot(resourceId: string, slotName: string, loc: string, serverfarmId: string, config?: SiteConfig): Result<ArmObj<Site>> {
    if (!!config) {
      config.experiments = null;
      config.routingRules = null;
    }

    const payload = JSON.stringify({
      location: loc,
      properties: {
        serverFarmId: serverfarmId,
        siteConfig: config,
      },
    });
    const newSlotId = `${resourceId}/slots/${slotName}`;
    const createSlot = this._cacheService.putArm(newSlotId, null, payload).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => createSlot);
  }

  getSlotDiffs(resourceId: string, slotName: string): Result<ArmArrayResult<SlotsDiff>> {
    const payload = { targetSlot: slotName };

    const slotDiffsId = `${resourceId}/slotsdiffs`;
    const getSlotDiffs = this._cacheService.postArm(slotDiffsId, null, null, payload).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getSlotDiffs);
  }

  getPublishingCredentials(resourceId: string, force?: boolean): Result<ArmObj<PublishingCredentials>> {
    const getPublishingCredentials = this._cacheService
      .postArm(`${resourceId}/config/publishingcredentials/list`, force)
      .map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getPublishingCredentials);
  }

  updateSiteConfig(resourceId: string, siteConfig: ArmObj<SiteConfig>) {
    const putSiteConfig = this._cacheService.putArm(`${resourceId}/config/web`, null, siteConfig);
    return this._client.execute({ resourceId: resourceId }, t => putSiteConfig);
  }

  updateAppSettings(resourceId: string, appSettings: ArmObj<ApplicationSettings>) {
    const putAppSettings = this._cacheService.putArm(`${resourceId}/config/appSettings`, null, appSettings);
    return this._client.execute({ resourceId: resourceId }, t => putAppSettings);
  }
}
