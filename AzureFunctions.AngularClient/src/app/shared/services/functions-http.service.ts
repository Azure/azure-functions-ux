import { ErrorIds } from './../models/error-ids';
import { ErrorEvent, ErrorType } from './../models/error-event';
import { PortalResources } from './../models/portal-resources';
import { AiService } from './ai.service';
import { TranslateService } from 'ng2-translate';
import { BroadcastService } from './broadcast.service';
import { ArmService } from './arm.service';
import { Observable } from 'rxjs/Rx';
import { FunctionsResponse } from './../models/functions-response';
import { Injectable } from '@angular/core';
import { Http, Request, Response, RequestOptionsArgs, ResponseType, ConnectionBackend, RequestOptions } from '@angular/http';
import { BroadcastEvent } from '../models/broadcast-event';

@Injectable()
export class FunctionsHttpService {

    constructor(private _http: Http,
                private _armService: ArmService,
                private _broadcastService: BroadcastService,
                private _translateService: TranslateService,
                private _aiService: AiService) {

    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.request(url, options)
            .catch(e => this.checkCorsError(e));
    }

    /**
     * Performs a request with `get` http method.
     */
    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.get(url, options)
            .catch(e => this.checkCorsError(e));
    }

    /**
     * Performs a request with `post` http method.
     */
    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.post(url, body, options)
            .catch(e => this.checkCorsError(e));
    }

    /**
     * Performs a request with `put` http method.
     */
    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.put(url, body, options)
            .catch(e => this.checkCorsError(e));
    }

    /**
     * Performs a request with `delete` http method.
     */
    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.delete(url, options)
            .catch(e => this.checkCorsError(e));
    }

    /**
     * Performs a request with `patch` http method.
     */
    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.patch(url, body, options)
            .catch(e => this.checkCorsError(e));
    }

    /**
     * Performs a request with `head` http method.
     */
    head(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.head(url, options)
            .catch(e => this.checkCorsError(e));
    }

    /**
     * Performs a request with `options` http method.
     */
    options(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._http.options(url, options)
            .catch(e => this.checkCorsError(e));
    }

    private checkCorsError(error: FunctionsResponse): Observable<FunctionsResponse> {
        if (!error.isHandled && error.status === 0 && error.type === ResponseType.Error) {
             this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                     message: this._translateService.instant(PortalResources.error_CORSNotConfigured, { origin: window.location.origin }),
                     details: JSON.stringify(error),
                     errorId: ErrorIds.corsNotConfigured,
                     errorType: ErrorType.RuntimeError
                 });
             error.isHandled = true;
        }
        throw error;
    }
}
