import { HttpMethods } from './../shared/models/constants';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { HttpRunModel, Param } from '../shared/models/http-run';
import { BindingType } from '../shared/models/binding'
import { FunctionInfo } from '../shared/models/function-info';
import { Regex } from '../shared/models/constants';
import { URLSearchParams } from '@angular/http';
import { PairListOptions } from '../controls/pair-list/pair-list.component';
import { Validators, FormGroup } from '@angular/forms';


@Component({
    selector: 'run-http',
    templateUrl: './run-http.component.html',
    styleUrls: ['./run-http.component.scss', '../function-dev/function-dev.component.scss']
})
export class RunHttpComponent {
    @Output() validChange = new EventEmitter<boolean>();
    @Output() disableTestData = new EventEmitter<boolean>();

    model: HttpRunModel;
    key: Param;
    valid: boolean;
    availableMethods: string[] = [];
    headerOptions: PairListOptions;
    paramsOptions: PairListOptions;

    private _headersValid: boolean;
    private _paramsValid: boolean;

    @Input()
    set functionInfo(value: FunctionInfo) {
        this.model = undefined;
        if (value.test_data) {
            try {
                this.model = JSON.parse(value.test_data);

                // NOTE(michinoy): delete the code from mode object if it exists.
                // this will prevent it from showing up in the sampledata file.
                if (this.model && this.model['code']) {
                    delete this.model['code'];
                }

                // Check if it's valid model
                if (!Array.isArray(this.model.headers)) {
                    this.model = undefined;
                }
            } catch (e) {
                this.model = undefined;
            }
        }

        const httpTrigger = value.config.bindings.find(b => {
            return b.type === BindingType.httpTrigger.toString();
        });

        this.availableMethods = [];
        if (httpTrigger.methods) {
            httpTrigger.methods.forEach((m) => {
                this.availableMethods.push(m);
            });
        } else {
            this.availableMethods = [
                HttpMethods.POST,
                HttpMethods.GET,
                HttpMethods.DELETE,
                HttpMethods.HEAD,
                HttpMethods.PATCH,
                HttpMethods.PUT,
                HttpMethods.OPTIONS,
                HttpMethods.TRACE
            ];
        }

        if (this.model === undefined) {
            this.model = {
                method: HttpMethods.POST,
                body: value.test_data
            };
        }
        if (!this.model.method && this.availableMethods.length > 0) {
            this.model.method = this.availableMethods[0];
        }

        // make sure to call this when FunctionInfo changes because that could also change the default method.
        this.onChangeMethod(this.model.method);
    }

    @Input()
    set functionInvokeUrl(value: string) {
        if (value) {
            // Store "code" aithentication parameter
            let params = this.getQueryParams(value);
            const codeIndex = params.findIndex(p => (p.name.toLowerCase() === 'code'));
            if (codeIndex > -1) {
                this.key = params[codeIndex];
                params.splice(codeIndex, 1);
            }

            const pathParams = this.getPathParams(value);
            params = pathParams.concat(params);
            params.forEach((p) => {
                const findResult = this.model.queryStringParams.find((qp) => {
                    return qp.name === p.name;
                });

                if (!findResult) {
                    this.model.queryStringParams.splice(0, 0, p);
                }
            });
        }
        this.headerOptions = {
            items: this.model.headers || [],
            nameValidators: [Validators.required, Validators.pattern(Regex.header)]
        };

        this.paramsOptions = {
            items: this.model.queryStringParams || [],
            nameValidators: [Validators.required, Validators.pattern(Regex.queryParam)]
        };

    }

    onChangeMethod(method: string) {
        const methodLowCase = method.toLowerCase();
        this.disableTestData.emit((method.toLowerCase() === 'get' ||
            methodLowCase === 'delete' ||
            methodLowCase === 'head' ||
            methodLowCase === 'options'));
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
        this.validChange.emit(this.valid);
    }

    private getQueryParams(url: string): Param[] {

        const result = [];
        let urlCopy = url;

        // Remove path params
        const regExp = /\{([^}]+)\}/g;
        const matches = urlCopy.match(regExp);
        if (matches) {
            matches.forEach((m) => {
                urlCopy = urlCopy.replace(m, '');
            });
        }

        const indexOf = urlCopy.indexOf('?');
        if (indexOf > 0) {
            const usp = new URLSearchParams(urlCopy.substring(indexOf + 1, urlCopy.length));
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
        const regExp = /\{([^}]+)\}/g;

        const matches = url.match(regExp);
        const result = [];

        if (matches) {
            matches.forEach((m) => {
                const splitResult = m.split(':');
                result.push({
                    name: splitResult[0].replace('{', '').replace('}', ''),
                    value: ''
                });
            });
        }

        return result;
    }
}
