import { Injectable, Injector } from '@angular/core';
import { ArmArrayResult, ArmObj } from '../../../shared/models/arm/arm-obj';
import { ACRRegistry, ACRCredential, ACRWebhookPayload } from '../container-settings';
import { CacheService } from '../../../shared/services/cache.service';
import { ARMApiVersions } from '../../../shared/models/constants';
import { Headers, Response } from '@angular/http';
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

  public getRepositories(loginServer: string, username: string, password: string): Observable<Response> {
    const headers = new Headers();
    const encoded = btoa(`${username}:${password}`);

    headers.append('Authorization', `Basic ${encoded}`);
    headers.append('Content-Type', 'application/json');

    const url = `https://${loginServer}/v2/_catalog`;

    return this._dispatchPageableRequest(loginServer, url, headers);
  }

  public getTags(loginServer: string, repository: string, username: string, password: string): Observable<Response> {
    const headers = new Headers();
    const encoded = btoa(`${username}:${password}`);

    headers.append('Authorization', `Basic ${encoded}`);
    headers.append('Content-Type', 'application/json');

    const url = `https://${loginServer}/v2/${repository}/tags/list`;

    return this._dispatchPageableRequest(loginServer, url, headers);
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

  public getNextLink(loginServer: string, response: Response): string {
    if (response && response.status === 200) {
      const linksHeader = response.headers.getAll('link');
      const links = ResponseHeader.getLinksFromLinkHeader(linksHeader);
      if (links && links.next) {
        return `https://${loginServer}${links.next}`;
      }
    }

    return null;
  }

  private _dispatchPageableRequest(loginServer: string, url: string, headers: Headers) {
    // NOTE(michinoy): expand operator is used to make recursive calls to follow next links.
    // good starting point for understanding:
    // https://stackoverflow.com/questions/44981974/angular-correctly-using-rxjs-expand-operator-to-make-recursive-http-calls
    // Also we are using the passthrough API allowing us to make the calls to ACR service without having to worry about CORS.
    return this._cacheService
      .post(`/api/passthrough?q=${url}`, false, headers, this._generatePassthroughObject(url, headers))
      .expand(response => {
        const nextLink = this.getNextLink(loginServer, response);
        if (nextLink) {
          return this._cacheService.post(
            `/api/passthrough?q=${nextLink}`,
            false,
            headers,
            this._generatePassthroughObject(nextLink, headers)
          );
        } else {
          return Observable.empty();
        }
      });
  }

  private _generatePassthroughObject(url: string, headers: Headers) {
    return {
      method: 'GET',
      url: url,
      body: null,
      headers: headers,
    };
  }
}
