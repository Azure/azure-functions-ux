import {Component, OnInit, Input } from '@angular/core';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {ApiProxy} from '../shared/models/api-proxy';
import {FunctionsService} from '../shared/services/functions.service';
import {FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import {PortalResources} from '../shared/models/portal-resources';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event';

@Component({
    selector: 'api-details',
    templateUrl: './api-details.component.html',
    styleUrls: ['./api-details.component.css', '../binding-input/binding-input.component.css'],
    inputs: ['apiProxyEdit']
})
export class ApiDetailsComponent implements OnInit {
    @Input() apiProxies: ApiProxy[];
    //@Input() type: string;
    complexForm: FormGroup;
    isMethodsVisible: boolean = false;
    requireMessage: string;
    private _apiProxyEdit: ApiProxy;

    set apiProxyEdit(value: ApiProxy) {
        this._apiProxyEdit = value;

        this.complexForm.patchValue({
            backendUri: this._apiProxyEdit.backendUri,
            routeTemplate: this._apiProxyEdit.matchCondition.route,
            methodSelectionType: !this._apiProxyEdit.matchCondition.methods || this._apiProxyEdit.matchCondition.methods.length === 0 ? "All" : "Selected",
            proxyUrl: "proxy URL"
        });

        if (this._apiProxyEdit.matchCondition.methods) {
            var methods = {};

            this._apiProxyEdit.matchCondition.methods.forEach((m) => {
                methods["method_" + m.toLocaleLowerCase()] = true;
            });

            this.complexForm.patchValue(methods);
        }
    }

    get apiProxyEdit(): ApiProxy {
        return this._apiProxyEdit;
    }

    constructor(fb: FormBuilder,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService) {

        this.complexForm = fb.group({
            routeTemplate: '',
            methodSelectionType: 'All',
            //name: [null, Validators.compose([Validators.required, this.validateName(this)])],
            backendUri: [null, Validators.required],
            proxyUrl: '',
            method_get: true,
            method_post: true,
            method_delete: true,
            method_head: true,
            method_patch: true, 
            method_put: true,
            method_options: true,
            method_trace: true
        });

        this.complexForm.controls["methodSelectionType"].valueChanges.subscribe((value) => {
            this.isMethodsVisible = !(value === 'All');
        });

        this.requireMessage = this._translateService.instant(PortalResources.filedRequired);
    }

    //validateName(that: ApiDetailsComponent): ValidatorFn {        

    //    return (control: AbstractControl): { [key: string]: any } => {
    //        var existingProxy = null;
    //        if (that.complexForm) {
    //            var name = control.value;
    //            if (that.apiProxies && name) {
    //                existingProxy = that.apiProxies.find((p) => {
    //                    return p.name === name;
    //                });
    //            }
    //        }

    //        return existingProxy ? {
    //            validateName: {
    //                valid: false
    //            }
    //        } : null;
    //    };
    //};

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
        });

        this._functionsService.saveApiProxy(ApiProxy.toJson(this.apiProxies)).subscribe(() => {
            this._globalStateService.clearBusyState();
            this._broadcastService.broadcast(BroadcastEvent.ApiProxyDeleted, this._apiProxyEdit);
        });
    }

    onCancelClick() {
        this.apiProxyEdit = this._apiProxyEdit;
    }

    submitForm(value: any) {
        if (this.complexForm.valid) {
            this._globalStateService.setBusyState();

            this._apiProxyEdit.backendUri = this.complexForm.controls["backendUri"].value;
            this._apiProxyEdit.matchCondition.route = this.complexForm.controls["routeTemplate"].value;
            this._apiProxyEdit.matchCondition.methods = [];

            this._functionsService.getApiProxies().subscribe(proxies => {

                this.apiProxies = ApiProxy.fromJson(proxies);
                var existingProxy = this.apiProxies.find((p) => {
                    return p.name === this._apiProxyEdit.name;
                });

                if (existingProxy) {
                    if (this.complexForm.controls["methodSelectionType"].value !== "All") {
                        for (var control in this.complexForm.controls) {
                            if (control.startsWith("method_")) {
                                if (this.complexForm.controls[control].value) {
                                    this._apiProxyEdit.matchCondition.methods.push(control.toLocaleLowerCase());
                                }
                            }
                        }
                    }
                }

                existingProxy = this._apiProxyEdit;

                this._functionsService.saveApiProxy(ApiProxy.toJson(this.apiProxies)).subscribe(() => {
                    this._globalStateService.clearBusyState();
                    this._broadcastService.broadcast(BroadcastEvent.ApiProxyUpdated, this._apiProxyEdit);
                });
            });
        }
    }

    //submitFormNew(value: any) {
    //    if (this.complexForm.valid) {
    //        this._globalStateService.setBusyState();

    //        var newApiProxy: ApiProxy = {
    //            name: this.complexForm.controls["name"].value,
    //            backendUri: this.complexForm.controls["backendUri"].value,
    //            matchCondition: {
    //                route: this.complexForm.controls["routeTemplate"].value,
    //                methods: []
    //            }
    //        };

    //        this._functionsService.getApiProxies().subscribe(proxies => {

    //            this.apiProxies = ApiProxy.fromJson(proxies);
    //            var existingProxy = this.apiProxies.find((p) => {
    //                return p.name === newApiProxy.name;
    //            });

    //            if (existingProxy) {
    //                this._globalStateService.clearBusyState();
    //                throw `Proxy with name '${newApiProxy.name}' already exists`;
    //            } else {
    //                if (this.complexForm.controls["methodSelectionType"].value !== "All") {
    //                    for (var control in this.complexForm.controls) {
    //                        if (control.startsWith("method_")) {
    //                            if (this.complexForm.controls[control].value) {
    //                                newApiProxy.matchCondition.methods.push(control.toLocaleLowerCase());
    //                            }
    //                        }
    //                    }
    //                }
    //            }

    //            this.apiProxies.push(newApiProxy);

    //            this._functionsService.saveApiProxy(ApiProxy.toJson(this.apiProxies)).subscribe(() => {
    //                this._globalStateService.clearBusyState();
    //                this._broadcastService.broadcast(BroadcastEvent.ApiProxyAdded, newApiProxy);
    //            });
    //        });

    //    }
        
    //}

}
