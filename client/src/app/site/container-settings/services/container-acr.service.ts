import { Injectable, Injector } from '@angular/core';
import { ArmArrayResult, ArmObj } from '../../../shared/models/arm/arm-obj';
import { ACRRegistry, ACRCredential, ACRDirectRequestPayload, ACRTags, ACRWebhookPayload } from '../container-settings';
import { CacheService } from '../../../shared/services/cache.service';
import { ARMApiVersions } from '../../../shared/models/constants';
import { Headers } from '@angular/http';
import { ConditionalHttpClient, Result } from '../../../shared/conditional-http-client';
import { UserService } from '../../../shared/services/user.service';
import { Observable } from 'rxjs/Observable';
import { ResponseHeader } from 'app/shared/Utilities/response-header';

@Injectable()
export class ContainerACRService {
  private readonly _client: ConditionalHttpClient;

  constructor(private _cacheService: CacheService, userService: UserService, injector: Injector) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  public getRegistries(subscriptionId: string): Result<ArmArrayResult<ACRRegistry>> {
    const resourceId = `/subscriptions/${subscriptionId}/providers/Microsoft.ContainerRegistry/registries`;

    const getRegistries = this._cacheService.getArm(resourceId, false, ARMApiVersions.acrApiversion).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getRegistries);
  }

  public getCredentials(resourceId: string): Result<ACRCredential> {
    const requestResourceId = `${resourceId}/listCredentials`;

    const getCredentails = this._cacheService.postArm(requestResourceId, false, ARMApiVersions.acrApiversion).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getCredentails);
  }

  public getRepositories(loginServer: string, username: string, password: string): any {
    const headers = new Headers();
    const encoded = btoa(`${username}:${password}`);

    headers.append('Authorization', `Basic ${encoded}`);
    headers.append('Content-Type', 'application/json');

    const url = `https://${loginServer}/v2/_catalog`;

    return this._cacheService
      .get(url, true, headers)
      .expand(response => {
        if (response.status === 200) {
          const linksHeader = response.headers.getAll('link');
          const links = ResponseHeader.getLinksFromLinkHeader(linksHeader);
          const requests = Object.keys(links).map(linkName => {
            const nextUrl = `https://${loginServer}${links[linkName]}`;
            return this._cacheService.get(nextUrl, true, headers);
          });
          return Observable.zip(requests);
        } else {
          return Observable.empty();
        }
      })
      .concatMap(content => {
        return Observable.of(content);
      });
  }

  public getTags(
    subscriptionId: string,
    resourceId: string,
    loginServer: string,
    repository: string,
    username: string,
    password: string
  ): Result<ACRTags> {
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

  public updateAcrWebhook(
    resourceId: string,
    name: string,
    location: string,
    properties: ACRWebhookPayload
  ): Result<ArmObj<ACRWebhookPayload>> {
    const content = {
      name,
      location,
      properties,
    };

    const updateAcrWebhook = this._cacheService.putArm(resourceId, ARMApiVersions.acrWebhookApiVersion, content).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => updateAcrWebhook);
  }

  public deleteAcrWebhook(resourceId: string): Result<Response> {
    const deleteAcrWebhook = this._cacheService.deleteArm(resourceId, ARMApiVersions.acrWebhookApiVersion).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => deleteAcrWebhook);
  }
}
