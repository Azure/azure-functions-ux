import { Http, RequestOptionsArgs, Response, ResponseType, Headers } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';

import { AiService } from './services/ai.service';
import { ErrorEvent, ErrorType } from './models/error-event';
import { ErrorIds } from './models/error-ids';
import { PortalResources } from './models/portal-resources';
import { BroadcastService } from './services/broadcast.service';
import { FunctionsResponse } from './models/functions-response';
import { BroadcastEvent } from './models/broadcast-event';

export class NoCorsHttpService {
    constructor(
        private _http: Http,
        private _broadcastService: BroadcastService,
        private _aiService: AiService,
        private _translateService: TranslateService,
        private portalHeadersCallback: () => Headers) { }

    request(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.request(url, options)
            .catch(e => this.tryPassThroughController(e, options.method.toString(), url, options.body, options));
    }

    /**
     * Performs a request with `get` http method.
     */
    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.get(url, options)
            .catch(e => this.tryPassThroughController(e, 'GET', url, null, options));
    }

    /**
     * Performs a request with `post` http method.
     */
    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.post(url, body, options)
            .catch(e => this.tryPassThroughController(e, 'POST', url, body, options));
    }

    /**
     * Performs a request with `put` http method.
     */
    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.put(url, body, options)
            .catch(e => this.tryPassThroughController(e, 'PUT', url, body, options));
    }

    /**
     * Performs a request with `delete` http method.
     */
    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.delete(url, options)
            .catch(e => this.tryPassThroughController(e, 'DELETE', url, null, options));
    }

    /**
     * Performs a request with `patch` http method.
     */
    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.patch(url, body, options)
            .catch(e => this.tryPassThroughController(e, 'PATCH', url, null, options));
    }

    /**
     * Performs a request with `head` http method.
     */
    head(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.head(url, options)
            .catch(e => this.tryPassThroughController(e, 'HEAD', url, null, options));
    }

    /**
     * Performs a request with `options` http method.
     */
    options(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.options(url, options)
            .catch(e => this.tryPassThroughController(e, 'OPTIONS', url, null, options));
    }

    tryPassThroughController(error: FunctionsResponse, method: string, url: string, body: any, options: RequestOptionsArgs): Observable<any> {
        if (error.status === 0 && error.type === ResponseType.Error) {
            return this._http.get('/api/ping')
                .catch(_ => {
                    if (!error.isHandled) {
                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: this._translateService.instant(PortalResources.error_appOffline),
                            errorId: ErrorIds.applicationOffline,
                            errorType: ErrorType.Fatal,
                            resourceId: url
                        });
                        error.isHandled = true;
                    }
                    throw error;
                })
                .mergeMap(_ => {
                    let headers = {};
                    if (options && options.headers) {
                        options.headers.forEach((v, n) => {
                            headers[n] = v.join(',');
                        });
                    }
                    let passThroughBody = {
                        method: method,
                        url: url,
                        body: body,
                        headers: headers
                    };
                    return this._http.post('/api/passthrough', passThroughBody, { headers: this.portalHeadersCallback() })
                        .catch((e: FunctionsResponse) => {
                            if (e.status === 400) {
                                let content: { reason: string, exception: any } = null;
                                try {
                                    content = e.json();
                                } catch (e) {
                                    content = null;
                                }

                                if (content && content.reason && content.reason === 'PassThrough') {
                                    // this means there was a /passthrough specific error, so log it and throw the original error.
                                    this._aiService.trackEvent(ErrorIds.passThroughApiError, content);
                                    throw error;
                                }
                            }
                            throw e;
                        });
                });
        } else {
            throw error;
        }
    }
}
