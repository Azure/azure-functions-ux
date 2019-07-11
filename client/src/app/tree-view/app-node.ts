import { ScenarioIds, LogCategories, SiteTabIds } from './../shared/models/constants';
import { FunctionAppService } from './../shared/services/function-app.service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { Subject } from 'rxjs/Subject';
import { LogService } from './../shared/services/log.service';
import { ScenarioService } from './../shared/services/scenario/scenario.service';
import { Observable } from 'rxjs/Observable';
import { PortalResources } from './../shared/models/portal-resources';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { ArmSiteDescriptor } from './../shared/resourceDescriptors';
import { AppsNode } from './apps-node';
import { TreeNode, Disposable, Removable, CustomSelection, Collection, Refreshable, CanBlockNavChange } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Site } from '../shared/models/arm/site';
import { SlotsNode } from './slots-node';
import { FunctionsNode } from './functions-node';
import { ProxiesNode } from './proxies-node';
import { Subscription } from 'app/shared/models/subscription';
import { BroadcastEvent, TreeUpdateEvent } from 'app/shared/models/broadcast-event';
import { BroadcastService } from './../shared/services/broadcast.service';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';

export class AppNode extends TreeNode implements Disposable, Removable, CustomSelection, Collection, Refreshable, CanBlockNavChange {
  public supportsAdvanced = true;
  public inAdvancedMode = false;
  public dashboardType = DashboardType.AppDashboard;
  public disabled = false;
  public supportsScope = false;
  public supportsRefresh = false;
  public isSlot = false; // both slot & function are of type app, this is used to distinguish

  public title: string;
  public subscription: string;
  public resourceGroup: string;
  public location: string;
  public subscriptionId: string;

  public slotProperties: any;
  public openTabId: string | null;

  public iconClass = 'tree-node-svg-icon';
  public iconUrl = 'image/functions.svg';

  private _ngUnsubscribe = new Subject();

  private _scenarioService: ScenarioService;
  private _logService: LogService;
  private _functionAppService: FunctionAppService;
  private _broadcastService: BroadcastService;

  constructor(
    sideBar: SideNavComponent,
    private _siteArmCacheObj: ArmObj<Site>,
    parentNode: TreeNode,
    private _subscriptions: Subscription[],
    disabled?: boolean
  ) {
    super(sideBar, _siteArmCacheObj.id, parentNode);

    this._functionAppService = this.sideNav.injector.get(FunctionAppService);
    this._scenarioService = this.sideNav.injector.get(ScenarioService);
    this._logService = this.sideNav.injector.get(LogService);
    this._broadcastService = this.sideNav.injector.get(BroadcastService);

    this.disabled = !!disabled;
    if (disabled) {
      this.supportsAdvanced = false;
    }

    this.title = _siteArmCacheObj.name;
    this.location = _siteArmCacheObj.location;

    const descriptor = new ArmSiteDescriptor(_siteArmCacheObj.id);
    this.resourceGroup = descriptor.resourceGroup;

    this.nodeClass += ' app-node';

    const sub = _subscriptions.find(sub => {
      return sub.subscriptionId === descriptor.subscription;
    });

    this.subscription = sub && sub.displayName;
    this.subscriptionId = sub && sub.subscriptionId;

    this.supportsScope = !descriptor.slot;
  }

  public loadChildren() {
    this.supportsRefresh = false;
    this.isLoading = true;

    return this._functionAppService
      .getAppContext(this.resourceId)
      .do(
        context => {
          this.isLoading = false;
          this.supportsRefresh = true;

          const children: TreeNode[] = [new FunctionsNode(this.sideNav, context, this), new ProxiesNode(this.sideNav, context, this)];

          if (!ArmUtil.isLinuxDynamic(context.site)) {
            children.push(new SlotsNode(this.sideNav, this._subscriptions, this._siteArmCacheObj, this));
          }

          const filteredChildren = this._scenarioService.checkScenario(ScenarioIds.filterAppNodeChildren, {
            site: context.site,
            appNodeChildren: children,
          });

          this.children = filteredChildren && filteredChildren.data ? filteredChildren.data : children;
          this.children.forEach(c => {
            if (c.dashboardType === DashboardType.FunctionsDashboard) {
              c.toggle(null);
            }
          });
        },
        err => {
          this.supportsRefresh = true;
          this.isLoading = false;
          this._logService.error(LogCategories.SideNav, '/app-node/loadChildren', err);
        }
      )
      .map(context => context);
  }

  public shouldBlockNavChange() {
    let canSwitchNodes = true;
    const isDirty = this.sideNav.broadcastService.getDirtyState();

    if (isDirty) {
      canSwitchNodes = confirm(
        this.sideNav.translateService.instant(PortalResources.siteDashboard_confirmLoseChanges).format(this._siteArmCacheObj.name)
      );

      if (canSwitchNodes) {
        this.sideNav.broadcastService.clearAllDirtyStates();
      }
    }

    return !canSwitchNodes;
  }

  public handleSelection(): Observable<any> {
    // Always listening for tree update
    this._broadcastService
      .getEvents<TreeUpdateEvent>(BroadcastEvent.TreeUpdate)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(event => {
        if (event.operation === 'newFunction') {
          (<FunctionsNode>this.children[0]).addChild(event.data);
        } else if (event.operation === 'moreTemplates') {
          (<FunctionsNode>this.children[0]).openCreateDashboard(DashboardType.CreateFunctionDashboard);
        }
      });

    return Observable.of({});
  }

  public handleRefresh(): Observable<any> {
    if (this.sideNav.selectedNode.shouldBlockNavChange()) {
      return Observable.of(null);
    }

    // Don't need to check for existing loadChildren operations because the refresh button shouldn't
    // be visible during load.
    this.sideNav.aiService.trackEvent('/actions/refresh');
    this.sideNav.cacheService.clearCache();

    return this.loadChildren().do(context => {
      this._functionAppService.fireSyncTrigger(context);
      if (this.children && this.children.length === 1 && !this.children[0].isExpanded) {
        this.children[0].toggle(null);
      }
    });
  }

  public remove() {
    if (this.isSlot) {
      (<SlotsNode>this.parent).removeChild(this, false);
    } else {
      (<AppsNode>this.parent).removeChild(this, false);
    }
    this.sideNav.cacheService.clearArmIdCachePrefix(this.resourceId);
    this.handleDeselection();
  }

  public handleDeselection(newSelectedNode?: TreeNode) {
    this.inSelectedTree = false;
    this.children.forEach(c => (c.inSelectedTree = false));

    this.sideNav.globalStateService.setTopBarNotifications([]);
    this.sideNav.broadcastService.clearAllDirtyStates();

    this._ngUnsubscribe.next();
  }

  public clearNotification(id: string) {
    this.sideNav.globalStateService.topBarNotificationsStream.take(1).subscribe(notifications => {
      notifications = notifications.filter(n => n.id !== id);
      this.sideNav.globalStateService.setTopBarNotifications(notifications);
    });
  }

  public openSettings() {
    this.openTabId = SiteTabIds.functionRuntime;
    this.select(true /* force */);
  }
}

/*
    NOTE: SlotNode extends from AppNode, if this is in a seperate file,
    the initialization fails
*/
export class SlotNode extends AppNode {
  constructor(
    sideBar: SideNavComponent,
    siteArmCacheObj: ArmObj<Site>,
    parentNode: TreeNode,
    subscriptions: Subscription[],
    disabled?: boolean
  ) {
    super(sideBar, siteArmCacheObj, parentNode, subscriptions, disabled);
    const slotName = siteArmCacheObj.name;
    this.title = slotName.substring(slotName.indexOf('/') + 1); // change to display name
    this.slotProperties = siteArmCacheObj.properties;
    this.isSlot = true;
  }
}
