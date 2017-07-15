import { Component, Input, Output} from '@angular/core';
import {PairListOptions, Pair } from '../../controls/pair-list/pair-list.component';
import {Validators, FormGroup} from '@angular/forms';
import {Constants} from '../../shared/models/constants';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import {FunctionApp} from '../../shared/function-app';

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
        Constants.httpMethods.POST,
        Constants.httpMethods.GET,
        Constants.httpMethods.DELETE,
        Constants.httpMethods.HEAD,
        Constants.httpMethods.PATCH,
        Constants.httpMethods.PUT,
        Constants.httpMethods.OPTIONS,
        Constants.httpMethods.TRACE
    ];
    model: RequestResponseOverrriedModel;
    @Input() functionApp: FunctionApp;
    @Output() valueChanges = new Subject<any>();
    private _requestHeadersValid: boolean;
    private _requestParamsValid: boolean;
    private _responseHeadersValid: boolean;
    private _originalModel: RequestResponseOverrriedModel;

    constructor(private _translateService: TranslateService) {
        this.initModel();
        this.initHeadresAndParams();
    }

    @Input() set proxy(value: any) {

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
                    this.model.body = value.responseOverrides[prop];
                }
            }
        }

        this._originalModel = JSON.parse(JSON.stringify(this.model));
        this.initHeadresAndParams();
    }

    private initHeadresAndParams() {
        const headerNameRegex = "^[a-zA-Z0-9\-]+$";

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
        }
    }

    private initModel() {
        this.model = {
            method: "no",
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
        var result = {
            requestOverrides: {},
            responseOverrides: {}
        };

        if (this.model.method) {
            result["requestOverrides"]["backend.request.method"] = this.model.method;
        }

        if (this.model.requestHeaders.length > 0) {
            this.model.requestHeaders.forEach((h) => {
                result["requestOverrides"]["backend.request.headers." + h.name] = h.value;
            });
        }

        if (this.model.requestQueryParams.length > 0) {
            this.model.requestQueryParams.forEach((p) => {
                result["requestOverrides"]["backend.request.querystring." + p.name] = p.value;
            });
        }

        if (this.model.statusCode) {
            result["responseOverrides"]["response.statusCode"] = this.model.statusCode;
        }

        if (this.model.statusReason) {
            result["responseOverrides"]["response.statusReason"] = this.model.statusReason;
        }

        if (this.model.body) {
            result["responseOverrides"]["response.body"] = this.model.body;
        }

        if (this.model.responseHeaders.length > 0) {
            this.model.responseHeaders.forEach((h) => {
                result["responseOverrides"]["response.headers." + h.name] = h.value;
            });
        }

        if (!result.requestOverrides) {
            delete result.requestOverrides;
        }

        if (!result.responseOverrides) {
            delete result.responseOverrides;
        }

        this.valueChanges.next(result);
    }

    private addPair(obj: any, prop: string, startsWith: string, array: Pair[]) {
        if (prop.toLocaleLowerCase().startsWith(startsWith)) {
            var spltArray = prop.split('.');
            array.push({
                name: spltArray[spltArray.length - 1],
                value: obj[prop]
            });
        }
    }
}
