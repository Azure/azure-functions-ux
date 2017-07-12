import {Component, Input, Inject, ElementRef, Output, EventEmitter, ViewChildren, QueryList} from '@angular/core';
import {HttpRunModel, Param} from '../shared/models/http-run';
import {BindingType} from '../shared/models/binding'
import {FunctionInfo} from '../shared/models/function-info';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';
import {Constants} from '../shared/models/constants';
import {URLSearchParams} from '@angular/http';
import {PairListOptions } from '../controls/pair-list/pair-list.component';
import {Validators, FormGroup} from '@angular/forms';


@Component({
  selector: 'run-http',
  templateUrl: './run-http.component.html',
  styleUrls: ['./run-http.component.scss', '../function-dev/function-dev.component.scss'],
  inputs: ['functionInfo', 'functionInvokeUrl']
})
export class RunHttpComponent {
    @Output() validChange = new EventEmitter<boolean>();
    @Output() disableTestData = new EventEmitter<boolean>();
    model: HttpRunModel = new HttpRunModel();
    valid: boolean;
    availableMethods: string[] = [];
    headerOptions: PairListOptions;
    paramsOptions: PairListOptions;
    private _code: Param;
    private _headersValid: boolean;
    private _paramsValid: boolean;


    constructor(private _translateService: TranslateService) {
    }

    set functionInfo(value: FunctionInfo) {
        this.model = undefined;
        if (value.test_data) {
            try {
                this.model = JSON.parse(value.test_data);
                // Check if it's valid model
                if (!Array.isArray(this.model.headers)) {
                    this.model = undefined;
                }
            } catch (e) {
                this.model = undefined;
            }
        }

        var httpTrigger = value.config.bindings.find(b => {
            return b.type === BindingType.httpTrigger.toString();
        });

        this.availableMethods = [];
        if (httpTrigger.methods) {
            httpTrigger.methods.forEach((m) => {
                this.availableMethods.push(m);
            });
        } else {
            this.availableMethods = [
                Constants.httpMethods.POST,
                Constants.httpMethods.GET,
                Constants.httpMethods.DELETE,
                Constants.httpMethods.HEAD,
                Constants.httpMethods.PATCH,
                Constants.httpMethods.PUT,
                Constants.httpMethods.OPTIONS,
                Constants.httpMethods.TRACE
            ];
        }

        if (this.model === undefined) {
            this.model = new HttpRunModel();
            this.model.method = Constants.httpMethods.POST;
            this.model.body = value.test_data;
        }
        if (!this.model.method && this.availableMethods.length > 0) {
            this.model.method = this.availableMethods[0];
        }

    }

    set functionInvokeUrl(value: string) {
        if (value) {
            // Store "code" aithentication parameter 
            var params = this.getQueryParams(value);
            var codeIndex = params.findIndex(p => (p.name.toLowerCase() === "code"));
            if (codeIndex > -1) {
                this._code = params[codeIndex];
                params.splice(codeIndex, 1);
            }

            var pathParams = this.getPathParams(value);
            params = pathParams.concat(params);
            params.forEach((p) => {
                var findResult = this.model.queryStringParams.find((qp) => {
                    return qp.name === p.name;
                });

                if (!findResult) {
                    this.model.queryStringParams.splice(0,0, p);
                }
            });
        }
        this.headerOptions = {
            items: this.model.headers,
            nameValidators: [Validators.required, Validators.pattern("^[a-zA-Z0-9\-]+$")]
        };

        this.paramsOptions = {
            items: this.model.queryStringParams,
            nameValidators: [Validators.required, Validators.pattern("^[a-zA-Z0-9\-]+$")]
        };

    }


    onChangeMethod(method: string) {
        this.disableTestData.emit((method.toLowerCase() === 'get' ||
            method.toLowerCase() === 'delete' ||
            method.toLowerCase() === 'head' ||
            method.toLowerCase() === 'options'));
    }

    headerValueChanges(form: FormGroup) {
        this._headersValid = form.valid;
        this.valid = this._paramsValid && this._headersValid;
        this.model.headers = form.value.items;
        this.validChange.emit(this.valid);
    }

    paramsValueChanges(form: FormGroup) {
        this._paramsValid = form.valid;
        this.valid = this._paramsValid && this._headersValid;
        this.model.queryStringParams = form.value.items;
        if (this._code) {
            this.model.queryStringParams.push(this._code);
        }

        this.validChange.emit(this.valid);
    }

    private getQueryParams(url: string): Param[] {

        var result = [];
        var urlCopy = url;


        // Remove path params
        var regExp = /\{([^}]+)\}/g;
        var matches = urlCopy.match(regExp);
        if (matches) {
            matches.forEach((m) => {
                urlCopy = urlCopy.replace(m, "");
            });
        }

        var indexOf = urlCopy.indexOf('?');
        if (indexOf > 0) {
            var usp = new URLSearchParams(urlCopy.substring(indexOf + 1, urlCopy.length));
            usp.paramsMap.forEach((value, key) => {
                value.forEach((v) => {
                    result.push({
                        name: decodeURIComponent(key),
                        value: decodeURIComponent(v)
                    });
                });
            });
        }

        return result;
    }

    private getPathParams(url: string): Param[] {
        var regExp = /\{([^}]+)\}/g;

        var matches = url.match(regExp);
        var result = [];

        if (matches) {
            matches.forEach((m) => {
                var splitResult = m.split(":");
                result.push({
                    name: splitResult[0].replace("{", "").replace("}", ""),
                    value: ""
                });
            });
        }

        return result;
    }
}
