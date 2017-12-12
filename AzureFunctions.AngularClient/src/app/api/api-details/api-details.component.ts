import { TreeUpdateEvent } from './../../shared/models/broadcast-event';
import { FunctionsService, FunctionAppContext } from './../../shared/services/functions-service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { LogCategories } from 'app/shared/models/constants';
import { LogService } from './../../shared/services/log.service';
import { CacheService } from 'app/shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { Subject } from 'rxjs/Subject';
import { Component, ViewChild, OnDestroy, Injector } from '@angular/core';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiProxy } from '../../shared/models/api-proxy';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { ApiNewComponent } from '../api-new/api-new.component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { ProxiesNode } from '../../tree-view/proxies-node';
import { AppNode } from '../../tree-view/app-node';
import { ProxyNode } from '../../tree-view/proxy-node';
import { FunctionApp } from '../../shared/function-app';
import { AiService } from '../../shared/services/ai.service';
import { RequestResposeOverrideComponent } from '../request-respose-override/request-respose-override.component';
import { ArmSiteDescriptor } from '../../shared/resourceDescriptors';

@Component({
    selector: 'api-details',
    templateUrl: './api-details.component.html',
    styleUrls: ['../api-new/api-new.component.scss', '../../binding-input/binding-input.component.css'],
})
export class ApiDetailsComponent implements OnDestroy {
    @ViewChild(RequestResposeOverrideComponent) rrComponent: RequestResposeOverrideComponent;
    complexForm: FormGroup;
    isMethodsVisible = false;
    proxyUrl: string;

    public context: FunctionAppContext;
    public functionApp: FunctionApp;
    public apiProxies: ApiProxy[];
    public apiProxyEdit: ApiProxy;
    public appNode: AppNode;
    public rrOverrideValid: boolean;

    private selectedNode: ProxyNode;
    private proxiesNode: ProxiesNode;
    private _rrOverrideValue: any;
    private _ngUnsubscribe = new Subject();

    constructor(private _fb: FormBuilder,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService,
        private _aiService: AiService,
        private _cacheService: CacheService,
        private _logService: LogService,
        private _functionsService: FunctionsService,
        private _injector: Injector) {

        this.initComplexFrom();

        this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.TreeNavigation)
            .takeUntil(this._ngUnsubscribe)
            .filter(info => info.dashboardType === DashboardType.ProxyDashboard)
            .switchMap(viewInfo => {
                this._globalStateService.setBusyState();

                this.selectedNode = <ProxyNode>viewInfo.node;
                this.proxiesNode = (<ProxiesNode>this.selectedNode.parent);
                this.apiProxyEdit = this.selectedNode.proxy;

                const siteDescriptor = new ArmSiteDescriptor(viewInfo.resourceId);
                return this._functionsService.getAppContext(siteDescriptor.getTrimmedResourceId());
            })
            .switchMap(context => {
                this.context = context;

                if (this.functionApp) {
                    this.functionApp.dispose();
                }

                this.functionApp = new FunctionApp(this.context.site, this._injector);
                this.apiProxyEdit.functionApp = this.functionApp;
                this.initEdit();

                return Observable.zip(
                    this.functionApp.getApiProxies(),
                    this._cacheService.postArm(`${this.functionApp.site.id}/config/appsettings/list`),
                    (p, a) => ({ proxies: p, appSettings: a.json() }));

            })
            .do(null, e => {
                this._logService.error(LogCategories.apiDetails, '/apidetails', e);
                this._globalStateService.clearBusyState();
            })
            .retry()
            .subscribe(r => {

                this._globalStateService.clearBusyState();
                this.apiProxies = r.proxies;
            });
    }

    onFunctionAppSettingsClicked() {
        (<AppNode>this.proxiesNode.parent).openSettings();

    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
        if (this.functionApp) {
            this.functionApp.dispose();
        }
    }

    private initEdit() {

        this.complexForm.patchValue({
            backendUri: this.apiProxyEdit.backendUri,
            routeTemplate: this.apiProxyEdit.matchCondition.route,
            methodSelectionType: !this.apiProxyEdit.matchCondition.methods || this.apiProxyEdit.matchCondition.methods.length === 0 ? 'All' : 'Selected',
        });

        let route = (this.apiProxyEdit.matchCondition.route) ? this.apiProxyEdit.matchCondition.route : '/api/' + this.apiProxyEdit.name;
        if (!route.startsWith('/')) {
            route = '/' + route;
        }

        this.proxyUrl = `https://${this.functionApp.site.properties.hostNameSslStates.find(s => s.hostType === 0).name}` + route;

        const methods = {};
        methods['method_GET'] = false;
        methods['method_POST'] = false;
        methods['method_DELETE'] = false;
        methods['method_HEAD'] = false;
        methods['method_PATCH'] = false;
        methods['method_PUT'] = false;
        methods['method_OPTIONS'] = false;
        methods['method_TRACE'] = false;

        if (this.apiProxyEdit.matchCondition.methods) {
            this.apiProxyEdit.matchCondition.methods.forEach((m) => {
                methods['method_' + m.toUpperCase()] = true;
            });

            this.complexForm.patchValue(methods);
        }
    }

    deleteProxyClicked() {
        this._globalStateService.setBusyState();
        this.functionApp.getApiProxies().subscribe(proxies => {

            this.apiProxies = proxies;
            const indexToDelete = this.apiProxies.findIndex((p) => {
                return p.name === this.apiProxyEdit.name;
            });

            this.apiProxies.splice(indexToDelete, 1);

            this.functionApp.saveApiProxy(ApiProxy.toJson(this.apiProxies, this._translateService)).subscribe(() => {
                this._globalStateService.clearBusyState();
                this._aiService.trackEvent('/actions/proxy/delete');
                this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
                    operation: 'remove',
                    resourceId: `${this.context.site.id}/proxies/${this.apiProxyEdit.name}`
                });

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
        this.rrComponent.discard();
    }

    submitForm() {

        if (this.complexForm.valid && this.rrOverrideValid) {
            this._globalStateService.setBusyState();

            this.apiProxyEdit.backendUri = this.complexForm.controls['backendUri'].value;
            this.apiProxyEdit.matchCondition.route = this.complexForm.controls['routeTemplate'].value;
            this.apiProxyEdit.matchCondition.methods = [];

            this.functionApp.getApiProxies().subscribe(proxies => {
                this.apiProxies = proxies;
                const index = this.apiProxies.findIndex((p) => {
                    return p.name === this.apiProxyEdit.name;
                });

                if (index > -1) {
                    if (this.complexForm.controls['methodSelectionType'].value !== 'All') {
                        for (const control in this.complexForm.controls) {
                            if (control.startsWith('method_')) {
                                if (this.complexForm.controls[control].value) {
                                    this.apiProxyEdit.matchCondition.methods.push(control.replace('method_', '').toUpperCase());
                                }
                            }
                        }
                    }

                    // https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
                    // we are using ES5 now
                    if (this._rrOverrideValue) {
                        delete this.apiProxyEdit.requestOverrides;
                        delete this.apiProxyEdit.responseOverrides;
                        for (const prop in this._rrOverrideValue) {
                            this.apiProxyEdit[prop] = this._rrOverrideValue[prop];
                        }
                    }

                    this.apiProxies[index] = this.apiProxyEdit;
                }

                this.functionApp.saveApiProxy(ApiProxy.toJson(this.apiProxies, this._translateService)).subscribe(() => {
                    this._globalStateService.clearBusyState();
                    this.rrComponent.saveModel();
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

        this.complexForm.controls['methodSelectionType'].valueChanges.subscribe((value) => {
            this.isMethodsVisible = !(value === 'All');
        });

        this.complexForm.valueChanges.subscribe(() => {
            if (this.complexForm.dirty) {
                this._broadcastService.setDirtyState('api-proxy');
            }
        });

        // this.isEnabled = this._globalStateService.IsRoutingEnabled;
    }

    openAdvancedEditor() {
        const scmUrl = this.apiProxyEdit.functionApp.getScmUrl();
        window.open(`${scmUrl}/dev/wwwroot/proxies.json`);
    }

    rrOverriedValueChanges(value: any) {
        this._rrOverrideValue = value;
        this.rrOverrideValid = this.rrComponent.valid;
        if (this.rrComponent.dirty) {
            this._broadcastService.setDirtyState('api-proxy');
            this.complexForm.markAsDirty();
        }
    }
}
