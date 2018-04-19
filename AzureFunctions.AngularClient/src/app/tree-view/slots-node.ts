import { SlotNode } from './app-node';
import { TreeNode } from './tree-node';
import { DashboardType } from './models/dashboard-type';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { ArmObj } from '../shared/models/arm/arm-obj';
import { Site } from '../shared/models/arm/site';
import { PortalResources } from '../shared/models/portal-resources';
import { Subscription } from '../shared/models/subscription';

export class SlotsNode extends TreeNode {
    public dashboardType = DashboardType.slots;
    public newDashboardType = DashboardType.createSlot;
    public title = this.sideNav.translateService.instant(PortalResources.appFunctionSettings_slotsOptinSettings);
    public nodeClass = 'tree-node collection-node';

    constructor(
        sideNav: SideNavComponent,
        private _subscriptions: Subscription[],
        private _siteArmCacheObj: ArmObj<Site>,
        parentNode: TreeNode) {
        super(sideNav, _siteArmCacheObj.id + '/slots', parentNode);

        this.iconClass = 'tree-node-collection-icon';
        this.iconUrl = 'images/BulletList.svg';
    }

    public loadChildren() {
        return this.sideNav.slotsService.getSlotsList(this._siteArmCacheObj.id)
            .do(slots => {
                this.children = slots.map(s => new SlotNode(
                    this.sideNav,
                    s,
                    this,
                    this._subscriptions));
            });
    }

    public addChild(childSiteObj: ArmObj<Site>) {
        const newNode = new SlotNode(this.sideNav, childSiteObj, this, this._subscriptions);
        this._addChildAlphabetically(newNode);
        newNode.select();
        this.sideNav.cacheService.clearArmIdCachePrefix('/slots');
    }

    public removeChild(child: TreeNode, callRemoveOnChild?: boolean) {
        const removeIndex = this.children.findIndex((childNode: TreeNode) => {
            return childNode.resourceId === child.resourceId;
        });

        this._removeHelper(removeIndex, callRemoveOnChild);
        this.sideNav.cacheService.clearArmIdCachePrefix('/slots');
    }

    public dispose(newSelectedNode?: TreeNode) {
        this.parent.dispose(newSelectedNode);
    }
}
