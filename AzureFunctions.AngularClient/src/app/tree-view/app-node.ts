import { Response } from '@angular/http';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { SiteConfig } from './../shared/models/arm/site-config';
import { Subscription } from './../shared/models/subscription';
import { SiteDescriptor } from './../shared/resourceDescriptors';
import { AppsNode } from './apps-node';
import { TreeNode, Disposable, Removable } from './tree-node';
import {DashboardType} from './models/dashboard-type';
import {SideNavComponent} from '../side-nav/side-nav.component';
import {Site} from '../shared/models/arm/site';
import {SlotsNode} from './slots-node';
import {FunctionsNode} from './functions-node';
import {FunctionApp} from '../shared/function-app';
import {Observable, Subscription as RxSubscription} from 'rxjs/Rx';
import {Constants} from '../shared/models/constants';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {ErrorEvent} from '../shared/models/error-event';

export class AppNode extends TreeNode implements Disposable, Removable{
    public supportsAdvanced = true;
    public inAdvancedMode = false;
    public dashboardType = DashboardType.app;
    public disabled = false;
    public supportsScope = true;

    public title : string;
    // public subscriptionId : string;
    public subscription : string;
    public resourceGroup : string;
    public location : string;

    public functionApp : FunctionApp;

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

    protected _loadChildren(){
        this.sideNav.cacheService.getArm(this._siteArmCacheObj.id)
        .subscribe(r =>{
            let site : ArmObj<Site> = r.json();

            this.functionApp = new FunctionApp(
                site,
                this.sideNav.http,
                this.sideNav.userService,
                this.sideNav.globalStateService,
                this.sideNav.translateService,
                this.sideNav.broadcastService,
                this.sideNav.armService,
                this.sideNav.cacheService
            );

            this._functionsNode = new FunctionsNode(this.sideNav, this.functionApp, this);

            this.children = [
                this._functionsNode,
                // new SlotsNode(this.sideNav, this._siteArmCacheObj, this)
            ];

            if(site.properties.state === "Running"){
                this.handleStartedSite();
            }
            else{
                this.handleStoppedSite();
            }

            this._doneLoading();
        })
    }

    public remove(){
        (<AppsNode>this.parent).removeChild(this, false);

        let clearUrl = `${this.sideNav.armService.armUrl}${this.resourceId}`;
        this.sideNav.cacheService.clearCachePrefix(clearUrl);
        this.dispose();
    }

    public dispose(newSelectedNode? : TreeNode){
        if(newSelectedNode && newSelectedNode.resourceId.startsWith(this.resourceId)){
            return;
        }
        else if(this._pollingTask && !this._pollingTask.closed){
            this._pollingTask.unsubscribe();
            this._pollingTask = null;
        }
    }

    public handleStoppedSite(){
        this._functionsNode.handleStoppedSite();
        this.dispose();
    }

    public handleStartedSite(){
        this.functionApp.warmupMainSite()
        .catch((err : any) => Observable.of(null))
        .subscribe(() =>{
            this._functionsNode.handleStartedSite();

            if(!this._pollingTask){

                this._pollingTask = Observable.timer(1, 60000)
                    .concatMap<{ errors: string[], configResponse: Response}>(() => {
                        return Observable.zip(
                            this.functionApp.getHostErrors().catch(e => Observable.of([])),
                            this.sideNav.cacheService.getArm(`${this.resourceId}/config/web`, true),
                            (e : string[], c : Response) => ({ errors: e, configResponse: c }));
                    })
                    .catch(e => Observable.of({}))
                    .subscribe((result : {errors : string[], configResponse : Response}) => {
                        if(result && result.errors){
                            result.errors.forEach(e => {
                                this.sideNav.broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: e, details: `Host Error: ${e}` });
                                this.sideNav.aiService.trackEvent('/errors/host', { error: e, app: this.resourceId });
                            });
                        }

                        if(result && result.configResponse){
                            let config = result.configResponse.json();
                            this.functionApp.isAlwaysOn =
                                config.properties.alwaysOn === true || this.functionApp.site.properties.sku === "Dynamic" ? true : false;
                        }
                    });
            }
        })
    }
}
