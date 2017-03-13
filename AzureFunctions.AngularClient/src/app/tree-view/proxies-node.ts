import { AuthzService } from './../shared/services/authz.service';
import { AppNode } from './app-node';
import { FunctionDescriptor } from './../shared/resourceDescriptors';
import { TreeNode, MutableCollection, Disposable, CustomSelection, Collection} from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Subject, Observable } from 'rxjs/Rx';
import { DashboardType } from './models/dashboard-type';
import { Site } from '../shared/models/arm/site';
import { ArmObj } from '../shared/models/arm/arm-obj';
import {FunctionContainer} from '../shared/models/function-container';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {PortalResources} from '../shared/models/portal-resources';
//import {FunctionInfo} from '../shared/models/function-info';
import {ApiProxy} from '../shared/models/api-proxy';
import {ProxyNode} from './proxy-node';
import {FunctionApp} from '../shared/function-app';

export class ProxiesNode extends TreeNode implements MutableCollection, Disposable, CustomSelection, Collection{
    public title = "Proxies (preview)";
    public dashboardType = DashboardType.proxies;
    public newDashboardType = DashboardType.createProxy;

    constructor(
        sideNav : SideNavComponent,
        public functionApp : FunctionApp,
        parentNode : TreeNode){
        super(sideNav, functionApp.site.id + "/proxies", parentNode);
    }

    public loadChildren(){
        if(this.functionApp.site.properties.state === "Running"){
            return this.sideNav.authZService.hasPermission(this.functionApp.site.id, [AuthzService.writeScope])
            .switchMap(hasWritePermission =>{
                if(hasWritePermission){
                    return this._updateTreeForStartedSite();
                }

                return this._updateTreeForNonUsableState("Functions (No Access)");
            })

        }
        else{
            return this._updateTreeForNonUsableState("Functions (Stopped)");
        }
    }

    public handleSelection() : Observable<any>{
        if(!this.disabled){
            return (<AppNode>this.parent).initialize();
        }

        return Observable.of({});
    }

    public addChild(functionInfo : ApiProxy){
        functionInfo.functionApp = this.functionApp;
        
        let newNode = new ProxyNode(this.sideNav, this, functionInfo, this);
        this.children.push(newNode);
        newNode.select();
    }

    public removeChild(functionInfo : ApiProxy, callRemoveOnChild? : boolean){
        
        let removeIndex = this.children.findIndex((childNode : ProxyNode) =>{
            return childNode.proxy.name === functionInfo.name;
        })

        this._removeHelper(removeIndex, callRemoveOnChild);
    }
    
    public dispose(newSelectedNode? : TreeNode){
        this.parent.dispose(newSelectedNode);
    }

    private _updateTreeForNonUsableState(title : string){
        this.newDashboardType = null;
        this.children = [];
        this.title = title;
        this.showExpandIcon = false;
        this.sideNav.cacheService.clearCachePrefix(`${this.functionApp.getScmUrl()}/api/functions`);
        return Observable.of(null);
    }

    private _updateTreeForStartedSite(){
        this.title = this.sideNav.translateService.instant(PortalResources.appFunctionSettings_apiProxies);
        this.newDashboardType = DashboardType.createProxy;
        this.showExpandIcon = true;

        if(!this.children || this.children.length === 0){
            return this.functionApp.getApiProxies()
            .map(proxies =>{
                let fcNodes = <ProxyNode[]>[];
                proxies.forEach(proxy => {
                    proxy.functionApp = this.functionApp;
                    fcNodes.push(new ProxyNode(this.sideNav, this, proxy, this))
                });

                this.children = fcNodes;

                return null;
            });        
        }
        else{
            return Observable.of(null);
        }
    }
}