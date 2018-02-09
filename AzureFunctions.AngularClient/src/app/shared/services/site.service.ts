import { ConnectionString } from './../models/arm/connection-strings';
import { AvailableStack } from './../models/arm/stacks';
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

    getConnectionStrings(resourceId: string, force?: boolean): Result<ArmObj<ConnectionString>> {

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

    getAvailableStacks(): Result<ArmArrayResult<AvailableStack>> {
        const getAvailableStacks = this._cacheService.getArm('/providers/Microsoft.Web/availablestacks').map(r => r.json());
        return this._client.execute({ resourceId: null }, t => getAvailableStacks);
    }
}
