import { HttpMethods } from './../../shared/models/constants';
import { Component, Input, Output } from '@angular/core';
import { PairListOptions, Pair } from '../../controls/pair-list/pair-list.component';
import { Validators, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { Regex } from 'app/shared/models/constants';

export interface RequestResponseOverrriedModel {
    method: string;
    requestHeaders: Pair[];
    requestQueryParams: Pair[];
    responseHeaders: Pair[];
    statusCode: string;
    statusReason: string;
    body: string;
}

@Component({
    selector: 'request-respose-override',
    templateUrl: './request-respose-override.component.html',
    styleUrls: ['./request-respose-override.component.scss', '../../binding-input/binding-input.component.css']
})
export class RequestResposeOverrideComponent {
    headerOptions: PairListOptions;
    paramsOptions: PairListOptions;
    responseHeaderOptions: PairListOptions;
    availableMethods: string[] = [
        HttpMethods.POST,
        HttpMethods.GET,
        HttpMethods.DELETE,
        HttpMethods.HEAD,
        HttpMethods.PATCH,
        HttpMethods.PUT,
        HttpMethods.OPTIONS,
        HttpMethods.TRACE
    ];
    model: RequestResponseOverrriedModel;
    @Output() valueChanges = new Subject<any>();
    showResponse = false;
    showRequest = false
    private _requestHeadersValid: boolean;
    private _requestParamsValid: boolean;
    private _responseHeadersValid: boolean;
    private _originalModel: RequestResponseOverrriedModel;

    constructor() {
        this.initModel();
        this.initHeadresAndParams();
    }

    @Input() set proxy(value: any) {

        if (!value) {
            return;
        }

        this.initModel();

        if (value.requestOverrides) {
            for (var prop in value.requestOverrides) {
                this.addPair(value.requestOverrides, prop, "backend.request.headers.", this.model.requestHeaders);
                this.addPair(value.requestOverrides, prop, "backend.request.querystring.", this.model.requestQueryParams);
                if (prop.toLocaleLowerCase() === "backend.request.method") {
                    this.model.method = value.requestOverrides[prop];
                }
            }
        }

        if (value.responseOverrides) {
            for (var prop in value.responseOverrides) {
                this.addPair(value.responseOverrides, prop, "response.headers.", this.model.responseHeaders);
                if (prop.toLocaleLowerCase() === "response.statuscode") {
                    this.model.statusCode = value.responseOverrides[prop];
                }
                if (prop.toLocaleLowerCase() === "response.statusreason") {
                    this.model.statusReason = value.responseOverrides[prop];
                }
                if (prop.toLocaleLowerCase() === "response.body") {
                    if (typeof value.responseOverrides[prop] === 'string') {
                        this.model.body = value.responseOverrides[prop];
                    } else {
                        this.model.body = JSON.stringify(value.responseOverrides[prop]);
                    }
                }
            }
        }

        this._originalModel = JSON.parse(JSON.stringify(this.model));
        this.initHeadresAndParams();
    }

    private initHeadresAndParams() {
        const headerNameRegex = Regex.header;

        this.headerOptions = {
            items: this.model.requestHeaders,
            nameValidators: [Validators.required, Validators.pattern(headerNameRegex)]
        };

        this.paramsOptions = {
            items: this.model.requestQueryParams,
            nameValidators: [Validators.required, Validators.pattern(headerNameRegex)]
        };

        this.responseHeaderOptions = {
            items: this.model.responseHeaders,
            nameValidators: [Validators.required, Validators.pattern(headerNameRegex)]
        };
    }

    private initModel() {
        this.model = {
            method: 'no',
            requestHeaders: [],
            requestQueryParams: [],
            responseHeaders: [],
            statusCode: '',
            statusReason: '',
            body: ''
        };
    }

    paramsValueChanges(form: FormGroup) {
        this._requestParamsValid = form.valid;
        this.model.requestQueryParams = form.value.items;
        this.changeValue();
    }

    headerValueChanges(form: FormGroup) {
        this._requestHeadersValid = form.valid;
        this.model.requestHeaders = form.value.items;
        this.changeValue();
    }

    responseHeaderValueChanges(form: FormGroup) {
        this._responseHeadersValid = form.valid;
        this.model.responseHeaders = form.value.items;
        this.changeValue();
    }

    contentChanged(content: string) {
        this.model.body = content;
        this.changeValue();
    }

    showResponseOverride() {
        this.showResponse = !this.showResponse;
    }

    showRequestOverride() {
        this.showRequest = !this.showRequest;
    }

    get valid(): boolean {
        return this._requestHeadersValid && this._requestParamsValid && this._responseHeadersValid;
    }

    get dirty(): boolean {
        return (JSON.stringify(this.model) !== JSON.stringify(this._originalModel));
    }

    saveModel() {
        this._originalModel = JSON.parse(JSON.stringify(this.model));
    }

    discard() {
        this.model = JSON.parse(JSON.stringify(this._originalModel));
        this.initHeadresAndParams();
    }

    public changeValue() {
        // We need to genetate 'requestOverrides' object
        // The requestOverrides object defines changes that are made to the response that's passed back to the client. The object is defined by the following properties:
        // * response.statusCode: The HTTP status code to be returned to the client.
        // * response.statusReason: The HTTP reason phrase to be returned to the client.
        // * response.body: The string representation of the body to be returned to the client.
        // * response.headers.<HeaderName>: A header that can be set for the response to the client. Replace <HeaderName> with the name of the header that you want to set. If you provide the empty string, the header is not included on the response.

        // Values can reference application settings, parameters from the original client request, and parameters from the back-end response.
        // An example configuration might look like the following:
        // {
        //     "$schema": "http://json.schemastore.org/proxies",
        //     "proxies": {
        //         "proxy1": {
        //             "matchCondition": {
        //                 "methods": [ "GET" ],
        //                 "route": "/api/{test}"
        //             },
        //             "responseOverrides": {
        //                 "response.body": "Hello, {test}",
        //                 "response.headers.Content-Type": "text/plain"
        //             }
        //         }
        //     }
        // }
        const result = {
            requestOverrides: {},
            responseOverrides: {}
        };

        if (this.model.method && this.model.method !== 'no') {
            result['requestOverrides']['backend.request.method'] = this.model.method;
        }

        if (this.model.requestHeaders.length > 0) {
            this.model.requestHeaders.forEach((h) => {
                result['requestOverrides']['backend.request.headers.' + h.name] = h.value;
            });
        }

        if (this.model.requestQueryParams.length > 0) {
            this.model.requestQueryParams.forEach((p) => {
                result['requestOverrides']['backend.request.querystring.' + p.name] = p.value;
            });
        }

        if (this.model.statusCode) {
            result['responseOverrides']['response.statusCode'] = this.model.statusCode;
        }

        if (this.model.statusReason) {
            result['responseOverrides']['response.statusReason'] = this.model.statusReason;
        }

        if (this.model.body) {
            result['responseOverrides']['response.body'] = this.model.body;
        }

        if (this.model.responseHeaders.length > 0) {
            this.model.responseHeaders.forEach((h) => {
                result['responseOverrides']['response.headers.' + h.name] = h.value;
            });
        }

        if (Object.keys(result.requestOverrides).length === 0) {
            delete result.requestOverrides;
        }

        if (Object.keys(result.responseOverrides).length === 0) {
            delete result.responseOverrides;
        }

        this.valueChanges.next(result);
    }

    private addPair(obj: any, prop: string, startsWith: string, array: Pair[]) {
        if (prop.toLocaleLowerCase().startsWith(startsWith)) {
            const spltArray = prop.split('.');
            array.push({
                name: spltArray[spltArray.length - 1],
                value: obj[prop]
            });
        }
    }
}
