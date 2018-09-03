import { Injectable, Injector } from '@angular/core';
import { ArmArrayResult } from '../models/arm/arm-obj';
import { ACRRegistry, ACRCredential, ACRDirectRequestPayload, ACRRepositories, ACRTags, AcrApiObject } from '../../site/container-settings/container-settings';
import { CacheService } from './cache.service';
import { ARMApiVersions, LogCategories } from '../models/constants';
import { Observable } from 'rxjs/Observable';
import { LogService } from './log.service';
import { Headers } from '@angular/http';
import { ConditionalHttpClient, Result } from '../conditional-http-client';
import { UserService } from './user.service';

export interface IContainerACRService {
    getRegistries(subscriptionId: string): Result<ArmArrayResult<ACRRegistry>>;
    getCredentials(resourceUri: string, registry: string): Result<ACRCredential>;
    getRepositories(subscriptionId: string, loginServer: string, username: string, password: string): Observable<AcrApiObject<ACRRepositories>>;
    getTags(subscriptionId: string, loginServer: string, repository: string, username: string, password: string): Observable<AcrApiObject<ACRTags>>;
}

@Injectable()
export class ContainerACRService implements IContainerACRService {
    private readonly _client: ConditionalHttpClient;

    constructor(
        private _cacheService: CacheService,
        private _logService: LogService,
        userService: UserService,
        injector: Injector,
    ) {
        this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
    }

    public getRegistries(subscriptionId: string): Result<ArmArrayResult<ACRRegistry>> {
        const resourceId = `/subscriptions/${subscriptionId}/providers/Microsoft.ContainerRegistry/registries`;

        const getRegistries = this._cacheService
            .getArm(resourceId, false, ARMApiVersions.acrApiversion)
            .map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => getRegistries);
    }

    public getCredentials(resourceId: string): Result<ACRCredential> {
        const requestResourceId = `${resourceId}/listCredentials`;

        const getCredentails = this._cacheService
            .postArm(requestResourceId, false, ARMApiVersions.acrApiversion)
            .map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => getCredentails);
    }

    public getRepositories(subscriptionId: string, loginServer: string, username: string, password: string): Observable<AcrApiObject<ACRRepositories>> {
        const payload: ACRDirectRequestPayload = {
            username,
            password,
            subId: subscriptionId,
            endpoint: `https://${loginServer}/v2/_catalog`,
        };

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const response = this._cacheService
            .post('/api/getAcrRepositories', false, headers, payload);

        return response
            .map(r => Observable.of(r.json()))
            .catch(err => {
                this._logService.error(
                    LogCategories.containerACR,
                    '/api/getAcrRepositories',
                    `Failed to get credentails for '${payload.username}' at '${payload.endpoint}'`);
                return Observable.of(null);
            });
    }

    public getTags(subscriptionId: string, loginServer: string, repository: string, username: string, password: string): Observable<AcrApiObject<ACRTags>> {
        const payload: ACRDirectRequestPayload = {
            username,
            password,
            subId: subscriptionId,
            endpoint: `https://${loginServer}/v2/${repository}/tags/list`,
        };

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const response = this._cacheService.post('/api/getAcrTags', false, headers, payload);

        return response
            .map(r => Observable.of(r.json()))
            .catch(err => {
                this._logService.error(
                    LogCategories.containerACR,
                    '/api/getAcrTags',
                    `Failed to get credentails for '${payload.username}' at '${payload.endpoint}'`);
                return Observable.of(null);
            });
    }
}
