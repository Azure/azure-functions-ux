import { AuthzService } from './../shared/services/authz.service';
import { FunctionNode } from './function-node';
import { async } from '@angular/core/testing';
import { TopBarNotification } from './../top-bar/top-bar-models';
import { Response, Request } from '@angular/http';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { SiteConfig } from './../shared/models/arm/site-config';
import { Subscription } from './../shared/models/subscription';
import { SiteDescriptor } from './../shared/resourceDescriptors';
import { AppsNode } from './apps-node';
import { TreeNode, Disposable, Removable, CustomSelection, Collection, Refreshable } from './tree-node';
import {DashboardType} from './models/dashboard-type';
import {SideNavComponent} from '../side-nav/side-nav.component';
import {Site} from '../shared/models/arm/site';
import {SlotsNode} from './slots-node';
import {FunctionsNode} from './functions-node';
import {ProxiesNode} from './proxies-node';
import {FunctionApp} from '../shared/function-app';
import { Observable, Subscription as RxSubscription, ReplaySubject } from 'rxjs/Rx';
import {Constants} from '../shared/models/constants';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {ErrorEvent} from '../shared/models/error-event';

export class AppNode extends TreeNode implements Disposable, Removable, CustomSelection, Collection, Refreshable{
    public supportsAdvanced = true;
    public inAdvancedMode = false;
    public dashboardType = DashboardType.app;
    public disabled = false;
    public supportsScope = true;
    public supportsRefresh = false;

    public title : string;
    public subscription : string;
    public resourceGroup : string;
    public location : string;

    public functionApp : FunctionApp;
    public openFunctionTab = false;

    public iconClass = "tree-node-function-app-icon";

    private _hiddenChildren : TreeNode[];
    private _pollingTask : RxSubscription;
    private _loadingObservable : Observable<any>;

    constructor(sideBar : SideNavComponent,
                private _siteArmCacheObj : ArmObj<Site>,
                parentNode : TreeNode,
                subscriptions : Subscription[],
                disabled? : boolean){
        super(sideBar, _siteArmCacheObj.id, parentNode);

        this.disabled = !!disabled;
        if(disabled){
            this.supportsAdvanced = false;
        }

        this.title = _siteArmCacheObj.name;
        this.location = _siteArmCacheObj.location;
        
        let descriptor = new SiteDescriptor(_siteArmCacheObj.id);
        this.resourceGroup = descriptor.resourceGroup;

        let sub = subscriptions.find(sub =>{
            return sub.subscriptionId === descriptor.subscription;
        })

        this.subscription = sub && sub.displayName;
    }

    public handleSelection() : Observable<any>{
        if(!this.disabled){
            if(!this._loadingObservable){
                this._loadingObservable = this.initialize(false);
            }

            return this._loadingObservable;
        }

        return Observable.of({});
    }

    public loadChildren(){
        if(!this.disabled){
            if(!this._loadingObservable){
                this._loadingObservable = this.initialize(true);
            }

            return this._loadingObservable;
        }

        return Observable.of({});
    }

    public initialize(expandOnly? : boolean) : Observable<any>{

        if(!expandOnly){
            this.inSelectedTree = true;
        }

        this.supportsRefresh = false;
        this.isLoading = true;

        return Observable.zip(
            this.sideNav.authZService.hasPermission(this._siteArmCacheObj.id, [AuthzService.writeScope]),
            this.sideNav.authZService.hasReadOnlyLock(this._siteArmCacheObj.id),
            this.sideNav.cacheService.getArm(this._siteArmCacheObj.id),
            (h, r, s) =>({ hasWritePermission : h, hasReadOnlyLock : r, siteResponse : s})
        )

        .switchMap(r =>{

            this.isLoading = false;

            let site : ArmObj<Site> = r.siteResponse.json();
            
            if(!this.functionApp){
                this.functionApp = new FunctionApp(
                    site,
                    this.sideNav.http,
                    this.sideNav.userService,
                    this.sideNav.globalStateService,
                    this.sideNav.translateService,
                    this.sideNav.broadcastService,
                    this.sideNav.armService,
                    this.sideNav.cacheService,
                    this.sideNav.languageService,
                    this.sideNav.authZService
                );

                let functionsNode = new FunctionsNode(this.sideNav, this.functionApp, this);
                let proxiesNode = new ProxiesNode(this.sideNav, this.functionApp, this);
                functionsNode.toggle(null);
                proxiesNode.toggle(null);

                this.children = [ functionsNode, proxiesNode ];

                if(site.properties.state === "Running" && r.hasWritePermission && !r.hasReadOnlyLock){
                    return this.setupBackgroundTasks()
                    .map(() =>{
                        this.supportsRefresh = true;
                    });
                }
                else{
                    this.dispose()
                    this.supportsRefresh = true;
                    return Observable.of(null);
                }
            }

            this.supportsRefresh = true;
            return Observable.of(null);
        })
        .map(r =>{
            this.children.forEach(c => c.inSelectedTree = true);
            this._loadingObservable = null;
            return r;
        })
    }

    public handleRefresh() : Observable<any>{

        if(this.sideNav.selectedNode.shouldBlockNavChange()){
            return Observable.of(null);
        }

        this.sideNav.updateView(this, this.dashboardType);

        // Call loadChildren first in case there's currently a load operation going
        return this.loadChildren()
        .switchMap(() =>{
            this.sideNav.aiService.trackEvent('/actions/refresh');
            this.functionApp.fireSyncTrigger();
            this.sideNav.cacheService.clearCache();
            this.dispose();
            this.functionApp = null;
            return this.initialize();
        })
        .map(() =>{
            this.isLoading = false;
            if(this.children && this.children.length === 1 && !this.children[0].isExpanded){
                this.children[0].toggle(null);
            }
        });
    }

    public remove(){
        (<AppsNode>this.parent).removeChild(this, false);

        let clearUrl = `${this.sideNav.armService.armUrl}${this.resourceId}`;
        this.sideNav.cacheService.clearCachePrefix(clearUrl);
        this.dispose();
    }

    public dispose(newSelectedNode? : TreeNode){
        this.inSelectedTree = false;
        this.children.forEach(c => c.inSelectedTree = false);

        // Ensures that we're only disposing if you're selecting a node that's not a child of the
        // the current app node.
        if(newSelectedNode){

            // Tests whether you've selected a child node
            if(newSelectedNode.resourceId !== this.resourceId && newSelectedNode.resourceId.startsWith(this.resourceId + "/")){
                return;
            }
            else if(newSelectedNode.resourceId === this.resourceId && newSelectedNode === this){
                // Tests whether you're navigating to this node from a child node
                return;
            }
        }

        if(this._loadingObservable){
            this._loadingObservable.subscribe(() =>{
                this._dispose();
            })
        }
        else{
            this._dispose();
        }
    }

    public openSettings() {
        this.openFunctionTab = true;
        this.select();
    }

    private _dispose(){
        if(this._pollingTask && !this._pollingTask.closed){
            this._pollingTask.unsubscribe();
            this._pollingTask = null;
        }

        // this.functionApp = null;
        this.sideNav.globalStateService.setTopBarNotifications([]);
    }
    public setupBackgroundTasks(){

        return this.functionApp.initKeysAndWarmupMainSite()
        .catch((err : any) => Observable.of(null))
        .map(() =>{

            if(!this._pollingTask){

                this._pollingTask = Observable.timer(1, 60000)
                    .concatMap<{ errors: string[], configResponse: Response, appSettingResponse : Response}>(() => {
                        return Observable.zip(
                            this.functionApp.getHostErrors().catch(e => Observable.of([])),
                            this.sideNav.cacheService.getArm(`${this.resourceId}/config/web`, true),
                            this.sideNav.cacheService.postArm(`${this.resourceId}/config/appsettings/list`, true),
                            (e : string[], c : Response, a : Response) => ({ errors: e, configResponse: c, appSettingResponse : a }))
                    })
                    .catch(e => Observable.of({}))
                    .subscribe((result : {errors : string[], configResponse : Response, appSettingResponse : Response}) => {
                        this._handlePollingTaskResult(result);
                    });
            }       
        })
    }

    private _handlePollingTaskResult(result : {errors : string[], configResponse : Response, appSettingResponse : Response}){
        if(result){

            let notifications : TopBarNotification[] = [];

            if(result.errors){
                result.errors.forEach(e => {
                    this.sideNav.broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: e, details: `Host Error: ${e}` });
                    this.sideNav.aiService.trackEvent('/errors/host', { error: e, app: this.resourceId });
                });
            }

            if(result.configResponse){
                let config = result.configResponse.json();
                this.functionApp.isAlwaysOn = config.properties.alwaysOn === true || this.functionApp.site.properties.sku === "Dynamic";
                
                if(!this.functionApp.isAlwaysOn){
                    notifications.push({
                        message : '"Always On" setting is set to Off.',
                        iconClass: 'fa fa-exclamation-triangle warning',
                        learnMoreLink : 'https://go.microsoft.com/fwlink/?linkid=830855',
                        clickCallback : null
                    });
                }
            }

            if(result.appSettingResponse){
                let appSettings : ArmObj<any> = result.appSettingResponse.json();
                let extensionVersion = appSettings.properties[Constants.runtimeVersionAppSettingName];
                let isLatestFunctionRuntime = null;
                if(extensionVersion){
                    isLatestFunctionRuntime = Constants.runtimeVersion === extensionVersion || Constants.latest === extensionVersion.toLowerCase();
                    this.sideNav.aiService.trackEvent('/values/runtime_version', { runtime: extensionVersion, appName: this.resourceId });
                }

                if(!isLatestFunctionRuntime){
                    notifications.push({
                        message : 'A new version of Azure Functions is available. Click to visit settings.',
                        iconClass: 'fa fa-info link',
                        learnMoreLink : 'https://go.microsoft.com/fwlink/?linkid=829530',
                        clickCallback : () =>{
                            this.openSettings();
                        }
                    })
                }
            }

            this.sideNav.globalStateService.setTopBarNotifications(notifications);
        }        
    }
}
