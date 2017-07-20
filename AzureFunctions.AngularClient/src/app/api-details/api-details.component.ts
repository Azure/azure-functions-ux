import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { GlobalStateService } from '../shared/services/global-state.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ApiProxy } from '../shared/models/api-proxy';
import { FunctionsService } from '../shared/services/functions.service';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { PortalResources } from '../shared/models/portal-resources';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { FunctionContainer } from '../shared/models/function-container';
import { ApiNewComponent } from '../api-new/api-new.component';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { ProxiesNode } from '../tree-view/proxies-node';
import { AppNode } from '../tree-view/app-node';
import { ProxyNode } from '../tree-view/proxy-node';
import { FunctionApp } from '../shared/function-app';
import { Constants } from '../shared/models/constants';
import { ArmObj } from '../shared/models/arm/arm-obj';
import { AiService } from '../shared/services/ai.service';

@Component({
    selector: 'api-details',
    templateUrl: './api-details.component.html',
    styleUrls: ['../api-new/api-new.component.scss', '../binding-input/binding-input.component.css'],
    inputs: ['viewInfoInput']
})
export class ApiDetailsComponent implements OnInit {
    complexForm: FormGroup;
    isMethodsVisible: boolean = false;
    proxyUrl: string;
    isEnabled: boolean;


    public functionApp: FunctionApp;
    public apiProxies: ApiProxy[];
    public apiProxyEdit: ApiProxy;
    public appNode: AppNode;
    private selectedNode: ProxyNode;
    private proxiesNode: ProxiesNode;

    set viewInfoInput(viewInfoInput: TreeViewInfo<any>) {
        this._globalStateService.setBusyState();
        this.selectedNode = <ProxyNode>viewInfoInput.node;
        this.proxiesNode = (<ProxiesNode>this.selectedNode.parent);
        this.functionApp = this.proxiesNode.functionApp;
        this.apiProxyEdit = this.selectedNode.proxy;
        this.initEdit();
        this.functionApp.getApiProxies()
            .subscribe(proxies => {
                this._globalStateService.clearBusyState();
                this.apiProxies = proxies;
            });

        this.appNode = (<AppNode>this.proxiesNode.parent);
        var cacherService = this.appNode.sideNav.cacheService;
        cacherService.postArm(`${this.functionApp.site.id}/config/appsettings/list`).subscribe((r => {
            let appSettings: ArmObj<any> = r.json();
            var routingVersion = appSettings.properties[Constants.routingExtensionVersionAppSettingName];
            this.isEnabled = (routingVersion && (routingVersion !== Constants.disabled));
        }));

    }

    constructor(private _fb: FormBuilder,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService,
        private _aiService: AiService) {

        this.initComplexFrom();
    }

    onFunctionAppSettingsClicked(event: any) {
        (<AppNode>this.proxiesNode.parent).openSettings();

    }

    private initEdit() {

        this.complexForm.patchValue({
            backendUri: this.apiProxyEdit.backendUri,
            routeTemplate: this.apiProxyEdit.matchCondition.route,
            methodSelectionType: !this.apiProxyEdit.matchCondition.methods || this.apiProxyEdit.matchCondition.methods.length === 0 ? "All" : "Selected",
        });

        var route = (this.apiProxyEdit.matchCondition.route) ? this.apiProxyEdit.matchCondition.route : '/api/' + this.apiProxyEdit.name;
        if (!route.startsWith('/')) {
            route = '/' + route;
        }

        this.proxyUrl = `https://${this.functionApp.site.properties.hostNameSslStates.find(s => s.hostType === 0).name}` + route;

        var methods = {}
        methods["method_GET"] = false;
        methods["method_POST"] = false;
        methods["method_DELETE"] = false;
        methods["method_HEAD"] = false;
        methods["method_PATCH"] = false;
        methods["method_PUT"] = false;
        methods["method_OPTIONS"] = false;
        methods["method_TRACE"] = false;

        if (this.apiProxyEdit.matchCondition.methods) {
            this.apiProxyEdit.matchCondition.methods.forEach((m) => {
                methods["method_" + m.toUpperCase()] = true;
            });

            this.complexForm.patchValue(methods);
        }
    }

    ngOnInit() {
    }

    deleteProxyClicked() {
        this._globalStateService.setBusyState();
        this.functionApp.getApiProxies().subscribe(proxies => {

            this.apiProxies = proxies;
            var indexToDelete = this.apiProxies.findIndex((p) => {
                return p.name === this.apiProxyEdit.name;
            });

            this.apiProxies.splice(indexToDelete, 1);

            this.functionApp.saveApiProxy(ApiProxy.toJson(this.apiProxies, this._translateService)).subscribe(() => {
                this._globalStateService.clearBusyState();
                this._aiService.trackEvent('/actions/proxy/delete');
                this.proxiesNode.removeChild(this.apiProxyEdit);
            });
        });
    }

    onCancelClick() {
        this.apiProxyEdit = this.apiProxyEdit;
    }

    onReset() {
        this.initComplexFrom();
        this.initEdit();
        this._broadcastService.clearDirtyState('api-proxy', true);
    }

    submitForm(value: any) {

        if (this.complexForm.valid) {
            this._globalStateService.setBusyState();

            this.apiProxyEdit.backendUri = this.complexForm.controls["backendUri"].value;
            this.apiProxyEdit.matchCondition.route = this.complexForm.controls["routeTemplate"].value;
            this.apiProxyEdit.matchCondition.methods = [];

            this.functionApp.getApiProxies().subscribe(proxies => {
                this.apiProxies = proxies;
                var index = this.apiProxies.findIndex((p) => {
                    return p.name === this.apiProxyEdit.name;
                });

                if (index > -1) {
                    if (this.complexForm.controls["methodSelectionType"].value !== "All") {
                        for (var control in this.complexForm.controls) {
                            if (control.startsWith("method_")) {
                                if (this.complexForm.controls[control].value) {
                                    this.apiProxyEdit.matchCondition.methods.push(control.replace("method_", "").toUpperCase());
                                }
                            }
                        }
                    }
                    this.apiProxies[index] = this.apiProxyEdit;
                }

                this.functionApp.saveApiProxy(ApiProxy.toJson(this.apiProxies, this._translateService)).subscribe(() => {
                    this._globalStateService.clearBusyState();
                    this.onReset();
                });
            });
        }
    }

    private initComplexFrom() {

        this.complexForm = this._fb.group({
            routeTemplate: [null, Validators.required],
            methodSelectionType: 'All',
            backendUri: [null, Validators.compose([ApiNewComponent.validateUrl()])],
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

        //this.isEnabled = this._globalStateService.IsRoutingEnabled;
    }

    openAdvancedEditor() {
        let scmUrl = this.apiProxyEdit.functionApp.getScmUrl();
        window.open(`${scmUrl}/dev/wwwroot/proxies.json`);
    }
}
