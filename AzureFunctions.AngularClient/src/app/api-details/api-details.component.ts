import {Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {ApiProxy} from '../shared/models/api-proxy';
import {FunctionsService} from '../shared/services/functions.service';
import {FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import {PortalResources} from '../shared/models/portal-resources';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {FunctionContainer} from '../shared/models/function-container';
import {ApiNewComponent} from '../api-new/api-new.component';

@Component({
    selector: 'api-details',
    templateUrl: './api-details.component.html',
    styleUrls: [/*'./api-details.component.css',*/ '../api-new/api-new.component.css', '../binding-input/binding-input.component.css'],
    inputs: ['apiProxyEdit', 'functionContainer']
})
export class ApiDetailsComponent implements OnInit {
    @Input() apiProxies: ApiProxy[];    
    complexForm: FormGroup;
    isMethodsVisible: boolean = false;
    proxyUrl: string;
    isEnabled: boolean;
    private _apiProxyEdit: ApiProxy;
    private _functionContainer: FunctionContainer;
    @Output() private functionAppSettingsClicked: EventEmitter<any> = new EventEmitter<any>();

    constructor(private _fb: FormBuilder,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService) {
        this.initComplexFrom();
    }

   

    onFunctionAppSettingsClicked(event: any) {
        this.functionAppSettingsClicked.emit(event);
    }

    set functionContainer(value: FunctionContainer) {
        this._functionContainer = value;
        this.setProxyUrl();
    }

    set apiProxyEdit(value: ApiProxy) {
        this._apiProxyEdit = value;

        this.complexForm.patchValue({
            backendUri: this._apiProxyEdit.backendUri,
            routeTemplate: this._apiProxyEdit.matchCondition.route,
            methodSelectionType: !this._apiProxyEdit.matchCondition.methods || this._apiProxyEdit.matchCondition.methods.length === 0 ? "All" : "Selected",
        });

        this.setProxyUrl();

        var methods = {}
        methods["method_GET"]  = false;
        methods["method_POST"] = false;
        methods["method_DELETE"] = false;
        methods["method_HEAD"] =  false;
        methods["method_PATCH"] = false;
        methods["method_PUT"] = false;
        methods["method_OPTIONS"] = false;
        methods["method_TRACE"] = false;

        if (this._apiProxyEdit.matchCondition.methods) {
            this._apiProxyEdit.matchCondition.methods.forEach((m) => {
                methods["method_" + m.toUpperCase()] = true;
            });

            this.complexForm.patchValue(methods);
        }
    }

    get apiProxyEdit(): ApiProxy {
        return this._apiProxyEdit;
    }

    ngOnInit() {
    }

    deleteProxyClicked() {
        this._globalStateService.setBusyState();
        this._functionsService.getApiProxies().subscribe(proxies => {

            this.apiProxies = ApiProxy.fromJson(proxies);
            var indexToDelete = this.apiProxies.findIndex((p) => {
                return p.name === this._apiProxyEdit.name;
            });

            this.apiProxies.splice(indexToDelete, 1);

            this._functionsService.saveApiProxy(ApiProxy.toJson(this.apiProxies, this._translateService)).subscribe(() => {
                this._globalStateService.clearBusyState();
                this._broadcastService.broadcast(BroadcastEvent.ApiProxyDeleted, this._apiProxyEdit);
            });
        });
    }

    onCancelClick() {
        this.apiProxyEdit = this._apiProxyEdit;
    }

    onReset() {
        this.initComplexFrom();
        this.apiProxyEdit = this.apiProxyEdit;
        this._broadcastService.clearDirtyState('api-proxy', true);
     }

    submitForm(value: any) {

        if (this.complexForm.valid) {
            this._globalStateService.setBusyState();

            this._apiProxyEdit.backendUri = this.complexForm.controls["backendUri"].value;
            this._apiProxyEdit.matchCondition.route = this.complexForm.controls["routeTemplate"].value;
            this._apiProxyEdit.matchCondition.methods = [];

            this._functionsService.getApiProxies().subscribe(proxies => {
                this.apiProxies = ApiProxy.fromJson(proxies);
                var index = this.apiProxies.findIndex((p) => {
                    return p.name === this._apiProxyEdit.name;
                });

                if (index > -1) {
                    if (this.complexForm.controls["methodSelectionType"].value !== "All") {
                        for (var control in this.complexForm.controls) {
                            if (control.startsWith("method_")) {
                                if (this.complexForm.controls[control].value) {
                                    this._apiProxyEdit.matchCondition.methods.push(control.replace("method_", "").toUpperCase());
                                }
                            }
                        }
                    }
                    this.apiProxies[index] = this._apiProxyEdit;
                }

                this._functionsService.saveApiProxy(ApiProxy.toJson(this.apiProxies, this._translateService)).subscribe(() => {
                    this._globalStateService.clearBusyState();
                    this._broadcastService.broadcast(BroadcastEvent.ApiProxyUpdated, this._apiProxyEdit);
                    this.onReset();
                });
            });
        }
    }

    private setProxyUrl() {
        if (this._apiProxyEdit && this._functionContainer) {

            var route = (this._apiProxyEdit.matchCondition.route) ? this._apiProxyEdit.matchCondition.route : '/api/' + this._apiProxyEdit.name;
            if (!route.startsWith('/')) {
                route = '/' + route;
            }

            this.proxyUrl = `https://${this._functionContainer.properties.hostNameSslStates.find(s => s.hostType === 0).name}` + route;
        }
    }

    private initComplexFrom() {

        this.complexForm = this._fb.group({
            routeTemplate: [null, Validators.required],
            methodSelectionType: 'All',
            backendUri: [null, Validators.compose([Validators.required, ApiNewComponent.validateUrl()])],
            proxyUrl: '',
            method_GET: false,
            method_POST: false,
            method_DELETE: false,
            method_HEAD: false,
            method_PATCH: false,
            method_PUT: false,
            method_OPTIONS: false,
            method_TRACE: false
        });

        this.complexForm.controls["methodSelectionType"].valueChanges.subscribe((value) => {
            this.isMethodsVisible = !(value === 'All');
        });

        this.complexForm.valueChanges.subscribe(() => {
            if (this.complexForm.dirty) {
                this._broadcastService.setDirtyState('api-proxy');
            }
        });

        this.isEnabled = this._globalStateService.IsRoutingEnabled;
    }
}
