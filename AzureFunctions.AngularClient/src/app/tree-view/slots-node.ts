import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { TreeNode } from './tree-node';
import { DashboardType } from './models/dashboard-type';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { ArmObj } from '../shared/models/arm/arm-obj';
import { Site } from '../shared/models/arm/site';
import { PortalResources } from '../shared/models/portal-resources';
import { FunctionApp } from '../shared/function-app';
import { AuthzService } from './../shared/services/authz.service';
import { SlotsService } from './../shared/services/slots.service';
import { ProxyNode } from './proxy-node';
import { AppNode, SlotNode } from './app-node';
import { FunctionInfo } from '../shared/models/function-info';
import { Subscription } from '../shared/models/subscription';
import { CacheService } from "app/shared/services/cache.service";

export class SlotsNode extends TreeNode {
    public dashboardType = DashboardType.slots;
    public newDashboardType = DashboardType.createSlot;
    public title = this.sideNav.translateService.instant(PortalResources.appFunctionSettings_slotsOptinSettings);

    constructor(
        sideNav: SideNavComponent,
        private _subscriptions: Subscription[],
        private _siteArmCacheObj: ArmObj<Site>,
        parentNode: TreeNode) {
        super(sideNav, _siteArmCacheObj.id + "/slots", parentNode);

        this.iconClass = "tree-node-collection-icon"
        this.iconUrl = "images/BulletList.svg";
    }

    public loadChildren() {
        return this.sideNav.slotsService.getSlotsList(this._siteArmCacheObj.id)
            .do(slots => {
                let slotNodes: SlotNode[] = [];
                this.children = slots.map(s => new SlotNode(
                    this.sideNav,
                    s,
                    this,
                    this._subscriptions));
            })
    }

    public addChild(childSiteObj: ArmObj<Site>) {
        let newNode = new SlotNode(this.sideNav, childSiteObj, this, this._subscriptions);
        this._addChildAlphabetically(newNode);
        newNode.select();
        this.sideNav.cacheService.clearArmIdCachePrefix('/slots');
    }

    public removeChild(child: TreeNode, callRemoveOnChild?: boolean) {
        let removeIndex = this.children.findIndex((childNode: TreeNode) => {
            return childNode.resourceId === child.resourceId;
        })

        this._removeHelper(removeIndex, callRemoveOnChild);
         this.sideNav.cacheService.clearArmIdCachePrefix('/slots');
    }
}
