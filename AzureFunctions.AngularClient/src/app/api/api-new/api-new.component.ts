import { SiteDescriptor } from 'app/shared/resourceDescriptors';
import { FunctionsService, FunctionAppContext } from './../../shared/services/functions-service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { Component, ViewChild, OnDestroy, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';

import { AppNode } from './../../tree-view/app-node';
import { CacheService } from './../../shared/services/cache.service';
import { AiService } from './../../shared/services/ai.service';
import { ApiProxy } from '../../shared/models/api-proxy';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { PortalResources } from '../../shared/models/portal-resources';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../shared/models/broadcast-event';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { ProxiesNode } from '../../tree-view/proxies-node';
import { FunctionApp } from '../../shared/function-app';
import { ErrorEvent, ErrorType } from '../../shared/models/error-event';
import { FunctionInfo } from '../../shared/models/function-info';
import { ErrorIds } from '../../shared/models/error-ids';
import { RequestResposeOverrideComponent } from '../request-respose-override/request-respose-override.component';

@Component({
    selector: 'api-new',
    templateUrl: './api-new.component.html',
    styleUrls: ['./api-new.component.scss', '../../binding-input/binding-input.component.css'],
})
export class ApiNewComponent implements OnDestroy {
    @ViewChild(RequestResposeOverrideComponent) rrComponent: RequestResposeOverrideComponent;
    complexForm: FormGroup;
    isMethodsVisible = false;

    public context: FunctionAppContext;
    public functionApp: FunctionApp;
    public apiProxies: ApiProxy[];
    public functionsInfo: FunctionInfo[];
    public appNode: AppNode;
    public rrOverrideValid: boolean;
    private _proxiesNode: ProxiesNode;
    private _rrOverrideValue: any;
    private _ngUnsubscribe = new Subject();

    constructor(fb: FormBuilder,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService,
        private _aiService: AiService,
        private _cacheService: CacheService,
        private _functionsService: FunctionsService,
        private _injector: Injector) {

        this.complexForm = fb.group({
            // We can set default values by passing in the corresponding value or leave blank if we wish to not set the value. For our example, we�ll default the gender to female.
            routeTemplate: [null, Validators.required],
            methodSelectionType: 'All',
            name: [null, Validators.compose([Validators.required, this.validateName(this)])],
            backendUri: [null, Validators.compose([ApiNewComponent.validateUrl()])],
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

        this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.TreeNavigation)
            .filter(info => info.dashboardType === DashboardType.CreateProxyDashboard)
            .takeUntil(this._ngUnsubscribe)
            .switchMap(viewInfo => {
                this._globalStateService.setBusyState();
                this._proxiesNode = <ProxiesNode>viewInfo.node;
                this.appNode = (<AppNode>this._proxiesNode.parent);

                const descriptor = new SiteDescriptor(viewInfo.resourceId);

                return this._functionsService.getAppContext(descriptor.getTrimmedResourceId());
            })
            .switchMap(context => {
                this.context = context;

                if (this.functionApp) {
                    this.functionApp.dispose();
                }

                this.functionApp = new FunctionApp(context.site, this._injector);

                // Should be okay to query app settings without checkout RBAC/locks since this component
                // shouldn't load unless you have write access.
                return Observable.zip(
                    this.functionApp.getFunctions(),
                    this.functionApp.getApiProxies(),
                    this._cacheService.postArm(`${this.functionApp.site.id}/config/appsettings/list`, true),
                    (f, p, a) => ({ fcs: f, proxies: p, appSettings: a.json() }));
            })
            .do(null, e => {
                this._aiService.trackException(e, '/errors/proxy-create');
                console.error(e);
            })
            .retry()
            .subscribe(res => {
                this._globalStateService.clearBusyState();
                this.functionsInfo = res.fcs;
                this.apiProxies = res.proxies;
            });
    }

    onFunctionAppSettingsClicked() {
        this.appNode.openSettings();
    }

    static validateUrl(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {

            if (control.value) {

                const url: string = <string>control.value.toLowerCase();

                return url.startsWith('http://') || url.startsWith('https://') ? null : {
                    validateName: {
                        valid: false
                    }
                };
            } else {
                return null;
            }
        };
    }

    validateName(that: ApiNewComponent): ValidatorFn {

        return (control: AbstractControl): { [key: string]: any } => {
            let existingProxy = null;
            let existingFunction = null;
            if (that.complexForm) {
                const name = control.value;

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

    ngOnDestroy() {
        this._ngUnsubscribe.next();
        if (this.functionApp) {
            this.functionApp.dispose();
        }
    }

    submitForm() {

        if (this.complexForm.valid && this.rrOverrideValid) {
            this._globalStateService.setBusyState();

            const newApiProxy: ApiProxy = {
                name: this.complexForm.controls['name'].value,
                backendUri: this.complexForm.controls['backendUri'].value,
                matchCondition: {
                    route: this.complexForm.controls['routeTemplate'].value,
                    methods: []
                },
                functionApp: null,
            };

            this.functionApp.getApiProxies().subscribe(proxies => {

                this.apiProxies = proxies;
                const existingProxy = this.apiProxies.find((p) => {
                    return p.name === newApiProxy.name;
                });

                if (existingProxy) {
                    this._globalStateService.clearBusyState();
                    // No need to log this error as this is just a user error.
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.apiProxy_alreadyExists, { name: newApiProxy.name }),
                        errorId: ErrorIds.proxyWithSameNameAlreadyExists,
                        errorType: ErrorType.UserError,
                        resourceId: this.functionApp.site.id
                    });
                    throw new Error(`Proxy with name '${newApiProxy.name}' already exists`);
                } else {
                    if (this.complexForm.controls['methodSelectionType'].value !== 'All') {
                        for (const control in this.complexForm.controls) {
                            if (control.startsWith('method_')) {
                                if (this.complexForm.controls[control].value) {
                                    newApiProxy.matchCondition.methods.push(control.replace('method_', '').toUpperCase());
                                }
                            }
                        }
                    }
                }

                // https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
                // we are using ES5 now
                if (this._rrOverrideValue) {
                    for (var prop in this._rrOverrideValue) {
                        newApiProxy[prop] = this._rrOverrideValue[prop];
                    }
                }

                this.apiProxies.push(newApiProxy);

                this.functionApp.saveApiProxy(ApiProxy.toJson(this.apiProxies, this._translateService)).subscribe(() => {
                    this._globalStateService.clearBusyState();

                    // If someone refreshed the app, it would created a new set of child nodes under the app node.
                    this._proxiesNode = <ProxiesNode>this.appNode.children.find(node => node.title === this._proxiesNode.title);
                    this._proxiesNode.addChild(newApiProxy);
                    this._aiService.trackEvent('/actions/proxy/create');
                });
            });

        }
    }

    rrOverriedValueChanges(value: any) {
        this._rrOverrideValue = value;
        this.rrOverrideValid = this.rrComponent.valid;
    }

}
