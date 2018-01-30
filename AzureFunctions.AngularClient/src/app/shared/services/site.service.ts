import { Injectable, Injector } from "@angular/core";
import { ConditionalHttpClient } from "app/shared/conditional-http-client";
import { UserService } from "app/shared/services/user.service";
import { CacheService } from "app/shared/services/cache.service";
import {AuthzService} from "./authz.service";
import { ArmSiteDescriptor } from "app/shared/resourceDescriptors";
import { Observable } from "rxjs/Observable";
import { HttpResult } from './../models/http-result';
import { ArmObj } from "app/shared/models/arm/arm-obj";
import { Site } from "app/shared/models/arm/site";

@Injectable()
export class SiteService {
    private readonly _client: ConditionalHttpClient;

    constructor(
        userService: UserService,
        injector: Injector,
        private _cacheService: CacheService) {

        this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token))
    }

    getSite(resourceId: string): Observable<HttpResult<ArmObj<Site>>>{
        const getSite = this._cacheService.getArm(resourceId).map(r => r.json());
        return this._client.executeWithConditions(
            ['HasPermissions'],
            {
                resourceId: resourceId,
                permissionsToCheck: [AuthzService.readScope]
            },
            t => getSite);
    }

    getAppSettings(resourceId: string){
        const getAppSettings = this._cacheService.postArm(`${resourceId}/config/appSettings/list`, true)
        .map(r =>r.json());

        return this._client.executeWithConditions(
            ['HasPermissions', 'NoReadonlyLock'],
            {
                resourceId: resourceId,
                permissionsToCheck: [AuthzService.writeScope]
            },
            t => getAppSettings);
    }

    getSlotConfigNames(resourceId: string){
        const slotsConfigNamesId = `${new ArmSiteDescriptor(resourceId).getSiteOnlyResourceId()}/config/slotConfigNames`;
        const getSlotConfigNames = this._cacheService.getArm(slotsConfigNamesId, true)
        .map(r => r.json());

        return this._client.executeWithConditions(
            ['HasPermissions', 'NoReadonlyLock'],
            {
                resourceId: resourceId,
                permissionsToCheck: [AuthzService.writeScope]
            },
            t => getSlotConfigNames);

    }
}
