import { async } from '@angular/core/testing';
import { TopBarNotification } from './../top-bar/top-bar-models';
import { Response } from '@angular/http';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { SiteConfig } from './../shared/models/arm/site-config';
import { Subscription } from './../shared/models/subscription';
import { SiteDescriptor } from './../shared/resourceDescriptors';
import { AppsNode } from './apps-node';
import { TreeNode, Disposable, Removable, CustomSelection } from './tree-node';
import {DashboardType} from './models/dashboard-type';
import {SideNavComponent} from '../side-nav/side-nav.component';
import {Site} from '../shared/models/arm/site';
import {SlotsNode} from './slots-node';
import {FunctionsNode} from './functions-node';
import {FunctionApp} from '../shared/function-app';
import { Observable, Subscription as RxSubscription, ReplaySubject } from 'rxjs/Rx';
import {Constants} from '../shared/models/constants';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {ErrorEvent} from '../shared/models/error-event';

export class AppNode extends TreeNode implements Disposable, Removable, CustomSelection{
    public supportsAdvanced = true;
    public inAdvancedMode = false;
    public dashboardType = DashboardType.app;
    public disabled = false;
    public supportsScope = true;
    public supportsRefresh = false;

    public title : string;
    // public subscriptionId : string;
    public subscription : string;
    public resourceGroup : string;
    public location : string;

    public functionApp : FunctionApp;
    public openFunctionTab = false;

    private _hiddenChildren : TreeNode[];
    private _functionsNode : FunctionsNode;
    private _pollingTask : RxSubscription;

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
            return this.configureBackgroundTasks(false);
        }

        return Observable.of({});
    }

    protected _loadChildren(){
        this.handleSelection()
        .subscribe(() =>{
            this._doneLoading();
        });
    }

    public configureBackgroundTasks(forceLoadChildren : boolean) : Observable<any>{

        if(this._pollingTask){
            return Observable.of({});
        }

        this.supportsRefresh = false;

        return this.sideNav.cacheService.getArm(this._siteArmCacheObj.id)
        .map(r =>{

            let site : ArmObj<Site> = r.json();
            
            if(forceLoadChildren || !this.functionApp){
                this.functionApp = new FunctionApp(
                    site,
                    this.sideNav.http,
                    this.sideNav.userService,
                    this.sideNav.globalStateService,
                    this.sideNav.translateService,
                    this.sideNav.broadcastService,
                    this.sideNav.armService,
                    this.sideNav.cacheService,
                    this.sideNav.languageService
                );

                this._functionsNode = new FunctionsNode(this.sideNav, this.functionApp, this);

                // We're loading children here instead of in _loadChildren because AppNode
                // has a bunch of background-tasks that need to be configured whenever a
                // user selects an AppNode or one of its children. Doing it only here avoids
                // a lot of possible race conditions that could occur from either selecting
                // or toggling the tree.
                this.children = [
                    this._functionsNode
                ];
            }

            if(site.properties.state === "Running"){
                this.updateTreeForStartedSite();
            }
            else{
                this.updateTreeForStoppedSite();
            }

            this.supportsRefresh = true;
            this._doneLoading();
        })
    }

    public refresh(event){

        // Calling select won't actually reload any children because the node needs to
        // be disposed first.  This is useful because we don't want to clean up if the user
        // gets a dirty state pop-up and cancels the refresh.  If they agree, then we call dispose
        // and then can call configureBackgroundTasks to reload all children and setup background tasks.
        this.selectAsync()
        .subscribe(viewUpdated =>{
            if(viewUpdated){
                this.sideNav.aiService.trackEvent('/actions/refresh');
                this.functionApp.fireSyncTrigger();
                this.sideNav.cacheService.clearCache();
                this.dispose();
                
                this.configureBackgroundTasks(true)
                .subscribe(() =>{})
            }
        })

        if(event){
            event.stopPropagation();
        }
    }

    public remove(){
        (<AppsNode>this.parent).removeChild(this, false);

        let clearUrl = `${this.sideNav.armService.armUrl}${this.resourceId}`;
        this.sideNav.cacheService.clearCachePrefix(clearUrl);
        this.dispose();
    }

    public dispose(newSelectedNode? : TreeNode){

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

        this._dispose();
    }

    private _dispose(){
        if(this._pollingTask && !this._pollingTask.closed){
            this._pollingTask.unsubscribe();
            this._pollingTask = null;
        }

        this.sideNav.globalStateService.setTopBarNotifications([]);
    }

    public updateTreeForStoppedSite(){
        this._functionsNode.updateTreeForStoppedSite();
        this.dispose();
    }

    public updateTreeForStartedSite(){
        this.functionApp.warmupMainSite()
        .catch((err : any) => Observable.of(null))
        .subscribe(() =>{
            this._functionsNode.updateTreeForStartedSite(false);

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
                }

                if(!isLatestFunctionRuntime){
                    notifications.push({
                        message : 'A new version of Azure Functions is available. Click to visit settings.',
                        iconClass: 'fa fa-info link',
                        learnMoreLink : 'https://go.microsoft.com/fwlink/?linkid=829530',
                        clickCallback : () =>{
                            this.openFunctionTab = true;
                            this.select();
                        }
                    })
                }
            }

            this.sideNav.globalStateService.setTopBarNotifications(notifications);
        }        
    }
}
