import { FunctionAppService } from 'app/shared/services/function-app.service';
import { LogCategories } from './../shared/models/constants';
import { LogService } from './../shared/services/log.service';
import { SlotNode } from './app-node';
import { TreeNode } from './tree-node';
import { DashboardType } from './models/dashboard-type';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { ArmObj } from '../shared/models/arm/arm-obj';
import { Site } from '../shared/models/arm/site';
import { PortalResources } from '../shared/models/portal-resources';
import { Subscription } from '../shared/models/subscription';

export class SlotsNode extends TreeNode {
  public dashboardType = DashboardType.SlotsDashboard;
  public newDashboardType = DashboardType.CreateSlotDashboard;
  public title = this.sideNav.translateService.instant(PortalResources.slots_label);
  private _logService: LogService;
  private _functionAppService: FunctionAppService;

  constructor(
    sideNav: SideNavComponent,
    private _subscriptions: Subscription[],
    private _siteArmCacheObj: ArmObj<Site>,
    parentNode: TreeNode
  ) {
    super(sideNav, _siteArmCacheObj.id + '/slots', parentNode, _siteArmCacheObj.id + '/slots/new/slot');

    this.nodeClass += ' collection-node';
    this.iconClass = 'tree-node-collection-icon';
    this.iconUrl = 'image/BulletList.svg';
    this._logService = sideNav.injector.get(LogService);
    this._functionAppService = sideNav.injector.get(FunctionAppService);
  }

  public loadChildren() {
    this.isLoading = true;
    return this._functionAppService.getSlotsList(this._siteArmCacheObj.id).do(
      slots => {
        this.isLoading = false;
        if (slots.isSuccessful) {
          this.children = slots.result.map(s => new SlotNode(this.sideNav, s, this, this._subscriptions));
        }
      },
      err => {
        this._logService.error(LogCategories.SideNav, '/slots-node-loadchildren', err);
        this.isLoading = false;
      }
    );
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
}
