import { FunctionInfo } from './../models/function-info';
import { ArmArrayResult } from './../models/arm/arm-obj';
import { NoCorsHttpService } from './../no-cors-http-service';
import { Url } from './../Utilities/url';
// import { Regex } from './../models/constants';
import { Observable } from 'rxjs/Observable';
import { AiService } from './ai.service';
import { UserService } from './user.service';
import { Http, Headers, Response } from '@angular/http';

import { Injectable } from '@angular/core';
import { ArmService } from './arm.service';
// import { Constants } from 'app/shared/models/constants';

@Injectable()
export class ArmEmbeddedService extends ArmService {
    public static url = 'https://blueridge-tip1-rp-westus.azurewebsites.net';

    private _whitelistedRPPrefixUrls: string[] = [
        ArmEmbeddedService.url,
        NoCorsHttpService.passThroughUrl
    ];

    constructor(http: Http,
        userService: UserService,
        aiService: AiService) {

        super(http, userService, aiService);
    }

    send(method: string, url: string, body?: any, etag?: string, headers?: Headers): Observable<Response> {
        let urlNoQuery = url.toLowerCase().split('?')[0];
        const path = Url.getPath(urlNoQuery);
        const pathParts = path.split('/').filter(part => !!part);

        if (pathParts.length === 8 && pathParts[6] === 'entities') {
            return Observable.of(this._getFakeSiteObj(path, pathParts[7]));
        }

        if (urlNoQuery.endsWith('/config/authsettings/list')) {
            return Observable.of(this._getFakeResponse({
                id: Url.getPath(urlNoQuery),
                properties: {
                    enabled: false,
                    unauthenticatedClientAction: null,
                    clientId: null,
                }
            }));
        } else if(urlNoQuery.endsWith('/appsettings/list')){
            return Observable.of(this._getFakeResponse({
                properties: {
                    FUNCTIONS_EXTENSION_VERSION: '~1',
                    FUNCTION_APP_EDIT_MODE: 'readwrite'
                }
            }));
        } else if (urlNoQuery.endsWith('.svg')) {
            return super.send(method, url, body, etag, headers);
        }

        if (this._whitelistedRPPrefixUrls.find(u => urlNoQuery.startsWith(u.toLowerCase()))) {

            // If we're sending a body to the RP or our passthrough, then we need to wrap it
            body = this._wrapPayloadIfNecessary(path, body, urlNoQuery);

            return super.send(method, url, body, etag, headers)
                .map(r => {
                    // Calls to Function management API's for embedded scenario's are wrapped with a standard API payload.
                    // To keep the code somewhat clean, we intercept the response and unwrap each payload so that it looks as
                    // similar as possible to Azure scenario's.  Not everything will be a one-to-one mapping between the two scenario's 
                    // but should have similar structure.
                    urlNoQuery = this._getActualUrlNoQuery(urlNoQuery, body);
                    const response = r.json();
                    if (response.value) {

                        if (urlNoQuery.endsWith('/functions')) {
                            return this._getFakeFunctionsResponse(urlNoQuery, response);
                        }

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

        this._aiService.trackEvent('/try/arm-send-failure', {
            uri: url
        });

        throw new Error('[ArmTryService] - send: ' + url);
    }

    private _getActualUrlNoQuery(urlNoQuery: string, body?: any) {
        if (urlNoQuery === NoCorsHttpService.passThroughUrl.toLowerCase()
            && body
            && body.url) {
            return body.url;
        }

        return urlNoQuery;
    }

    // TODO: ellhamai - need to cleanup this function and add support for setting file content API content-type header.
    private _wrapPayloadIfNecessary(id: string, body: any, urlNoQuery: string) {

        if (urlNoQuery.toLowerCase() === NoCorsHttpService.passThroughUrl.toLowerCase() && body && body.body) {
            const pathParts = body.url.split('/').filter(part => !!part);
            body = JSON.parse(JSON.stringify(body));

            if (pathParts[pathParts.length - 2].toLowerCase() === 'files') {
                body.body = {
                    properties: {
                        content: body.body
                    }
                };
                body.headers['Content-Type'] = 'application/json';
            } else {
                body.body = {
                    properties: body.body
                };

            }

        } else if (urlNoQuery.toLowerCase() !== NoCorsHttpService.passThroughUrl.toLowerCase() && body) {
            const pathParts = id.split('/').filter(part => !!part);
            body = JSON.parse(JSON.stringify(body));
            if (pathParts[pathParts.length - 2].toLowerCase() === 'files') {
                body = {
                    properties: {
                        content: body
                    }
                };
            } else {
                body = {
                    properties: body
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
            properties: {

            }
        });
    }

    private _getFakeFunctionsResponse(urlNoQuery: string, functionObjs: ArmArrayResult<FunctionInfo>) {
        const hostName = Url.getHostName(urlNoQuery);

        const fcs = functionObjs.value.map(functionObj => {
            const f = functionObj.properties;

            f.script_root_path_href = `https://${hostName}${functionObj.id}`;
            f.script_href = `https://${hostName}${f.script_href}`;
            f.config_href = `${f.script_root_path_href}function.json`;
            f.secrets_file_href = null;
            f.href = `${urlNoQuery}/${f.name}`;

            return f;
        });

        return this._getFakeResponse(fcs);
    }

    private _getFakeResponse(jsonObj: any, text?: string): any {
        return {
            headers: {
                get: () => {
                    return null;
                }
            },
            json: () => {
                return jsonObj;
            },
            text: () => {
                return text;
            }
        };
    }
}

