import {ExceptionHandler, Inject} from 'angular2/core';
import {Http, Headers} from 'angular2/http';

export class FunctionsExceptionHandler extends ExceptionHandler {

    constructor(@Inject(Http) private _http: Http) { super(console, true); }

    call(error) {
        var body = {
            message: error.message,
            stackTrace: error.stack
        };

        console.error('Reporting the following errors');
        console.error(error);
        this._http.post('api/clienterror', JSON.stringify(body), { headers: this.getHeaders() })
            .subscribe(r => {
                console.log('Reported error successfully');
            }, e => { console.error('Can\'t report error: ' + JSON.stringify(e)) });
    }

    private getHeaders(contentType?: string): Headers {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}