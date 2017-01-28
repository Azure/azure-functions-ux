import {TreeNode} from './tree-node';
import {DashboardType} from './models/dashboard-type';
import {SideNavComponent} from '../side-nav/side-nav.component';
import {ArmObj} from '../shared/models/arm/arm-obj';
import {Site} from '../shared/models/arm/site';
import {SlotsNode} from './slots-node';
import {FunctionsNode} from './functions-node';
import {FunctionApp} from '../shared/function-app';
import {Observable, Subscription as RxSubscription} from 'rxjs/Rx';
import {Constants} from '../shared/models/constants';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {ErrorEvent} from '../shared/models/error-event';

export class AppNode extends TreeNode{
    public supportsAdvanced = true;
    public inAdvancedMode = false;
    public dashboardType = DashboardType.app;
    public disabled = false;
    private _hiddenChildren : TreeNode[];
    private _functionApp : FunctionApp;
    private _checkErrorsTask : RxSubscription;

    constructor(sideBar : SideNavComponent,
                private _siteArmCacheObj : ArmObj<Site>,
                isSearchResult : boolean,
                disabled? : boolean){
        super(sideBar, _siteArmCacheObj.id);

        this.disabled = !!disabled;
        if(disabled){
            this.supportsAdvanced = false;
        }

        this.title = isSearchResult ? `${_siteArmCacheObj.name} (App)` : _siteArmCacheObj.name;
    }

    protected _loadChildren(){
        this.sideNav.cacheService.getArmResource(this._siteArmCacheObj.id)
        .subscribe(site =>{
            this._functionApp = new FunctionApp(
                site,
                this.sideNav.http,
                this.sideNav.userService,
                this.sideNav.globalStateService,
                this.sideNav.translateService,
                this.sideNav.broadcastService,
                this.sideNav.armService,
                this.sideNav.cacheService
            );

            this._functionApp.warmupMainSite();
            this._functionApp.getHostSecrets();

            this._checkErrorsTask = Observable.timer(1, 60000)
                .concatMap<string>(() => this._functionApp.getHostErrors())
                .catch(e => Observable.of([]))
                .subscribe(errors =>{
                    errors.forEach( e=>{
                        this.sideNav.broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: e, details: `Host Error: ${e}` });
                        this.sideNav.aiService.trackEvent('/errors/host', {error: e, app: this._functionApp.site.id});
                        
                    })
            })

            this.children = [
                new FunctionsNode(this.sideNav, this._functionApp),
                new SlotsNode(this.sideNav, this._siteArmCacheObj)
            ];

            this._doneLoading();
        })
    }

    public destroy(){
        if(this._checkErrorsTask && !this._checkErrorsTask.closed){
            this._checkErrorsTask.unsubscribe();
            this._checkErrorsTask = null;
        }
    }

    // toggleAdvanced(){
    //     this.isExpanded = true;

    //     let children = this._hiddenChildren;
    //     this._hiddenChildren = this.children;

    //     if(!this.inAdvancedMode){
    //         this.inAdvancedMode = !this.inAdvancedMode;
    //         if(!children || children.length === 0){
    //             children = [new AppConfigNode(this.sideBar, this.resourceId + '/config')];
    //             if(children.length === 1){
    //                 children[0].toggle(null);
    //             }
    //         }
    //     }
    //     else{
    //         this.inAdvancedMode = !this.inAdvancedMode;
    //         if(!children || children.length === 0){
    //             this._loadChildren();
    //             return;
    //         }
    //     }

    //     this.children = children;
    // }
}
