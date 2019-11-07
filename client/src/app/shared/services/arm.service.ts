import { PortalService } from './portal.service';
import { ArmServiceHelper } from './arm.service-helper';
import { Injectable } from '@angular/core';
import { Http, Headers, Request, ResponseContentType } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';

import { UserService } from './user.service';
import { AiService } from './ai.service';
import { ARMApiVersions } from '../models/constants';

@Injectable()
export class ArmService {
  public static availabilityApiVersion = '2015-01-01';

  public armUrl = '';
  public armApiVersion = ARMApiVersions.armApiVersion;
  public armPermissionsVersion = '2015-07-01';
  public armLocksApiVersion = '2015-01-01';
  public storageApiVersion = '2015-05-01-preview';
  public antaresApiVersion20181101 = ARMApiVersions.antaresApiVersion20181101;
  public serviceBusAndEventHubApiVersion20150801 = ARMApiVersions.serviceBusAndEventHubApiVersion20150801;
  public appInsightsApiVersion = '2015-05-01';
  public notificationHubApiVersion = '2017-04-01';
  public logicAppsApiVersion = '2017-07-01';

  private _token: string;
  private _sessionId: string;
  private _invokeId = 100;

  constructor(private _http: Http, _userService: UserService, _portalService: PortalService, protected _aiService: AiService) {
    this.armUrl = _portalService.isEmbeddedFunctions ? ArmService.getRPUrl() : ArmServiceHelper.armEndpoint;

    _userService.getStartupInfo().subscribe(info => {
      this._token = info.token;
      this._sessionId = info.sessionId;
    });
  }

  getHeaders(etag?: string) {
    return ArmServiceHelper.getHeaders(this._token, this._sessionId, etag);
  }

  send(
    method: string,
    url: string,
    body?: any,
    etag?: string,
    headers?: Headers,
    invokeApi?: boolean,
    responseContentType?: ResponseContentType
  ) {
    headers = headers ? headers : this.getHeaders(etag);

    if (invokeApi) {
      let pathAndQuery = url.slice(this.armUrl.length);
      pathAndQuery = encodeURI(pathAndQuery);
      headers.append('x-ms-path-query', pathAndQuery);
      url = `${this.armUrl}/api/invoke?_=${this._invokeId++}`;
    }

    const request = new Request({
      url: url,
      method: method,
      search: null,
      headers: headers,
      body: body ? body : null,
      responseType: responseContentType,
    });

    return this._http.request(request);
  }

  get(resourceId: string, apiVersion?: string) {
    const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.antaresApiVersion20181101}`;
    return this._http.get(url, { headers: this.getHeaders() });
  }

  delete(resourceId: string, apiVersion?: string) {
    const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.antaresApiVersion20181101}`;
    return this._http.delete(url, { headers: this.getHeaders() });
  }

  put(resourceId: string, body: any, apiVersion?: string) {
    const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.antaresApiVersion20181101}`;
    return this._http.put(url, JSON.stringify(body), { headers: this.getHeaders() });
  }

  patch(resourceId: string, body: any, apiVersion?: string) {
    const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.antaresApiVersion20181101}`;
    return this._http.patch(url, JSON.stringify(body), { headers: ArmServiceHelper.getHeaders(this._token, this._sessionId) });
  }

  post(resourceId: string, body: any, apiVersion?: string) {
    const content = !!body ? JSON.stringify(body) : null;
    const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.antaresApiVersion20181101}`;
    return this._http.post(url, content, { headers: this.getHeaders() });
  }

  getArmUrl(resourceId: string, apiVersion?: string) {
    const url = `${this.armUrl}${resourceId}`;
    if (apiVersion) {
      return this._updateQueryString(url, 'api-version', apiVersion ? apiVersion : this.antaresApiVersion20181101);
    } else {
      return url;
    }
  }

  // http://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter
  private _updateQueryString(uri, key, value) {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + value + '$2');
    } else {
      return uri + separator + key + '=' + value;
    }
  }

  // tslint:disable-next-line:member-ordering
  public static getRPUrl(): string {
    if (window.location.host.indexOf('next') !== -1 || window.location.host.indexOf('localhost') !== -1) {
      return 'https://blueridge-tip1-rp-westus.azurewebsites.net';
    }
    return 'https://blueridge-rp-westus.azurewebsites.net';
  }
}
