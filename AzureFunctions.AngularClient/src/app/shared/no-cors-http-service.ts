import { CacheService } from './services/cache.service';
import { Http, RequestOptionsArgs, Response, ResponseType, Headers } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';

import { AiService } from './services/ai.service';
import { ErrorEvent } from './models/error-event';
import { errorIds } from './models/error-ids';
import { PortalResources } from './models/portal-resources';
import { BroadcastService } from './services/broadcast.service';
import { FunctionsResponse } from './models/functions-response';
import { BroadcastEvent } from './models/broadcast-event';
import { Guid } from 'app/shared/Utilities/Guid';

export class NoCorsHttpService {
    constructor(
        private _cacheService: CacheService,
        private _http: Http,
        private _broadcastService: BroadcastService,
        private _aiService: AiService,
        private _translateService: TranslateService,
        private portalHeadersCallback: () => Headers) { }

    request(url: string, options: RequestOptionsArgs, force?: boolean): Observable<Response> {
        if (!options || !options.method) {
            throw Error('options and method are required');
        }

        return this._cacheService.send(url, options.method as string, force, options.headers, options.body)
            .catch(e => this.tryPassThroughController(e, options.method.toString(), url, options.body, options))
            .do(() => {
                if (options.method === 'PUT' || options.method === 'PATCH' || options.method === 'DELETE') {
                    this._cacheService.clearCachePrefix(this._getBaseUrl(url));
                }
            });
    }

    /**
     * Performs a request with `get` http method.
     */
    get(url: string, options?: RequestOptionsArgs, force?: boolean): Observable<Response> {
        return this._cacheService.get(url, force, options && options.headers ? options.headers : new Headers())
            .catch(e => this.tryPassThroughController(e, 'GET', url, null, options));
    }

    /**
     * Performs a request with `post` http method.
     * the default for `force` is true since it's not used for ARM requests, so caching POSTs is not correct.
     */
    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._cacheService.post(url, true, options && options.headers ? options.headers : new Headers(), body)
            .catch(e => this.tryPassThroughController(e, 'POST', url, body, options))
            .do(() => {
                this._cacheService.clearCachePrefix(this._getBaseUrl(url));
            });
    }

    /**
     * Performs a request with `put` http method.
     */
    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._cacheService.put(url, options && options.headers ? options.headers : new Headers(), body)
            .catch(e => this.tryPassThroughController(e, 'PUT', url, body, options))
            .do(() => {
                this._cacheService.clearCachePrefix(this._getBaseUrl(url));
            });
    }

    /**
     * Performs a request with `delete` http method.
     */
    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._cacheService.delete(url, options && options.headers ? options.headers : new Headers())
            .catch(e => this.tryPassThroughController(e, 'DELETE', url, null, options))
            .do(() => {
                this._cacheService.clearCachePrefix(this._getBaseUrl(url));
            });
    }

    /**
     * Performs a request with `patch` http method.
     */
    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._cacheService.patch(url, options && options.headers ? options.headers : new Headers())
            .catch(e => this.tryPassThroughController(e, 'PATCH', url, null, options))
            .do(() => {
                this._cacheService.clearCachePrefix(this._getBaseUrl(url));
            });
    }

    /**
     * Performs a request with `head` http method.
     */
    head(url: string, options?: RequestOptionsArgs, force?: boolean): Observable<Response> {
        return this._cacheService.head(url, force, options && options.headers ? options.headers : new Headers())
            .catch(e => this.tryPassThroughController(e, 'HEAD', url, null, options));
    }

    /**
     * Performs a request with `options` http method.
     */
    options(url: string, options?: RequestOptionsArgs, force?: boolean): Observable<Response> {
        return this._cacheService.options(url, force, options && options.headers ? options.headers : new Headers())
            .catch(e => this.tryPassThroughController(e, 'OPTIONS', url, null, options));
    }

    tryPassThroughController(error: FunctionsResponse, method: string, url: string, body: any, options: RequestOptionsArgs): Observable<any> {
        if (error.status === 0 && error.type === ResponseType.Error) {
            return this._http.get('/api/ping')
                .catch(_ => {
                    if (!error.isHandled) {
                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: this._translateService.instant(PortalResources.error_appOffline),
                            errorId: errorIds.applicationOffline,
                            resourceId: url
                        });
                        error.isHandled = true;
                    }
                    throw error;
                })
                .mergeMap(_ => {
                    const headers = {};
                    if (options && options.headers) {
                        options.headers.forEach((v, n) => {
                            headers[n] = v.join(',');
                        });
                    }
                    const passThroughBody = {
                        method: method,
                        url: url,
                        body: body,
                        headers: headers
                    };
                    const startTime = performance.now();
                    const logDependency = (success: boolean, status: number) => {
                        const endTime = performance.now();
                        this._aiService.trackDependency(Guid.newGuid(), passThroughBody.method, passThroughBody.url, passThroughBody.url, endTime - startTime, success, status);
                    };
                    return this._http.post('/api/passthrough', passThroughBody, { headers: this.portalHeadersCallback() })
                        .do(r => logDependency(true, r.status), e => logDependency(false, e.status))
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
                                    this._aiService.trackEvent(errorIds.passThroughApiError, content);
                                    throw error;
                                }
                            } else if (e.status === 403 && e.text().indexOf('This web app is stopped')) {
                                e.isHandled = true;
                            }
                            throw e;
                        });
                });
        } else {
            throw error;
        }
    }

    private _getBaseUrl(url: string) {
        const l = document.createElement('a');
        l.href = url;
        if (url.toLowerCase().startsWith('https')) {
            return `https://${l.hostname}`;
        } else {
            return `http://${l.hostname}`;
        }
    }
}
