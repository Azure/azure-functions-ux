import {ExceptionHandler, Inject} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {ErrorEvent} from '../models/error-event';

export class FunctionsExceptionHandler extends ExceptionHandler {

    constructor(@Inject(Http) private _http: Http, @Inject(BroadcastService) private _broadcastService: BroadcastService) {
        super(console, true);
    }

    call(error) {
        this._broadcastService.clearBusyState();
        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: this.getErrorMessage(error), details: this.getErrorDetails(error) });
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