import {ExceptionHandler, Inject} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {ErrorEvent} from '../models/error-event';
import {GlobalStateService} from '../services/global-state.service';

export class FunctionsExceptionHandler extends ExceptionHandler {

    constructor(
        @Inject(Http) private _http: Http,
        @Inject(BroadcastService) private _broadcastService: BroadcastService,
        @Inject(GlobalStateService) private _globalStateService: GlobalStateService) {
        super(console, true);
    }

    call(error) {
        console.log(error);
        this._globalStateService.clearBusyState();
        let errorMessage = this.getErrorMessage(error);
        let errorDetails = this.getErrorDetails(error);
        if (errorMessage.indexOf('NONUSRACT') === -1 &&
            errorMessage.indexOf('USRACT') === -1) {
            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: errorMessage, details: errorDetails });
        }
    }

    private getErrorMessage(error: any): string {
        if (error._body) {
            try {
                var response = JSON.parse(error._body);
                if (response.ExceptionMessage || response.Message) {
                    return response.ExceptionMessage || response.Message;
                } else if (response.error && response.error.message) {
                    return response.error.message;
                } else {
                    return undefined;
                }
            } catch (e) {
                return undefined;
            }
        } else if (error.message) {
            return error.message;
        } else {
            return undefined;
        }
    }


    private getErrorDetails(error: any): string {
        try {
            return JSON.stringify(error);
        } catch (e) {
            return error + '';
        }
    }

    private getHeaders(contentType?: string): Headers {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}