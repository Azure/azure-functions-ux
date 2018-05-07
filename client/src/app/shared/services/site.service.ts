import { Availability } from './../../site/site-notifications/notifications';
import { ArmService } from './arm.service';
import { ConnectionStrings } from './../models/arm/connection-strings';
import { AvailableStack, AvailableStacksOsType } from './../models/arm/stacks';
import { SiteConfig } from './../models/arm/site-config';
import { ArmArrayResult } from './../models/arm/arm-obj';
import { Injectable, Injector } from '@angular/core';
import { ConditionalHttpClient } from 'app/shared/conditional-http-client';
import { UserService } from 'app/shared/services/user.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { Observable } from 'rxjs/Observable';
import { HttpResult } from './../models/http-result';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';
import { SlotConfigNames } from 'app/shared/models/arm/slot-config-names';
import { AuthSettings } from 'app/shared/models/arm/auth-settings';
import { SiteExtension } from 'app/shared/models/arm/site-extension';

type Result<T> = Observable<HttpResult<T>>;

@Injectable()
export class SiteService {
    private readonly _client: ConditionalHttpClient;

    constructor(
        userService: UserService,
        injector: Injector,
        private _cacheService: CacheService) {

        this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token))
    }

    getSite(resourceId: string): Result<ArmObj<Site>> {
        const getSite = this._cacheService.getArm(resourceId).map(r => r.json());
        return this._client.execute({ resourceId: resourceId }, t => getSite);
    }

    getSlots(resourceId: string): Result<ArmArrayResult<Site>> {
        const siteDescriptor = new ArmSiteDescriptor(resourceId);
        const slotsId = `${siteDescriptor.getSiteOnlyResourceId()}/slots`;
        const getSlots = this._cacheService.getArm(slotsId).map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => getSlots);
    }

    getSiteConfig(resourceId: string, force?: boolean): Result<ArmObj<SiteConfig>> {
        const getSiteConfig = this._cacheService.getArm(`${resourceId}/config/web`, force).map(r => r.json());
        return this._client.execute({ resourceId: resourceId }, t => getSiteConfig);
    }

    getAppSettings(resourceId: string, force?: boolean): Result<ArmObj<{ [key: string]: string }>> {

        const getAppSettings = this._cacheService.postArm(`${resourceId}/config/appSettings/list`, force)
            .map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => getAppSettings);
    }

    getConnectionStrings(resourceId: string, force?: boolean): Result<ArmObj<ConnectionStrings>> {

        const getConnectionStrings = this._cacheService.postArm(`${resourceId}/config/connectionstrings/list`, force)
            .map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => getConnectionStrings);
    }

    getSlotConfigNames(resourceId: string, force?: boolean): Result<ArmObj<SlotConfigNames>> {
        const slotsConfigNamesId = `${new ArmSiteDescriptor(resourceId).getSiteOnlyResourceId()}/config/slotConfigNames`;
        const getSlotConfigNames = this._cacheService.getArm(slotsConfigNamesId, force)
            .map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => getSlotConfigNames);
    }

    getAvailableStacks(osType?: AvailableStacksOsType): Result<ArmArrayResult<AvailableStack>> {
        const queryString = !osType ? '' : `?osTypeSelected=${osType}`;
        const getAvailableStacks = this._cacheService.getArm(`/providers/Microsoft.Web/availablestacks${queryString}`).map(r => r.json());
        return this._client.execute({ resourceId: null }, t => getAvailableStacks);
    }

    getAvailability(resourceId: string): Result<ArmObj<Availability>> {
        const subscriptionId = (new ArmSiteDescriptor(resourceId)).subscription;
        const availabilityId = `${resourceId}/providers/Microsoft.ResourceHealth/availabilityStatuses/current`;
        const getAvailability = this._cacheService.getArm(availabilityId, false, ArmService.availabilityApiVersion)
            .map(r => r.json())
            .catch((e: any) => {

                // this call fails with 409 is Microsoft.ResourceHealth is not registered
                if (e.status === 409) {
                    return this._cacheService.postArm(`/subscriptions/${subscriptionId}/providers/Microsoft.ResourceHealth/register`)
                        .mergeMap(() => {
                            return this._cacheService.getArm(availabilityId, false, ArmService.availabilityApiVersion)
                        })
                        .map(r => r.json());
                }

                return Observable.throw(e);
            });

        return this._client.execute({ resourceId: resourceId }, t => getAvailability);
    }

    getAuthSettings(resourceId: string, force?: boolean): Result<ArmObj<AuthSettings>> {
        const getAuthSettings = this._cacheService.postArm(`${resourceId}/config/authsettings/list`, force)
            .map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => getAuthSettings);
    }

    getSiteExtensions(resourceId: string): Result<ArmArrayResult<SiteExtension>> {
        const getSiteExtensions = this._cacheService.getArm(`${resourceId}/siteExtensions`, false)
            .map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => getSiteExtensions);
    }

    getPublishingProfile(resourceId: string): Result<string> {
        const getPublishingProfile = this._cacheService.postArm(`${resourceId}/publishxml`, true).map(r => r.text());
        return this._client.execute({ resourceId: resourceId }, t => getPublishingProfile);
    }
}
