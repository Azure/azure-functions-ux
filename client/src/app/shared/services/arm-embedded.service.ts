import { PortalService } from 'app/shared/services/portal.service';
import { NoCorsHttpService } from './../no-cors-http-service';
import { Url } from './../Utilities/url';
import { Observable } from 'rxjs/Observable';
import { AiService } from './ai.service';
import { UserService } from './user.service';
import { Http, Headers, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { ArmService } from './arm.service';

@Injectable()
export class ArmEmbeddedService extends ArmService {
  public static url = ArmService.getRPUrl();

  public antaresApiVersion20181101 = '2018-02-01-preview';

  private _whitelistedAPIMUrls: string[] = ['https://blueridge.azure-api.net', 'https://tip1.api.cds.microsoft.com'];

  private _whitelistedRPPrefixUrls: string[] = [ArmEmbeddedService.url, NoCorsHttpService.passThroughUrl];

  private _whitelistedPathPrefix: string[] = ['/api/'];

  constructor(http: Http, userService: UserService, aiService: AiService, portalService: PortalService) {
    super(http, userService, portalService, aiService);
  }

  send(method: string, url: string, body?: any, etag?: string, headers?: Headers): Observable<Response> {
    let urlNoQuery = url.toLowerCase().split('?')[0];
    const path = Url.getPath(urlNoQuery);
    const pathParts = path.split('/').filter(part => !!part);

    if (pathParts.length === 8 && pathParts[6] === 'entities') {
      return Observable.of(this._getFakeSiteObj(path, pathParts[7]));
    }

    if (pathParts.length === 6 && pathParts[4] === 'scopes') {
      return Observable.of(this._getFakeSiteObj(path, 'fakeEnvironmentApp'));
    }

    if (urlNoQuery.endsWith('/config/authsettings/list')) {
      return Observable.of(
        this._getFakeResponse({
          id: Url.getPath(urlNoQuery),
          properties: {
            enabled: false,
            unauthenticatedClientAction: null,
            clientId: null,
          },
        })
      );
    } else if (urlNoQuery.endsWith('/appsettings/list')) {
      return Observable.of(
        this._getFakeResponse({
          properties: {
            FUNCTIONS_EXTENSION_VERSION: 'beta',
            FUNCTION_APP_EDIT_MODE: 'readwrite',
          },
        })
      );
    } else if (urlNoQuery.endsWith('.svg')) {
      return super.send(method, url, body, etag, headers);
    } else if (pathParts.length === 5 && pathParts[4] === 'functions') {
      // Get a list of all functions in the environment
      return super.send(method, url, body, etag, headers);
    } else if (urlNoQuery.endsWith('/config/web')) {
      return Observable.of(null);
    } else if (urlNoQuery.endsWith('slots')) {
      return Observable.of(null);
    }

    if (this._whitelistedRPPrefixUrls.find(u => urlNoQuery.startsWith(u.toLowerCase()))) {
      // If we're sending a body to the RP or our passthrough, then we need to wrap it
      body = this._wrapPayloadIfNecessary(path, body, urlNoQuery);

      return super.send(method, url, body, etag, headers).map(r => {
        // Calls to Function management API's for embedded scenario's are wrapped with a standard API payload.
        // To keep the code somewhat clean, we intercept the response and unwrap each payload so that it looks as
        // similar as possible to Azure scenario's.  Not everything will be a one-to-one mapping between the two scenario's
        // but should have similar structure.
        urlNoQuery = this._getActualUrlNoQuery(urlNoQuery, body);
        let response: any = null;
        try {
          response = r.json();
        } catch (e) {}

        if (!response) {
          return this._getFakeResponse(null, r.text());
        } else if (response.value) {
          const values = response.value.map(v => {
            const payload = v.properties;
            return payload;
          });

          return this._getFakeResponse(values);
        } else if (response.properties) {
          const payload = response.properties;

          // File content API is a special case because it is normally a string response in Azure, but it's
          // wrapped as a subproperty in blueridge
          if (payload.content) {
            return this._getFakeResponse(null, payload.content);
          }

          return this._getFakeResponse(response.properties);
        }

        return r;
      });
    }

    if (this._whitelistedAPIMUrls.find(u => urlNoQuery.startsWith(u.toLowerCase()))) {
      return super.send(method, url, body, etag, headers);
    }

    if (this._whitelistedPathPrefix.find(u => path.startsWith(u.toLowerCase()))) {
      return super.send(method, url, body, etag, headers);
    }

    this._aiService.trackEvent('/arm-embedded/arm-send-failure', {
      uri: url,
    });

    throw new Error('[ArmEmbeddedService] URL rule not defined - send: ' + url);
  }

  private _getActualUrlNoQuery(urlNoQuery: string, body?: any) {
    if (urlNoQuery === NoCorsHttpService.passThroughUrl.toLowerCase() && body && body.url) {
      return body.url;
    }

    return urlNoQuery;
  }

  private _wrapPayloadIfNecessary(id: string, body: any, urlNoQuery: string) {
    if (urlNoQuery.toLowerCase() === NoCorsHttpService.passThroughUrl.toLowerCase() && body && body.body && !body.body.properties) {
      const pathParts = body.url.split('/').filter(part => !!part);
      body = JSON.parse(JSON.stringify(body));
      try {
        if (typeof body.body === 'string') {
          body.body = JSON.parse(body.body);
        }
      } catch (e) {}

      if (pathParts[pathParts.length - 2].toLowerCase() === 'files') {
        body.body = {
          properties: {
            content: body.body,
          },
        };
        body.headers['Content-Type'] = 'application/json';
      } else {
        body.body = {
          properties: body.body,
        };
      }
    } else if (urlNoQuery.toLowerCase() !== NoCorsHttpService.passThroughUrl.toLowerCase() && body && !body.properties) {
      const pathParts = id.split('/').filter(part => !!part);
      body = JSON.parse(JSON.stringify(body));
      try {
        if (typeof body === 'string') {
          body = JSON.parse(body);
        }
      } catch (e) {}

      if (pathParts[pathParts.length - 2].toLowerCase() === 'files') {
        body = {
          properties: {
            content: body,
          },
        };
      } else {
        body = {
          properties: body,
        };
      }
    }

    return body;
  }

  private _getFakeSiteObj(id: string, name: string) {
    return this._getFakeResponse({
      id: id,
      name: name,
      kind: 'functionapp',
      properties: {},
    });
  }

  private _getFakeResponse(jsonObj: any, text?: string): any {
    return {
      headers: {
        get: () => {
          return null;
        },
      },
      json: () => {
        return jsonObj;
      },
      text: () => {
        return text;
      },
    };
  }
}
