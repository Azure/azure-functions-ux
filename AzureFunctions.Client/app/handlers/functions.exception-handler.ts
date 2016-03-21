import {ExceptionHandler, Inject} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {BroadcastEvent, IBroadcastService} from '../services/ibroadcast.service';

export class FunctionsExceptionHandler extends ExceptionHandler {

    constructor(@Inject(Http) private _http: Http, @Inject(IBroadcastService) private _broadcastService: IBroadcastService) {
        super(console, true);
    }

    call(error) {
        var body = {
            message: error.message,
            stackTrace: error.stack
        };

        this._broadcastService.clearBusyState();
        this._broadcastService.broadcast(BroadcastEvent.Error, this.getErrorMessage(error));

        console.error('Reporting the following errors');
        console.error(error);
        this._http.post('api/clienterror', JSON.stringify(body), { headers: this.getHeaders() })
            .subscribe(r => {
                console.log('Reported error successfully');
            }, e => { console.error('Can\'t report error: ' + JSON.stringify(e)) });
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
                    return JSON.stringify(response);
                }
            } catch (e) {
                return error._body + '';
            }
        } else if (error.message) {
            return error.message;
        } else if (error.stack) {
            return error.stack
        } else {
            return JSON.stringify(error);
        }
    }

    private getHeaders(contentType?: string): Headers {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}