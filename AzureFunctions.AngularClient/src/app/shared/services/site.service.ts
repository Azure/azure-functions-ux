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
        return this._client.execute({ resourceId: resourceId}, t => getSite);
    }

    getAppSettings(resourceId: string): Result<ArmObj<{[key: string]: string}>> {

        const getAppSettings = this._cacheService.postArm(`${resourceId}/config/appSettings/list`, true)
            .map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => getAppSettings);
    }

    getSlotConfigNames(resourceId: string): Result<ArmObj<SlotConfigNames>> {
        const slotsConfigNamesId = `${new ArmSiteDescriptor(resourceId).getSiteOnlyResourceId()}/config/slotConfigNames`;
        const getSlotConfigNames = this._cacheService.getArm(slotsConfigNamesId, true)
            .map(r => r.json());

        return this._client.execute( { resourceId: resourceId }, t => getSlotConfigNames);
    }
}
