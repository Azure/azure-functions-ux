import { Injectable, Injector } from '@angular/core';
import { ArmArrayResult, ArmObj } from '../../../shared/models/arm/arm-obj';
import {
    ACRRegistry,
    ACRCredential,
    ACRDirectRequestPayload,
    ACRRepositories,
    ACRTags,
    ACRWebhookPayload} from '../container-settings';
import { CacheService } from '../../../shared/services/cache.service';
import { ARMApiVersions } from '../../../shared/models/constants';
import { Headers } from '@angular/http';
import { ConditionalHttpClient, Result } from '../../../shared/conditional-http-client';
import { UserService } from '../../../shared/services/user.service';

export interface IContainerACRService {
    getRegistries(subscriptionId: string): Result<ArmArrayResult<ACRRegistry>>;
    getCredentials(resourceUri: string, registry: string): Result<ACRCredential>;
    getRepositories(subscriptionId: string, resourceId: string, loginServer: string, username: string, password: string): Result<ACRRepositories>;
    getTags(subscriptionId: string, resourceId: string, loginServer: string, repository: string, username: string, password: string): Result<ACRTags>;
    updateAcrWebhook(resourceId: string, webhookName: string, location: string, webhookPayload: ACRWebhookPayload): Result<ArmObj<ACRWebhookPayload>>;
}

@Injectable()
export class ContainerACRService implements IContainerACRService {
    private readonly _client: ConditionalHttpClient;

    constructor(
        private _cacheService: CacheService,
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

    public getRepositories(
        subscriptionId: string,
        resourceId: string,
        loginServer: string,
        username: string,
        password: string): Result<ACRRepositories> {
        const payload: ACRDirectRequestPayload = {
            username,
            password,
            subId: subscriptionId,
            endpoint: `https://${loginServer}/v2/_catalog`,
        };

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const getRepositories = this._cacheService
            .post(`/api/getAcrRepositories?server=${loginServer}`, false, headers, payload)
            .map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => getRepositories);
    }

    public getTags(
        subscriptionId: string,
        resourceId: string,
        loginServer: string,
        repository: string,
        username: string,
        password: string): Result<ACRTags> {
        const payload: ACRDirectRequestPayload = {
            username,
            password,
            subId: subscriptionId,
            endpoint: `https://${loginServer}/v2/${repository}/tags/list`,
        };

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const getTags = this._cacheService
            .post(`/api/getAcrTags?server=${loginServer}&repository=${repository}`, false, headers, payload)
            .map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => getTags);
    }

    public updateAcrWebhook(resourceId: string, name: string, location: string, properties: ACRWebhookPayload): Result<ArmObj<ACRWebhookPayload>> {
        const content = {
            name,
            location,
            properties,
        };

        const updateAcrWebhook = this._cacheService
            .putArm(resourceId, ARMApiVersions.acrWebhookApiVersion, content)
            .map(r => r.json());

        return this._client.execute({ resourceId: resourceId }, t => updateAcrWebhook);
    }
}
