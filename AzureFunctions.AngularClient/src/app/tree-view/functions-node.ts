import { TreeNode } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Subject } from 'rxjs/Rx';
import { DashboardType } from './models/dashboard-type';
import { Site } from '../shared/models/arm/site';
import { ArmObj } from '../shared/models/arm/arm-obj';
import {FunctionContainer} from '../shared/models/function-container';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {PortalResources} from '../shared/models/portal-resources';
import {FunctionInfo} from '../shared/models/function-info';
import {FunctionNode} from './function-node';
import {FunctionApp} from '../shared/function-app';

export class FunctionsNode extends TreeNode{
    public title = "Functions";
    public dashboardType = DashboardType.collection;
    private _functionApp : FunctionApp;
    private _functions : FunctionInfo[]; 

    constructor(sideNav : SideNavComponent, private _siteArmObj : ArmObj<Site>){
        super(sideNav, _siteArmObj.id + "/functions");
    }

    protected _loadChildren(){
        this.sideNav.cacheService.getArmResource(this._siteArmObj.id)
        .flatMap(site =>{

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

            return this.sideNav.functionsService.getFunctions2(site);
        })
        .subscribe(fcs => {
            let fcNodes = <FunctionNode[]>[];
            fcs.forEach(fc => {
                fc.functionApp = this._functionApp;
                fcNodes.push(new FunctionNode(this.sideNav, this._siteArmObj, fc))
            });

            this.children = fcNodes;

            this._doneLoading();
        });
    }
}