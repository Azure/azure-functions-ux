import { ProxiesNode } from './proxies-node';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { TreeUpdateEvent } from './../shared/models/broadcast-event';
import { Subject } from 'rxjs/Subject';
import { BroadcastService } from './../shared/services/broadcast.service';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { Site } from './../shared/models/arm/site';
import { FunctionNode } from './function-node';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { TreeNode, CanBlockNavChange, Disposable, CustomSelection } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { ApiProxy } from '../shared/models/api-proxy';

export class ProxyNode extends TreeNode implements CanBlockNavChange, Disposable, CustomSelection {
  public title = 'Proxy';
  public dashboardType = DashboardType.ProxyDashboard;
  public showExpandIcon = false;
  private _broadcastService: BroadcastService;
  private _ngUnsubscribe = new Subject();

  constructor(sideNav: SideNavComponent, public proxy: ApiProxy, site: ArmObj<Site>, parentNode: TreeNode) {
    super(sideNav, site.id + '/proxies/' + proxy.name, parentNode);

    this._broadcastService = sideNav.injector.get(BroadcastService);

    this.title = proxy.name;
    this.iconClass = 'tree-node-svg-icon';
    this.iconUrl = 'image/api-proxy.svg';
  }

  public handleSelection(): Observable<any> {
    this._broadcastService
      .getEvents<TreeUpdateEvent>(BroadcastEvent.TreeUpdate)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(event => {
        if (event.operation === 'remove') {
          (<ProxiesNode>this.parent).removeChild(event.resourceId);
          this.handleDeselection();
        }
      });

    return Observable.of({});
  }

  public handleDeselection(newSelectedNode?: TreeNode) {
    this._ngUnsubscribe.next();
    this.sideNav.broadcastService.clearAllDirtyStates();
  }

  public getViewData(): any {
    return this.proxy;
  }

  public shouldBlockNavChange(): boolean {
    return FunctionNode.blockNavChangeHelper(this);
  }
}
