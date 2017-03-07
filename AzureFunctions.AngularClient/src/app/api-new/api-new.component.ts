import {Component, OnInit, Input, EventEmitter,  Output } from '@angular/core';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {ApiProxy} from '../shared/models/api-proxy';
import {FunctionsService} from '../shared/services/functions.service';
import {FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import {PortalResources} from '../shared/models/portal-resources';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {ErrorEvent} from '../shared/models/error-event';
import {FunctionInfo} from '../shared/models/function-info';
import {TreeViewInfo} from '../tree-view/models/tree-view-info';
import {ProxiesNode} from '../tree-view/proxies-node';
import {FunctionApp} from '../shared/function-app';

@Component({
  selector: 'api-new',
  templateUrl: './api-new.component.html',
  //styleUrls: ['./api-new.component.scss']
  styleUrls: ['./api-new.component.scss', '../binding-input/binding-input.component.css'],
  inputs: ['viewInfoInput']
})
export class ApiNewComponent implements OnInit {
    
    complexForm: FormGroup;
    isMethodsVisible: boolean = false;
    @Output() private functionAppSettingsClicked: EventEmitter<any> = new EventEmitter<any>();
    isEnabled: boolean;

    public functionApp: FunctionApp;
    public apiProxies: ApiProxy[];
    public functionsInfo: FunctionInfo[];
    private selectedNode: ProxiesNode;

    set viewInfoInput(viewInfoInput: TreeViewInfo) {
        this._globalStateService.setBusyState();
        this.selectedNode = <ProxiesNode>viewInfoInput.node;
        this.functionApp = this.selectedNode.functionApp;
        var fetchDone = false;
        this.functionApp.getFunctions()
            .subscribe(fcs => {
                if (fetchDone) {
                    this._globalStateService.clearBusyState();
                }
                fetchDone = true;
                this.functionsInfo = fcs;
            });
        this.functionApp.getApiProxies()
            .subscribe(proxies => {
                if (fetchDone) {
                    this._globalStateService.clearBusyState();
                }
                fetchDone = true;
                this.apiProxies = proxies;
            });
    }

    constructor(fb: FormBuilder,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService) {

        this.complexForm = fb.group({
            // We can set default values by passing in the corresponding value or leave blank if we wish to not set the value. For our example, we’ll default the gender to female.
            routeTemplate: [null, Validators.required],
            methodSelectionType: 'All',
            name: [null, Validators.compose([Validators.required, this.validateName(this)])],
            backendUri: [null, Validators.compose([Validators.required, ApiNewComponent.validateUrl()])],
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

        this.isEnabled = this._globalStateService.IsRoutingEnabled;
    }

    onFunctionAppSettingsClicked(event: any) {
        this.functionAppSettingsClicked.emit(event);
    }

    static validateUrl(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {

            if (control.value) {

                var url: string = <string>control.value.toLowerCase();

                return url.startsWith("http://") || url.startsWith("https://") ? null : {
                    validateName: {
                        valid: false
                    }
                };
            } else {
                return null;
            }
        }
    }

    validateName(that: ApiNewComponent): ValidatorFn {

        return (control: AbstractControl): { [key: string]: any } => {
            var existingProxy = null;
            var existingFunction = null;
            if (that.complexForm) {
                var name = control.value;

                if (name) {
                    if (that.apiProxies && name) {
                        existingProxy = that.apiProxies.find((p) => {
                            return p.name.toLowerCase() === name.toLowerCase();
                        });
                    }
                    if (!existingProxy) {
                        existingFunction = that.functionsInfo.find((f) => {
                            return f.name.toLowerCase() === name.toLowerCase();
                        });
                    }
                }
            }

            return existingProxy || existingFunction ? {
                validateName: {
                    valid: false
                }
            } : null;
        };
    };

    ngOnInit() {
    }

    submitForm(value: any) {

        if (this.complexForm.valid) {
            this._globalStateService.setBusyState();

            var newApiProxy: ApiProxy = {
                name: this.complexForm.controls["name"].value,
                backendUri: this.complexForm.controls["backendUri"].value,
                matchCondition: {
                    route: this.complexForm.controls["routeTemplate"].value,
                    methods: []
                },
                functionApp: null,
            };

            this.functionApp.getApiProxies().subscribe(proxies => {

                this.apiProxies = proxies;
                var existingProxy = this.apiProxies.find((p) => {
                    return p.name === newApiProxy.name;
                });

                if (existingProxy) {
                    this._globalStateService.clearBusyState();
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: this._translateService.instant(PortalResources.apiProxy_alreadyExists, { name: newApiProxy.name }) });
                    throw `Proxy with name '${newApiProxy.name}' already exists`;
                } else {
                    if (this.complexForm.controls["methodSelectionType"].value !== "All") {
                        for (var control in this.complexForm.controls) {
                            if (control.startsWith("method_")) {
                                if (this.complexForm.controls[control].value) {
                                    newApiProxy.matchCondition.methods.push(control.replace("method_", "").toUpperCase());
                                }
                            }
                        }
                    }
                }

                this.apiProxies.push(newApiProxy);

                this.functionApp.saveApiProxy(ApiProxy.toJson(this.apiProxies, this._translateService)).subscribe(() => {
                    this._globalStateService.clearBusyState();
                    this.selectedNode.addChild(newApiProxy);
                    //this._broadcastService.broadcast(BroadcastEvent.ApiProxyAdded, newApiProxy);
                });
            });

        }

    }

}
