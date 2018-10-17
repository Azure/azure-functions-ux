import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { ArmArrayResult } from './../shared/models/arm/arm-obj';
import { Subject } from 'rxjs/Subject';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { TreeUpdateEvent, BroadcastEvent } from './../shared/models/broadcast-event';
import { CacheService } from './../shared/services/cache.service';
import { FunctionInfo } from './../shared/models/function-info';
import { FunctionNode } from './function-node';
import { SideNavComponent } from './../side-nav/side-nav.component';
import { PortalResources } from './../shared/models/portal-resources';
import { DashboardType } from './models/dashboard-type';
import { Collection, TreeNode, MutableCollection } from './tree-node';
import { Observable } from 'rxjs/Observable';

export class EmbeddedFunctionsNode extends TreeNode implements Collection, MutableCollection {
  public title = this.sideNav.translateService.instant(PortalResources.functionsPreviewTitle);
  public dashboardType = DashboardType.FunctionsDashboard;
  private _cacheService: CacheService;
  private _broadcastService: BroadcastService;
  private _ngUnsubscribe = new Subject();

  constructor(sideNav: SideNavComponent, rootNode: TreeNode, parentResourceId: string) {
    super(sideNav, parentResourceId + '/functions', rootNode, null);

    this._cacheService = sideNav.injector.get(CacheService);

    this.iconClass = 'tree-node-collection-icon';
    this.iconUrl = 'image/BulletList.svg';
    this.nodeClass += ' collection-node';
    this.showExpandIcon = false;

    this._broadcastService = sideNav.injector.get(BroadcastService);
  }

  public loadChildren() {
    this.isLoading = true;

    const functionsId =
      this.resourceId
        .split('/')
        .slice(0, 5)
        .join('/') + '/functions';
    return this._cacheService.getArm(functionsId).do(
      r => {
        const fcs: ArmArrayResult<FunctionInfo> = r.json();
        this.children = fcs.value.map(fc => {
          const parts = fc.id.split('/');
          const entityId = parts.slice(0, 9).join('/');
          const name = parts[8];
          const site: any = {
            id: entityId,
            name: name,
            kind: 'functionapp',
            type: '',
            properties: {},
          };

          fc.properties.entity = parts[8];
          fc.properties.context = ArmUtil.mapArmSiteToContext(site, this.sideNav.injector);
          return new FunctionNode(this.sideNav, fc.properties.context, fc.properties, this);
        });

        this.isLoading = false;
      },
      err => {
        // TODO: ellhamai - logging
        this.isLoading = false;
      }
    );
  }

  public addChild(functionInfo: FunctionInfo) {
    this._cacheService.clearCachePrefix(functionInfo.context.urlTemplates.functionsUrl);

    const newNode = new FunctionNode(this.sideNav, functionInfo.context, functionInfo, this);
    this._addChildAlphabetically(newNode);
    newNode.select();
  }

  public removeChild(child: TreeNode) {
    const removeIndex = this.children.findIndex((childNode: TreeNode) => {
      return childNode.resourceId === child.resourceId;
    });

    this._removeHelper(removeIndex, false);
  }

  public handleSelection(): Observable<any> {
    this._broadcastService
      .getEvents<TreeUpdateEvent>(BroadcastEvent.TreeUpdate)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(event => {
        if (event.operation === 'remove') {
          const removeIndex = this.children.findIndex((childNode: TreeNode) => {
            return childNode.resourceId === event.resourceId;
          });
          this._removeHelper(removeIndex, false);
        }
      });

    return Observable.of({});
  }

  public handleDeselection(newSelectedNode?: TreeNode) {
    this._ngUnsubscribe.next();
  }
}
