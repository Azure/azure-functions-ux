import { ArmSiteDescriptor } from './../shared/resourceDescriptors';
import { EmbeddedFunctionsNode } from './../tree-view/embedded-functions-node';
import { ScenarioService } from './../shared/services/scenario/scenario.service';
import { LogService } from './../shared/services/log.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { StoredSubscriptions } from './../shared/models/localStorage/local-storage';
import { Dom } from './../shared/Utilities/dom';
import { SubUtil } from './../shared/Utilities/sub-util';
import { SearchBoxComponent } from './../search-box/search-box.component';
import { Component, ViewChild, AfterViewInit, Injector, OnDestroy } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from './../shared/services/config.service';
import { PortalResources } from './../shared/models/portal-resources';
import { AuthzService } from './../shared/services/authz.service';
import { LanguageService } from './../shared/services/language.service';
import { LocalStorageKeys, ARM, LogCategories, ScenarioIds } from './../shared/models/constants';
import { PortalService } from './../shared/services/portal.service';
import { LocalStorageService } from './../shared/services/local-storage.service';
import { TreeNode } from '../tree-view/tree-node';
import { AppsNode } from '../tree-view/apps-node';
import { ArmService } from '../shared/services/arm.service';
import { CacheService } from '../shared/services/cache.service';
import { UserService } from '../shared/services/user.service';
import { TryFunctionsService } from '../shared/services/try-functions.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { AiService } from '../shared/services/ai.service';
import { DropDownElement } from '../shared/models/drop-down-element';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { DashboardType } from '../tree-view/models/dashboard-type';
import { Subscription } from '../shared/models/subscription';
import { Url } from 'app/shared/Utilities/url';
import { StartupInfo } from 'app/shared/models/portal';

@Component({
  selector: 'side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements AfterViewInit, OnDestroy {
  @ViewChild('treeViewContainer')
  treeViewContainer;
  @ViewChild(SearchBoxComponent)
  searchBox: SearchBoxComponent;

  public rootNode: TreeNode;
  public subscriptionOptions: DropDownElement<Subscription>[] = [];
  public selectedSubscriptions: Subscription[] = [];
  public subscriptionsDisplayText = '';
  public allSubscriptions = this.translateService.instant(PortalResources.sideNav_AllSubscriptions);
  public numberSubscriptions = this.translateService.instant(PortalResources.sideNav_SubscriptionCount);

  public resourceId: string;
  public initialResourceId: string;

  public searchTerm = '';
  public hasValue = false;
  public headerOnTopOfSideNav = false;
  public noPaddingOnSideNav = false;

  public selectedNode: TreeNode;
  public selectedDashboardType: DashboardType;

  private _subscriptionsStream = new ReplaySubject<Subscription[]>(1);
  private _searchTermStream = new ReplaySubject<string>(1);
  private _ngUnsubscribe = new Subject();

  private _initialized = false;

  constructor(
    public injector: Injector,
    public configService: ConfigService,
    public armService: ArmService,
    public cacheService: CacheService,
    public tryFunctionsSevice: TryFunctionsService,
    public http: Http,
    public globalStateService: GlobalStateService,
    public broadcastService: BroadcastService,
    public translateService: TranslateService,
    public userService: UserService,
    public aiService: AiService,
    public localStorageService: LocalStorageService,
    public portalService: PortalService,
    public languageService: LanguageService,
    public authZService: AuthzService,
    public logService: LogService,
    public router: Router,
    public route: ActivatedRoute,
    private _scenarioService: ScenarioService
  ) {
    this.headerOnTopOfSideNav = this._scenarioService.checkScenario(ScenarioIds.headerOnTopOfSideNav).status === 'enabled';
    this.noPaddingOnSideNav = this._scenarioService.checkScenario(ScenarioIds.noPaddingOnSideNav).status === 'enabled';
    userService.getStartupInfo().subscribe(info => {
      const sitenameIncoming = !!info.resourceId ? new ArmSiteDescriptor(info.resourceId).site.toLocaleLowerCase() : null;
      const initialSiteName = !!this.initialResourceId ? new ArmSiteDescriptor(this.initialResourceId).site.toLocaleLowerCase() : null;
      if (sitenameIncoming !== initialSiteName) {
        this.portalService.sendTimerEvent({
          timerId: 'TreeViewLoad',
          timerAction: 'start',
        });
      }

      // This is a workaround for the fact that Ibiza sends us an updated info whenever
      // child blades close.  If we get a new info object, then we'll rebuild the tree.
      // The true fix would be to make sure that we never set the resourceId of the hosting
      // blade, but that's a pretty large change and this should be sufficient for now.
      if (!this._initialized && !this.globalStateService.showTryView) {
        this._initializeTree(info);
      }

      if (this._scenarioService.checkScenario(ScenarioIds.addTopLevelAppsNode).status !== 'disabled') {
        this._updateSubscriptions(info);
        this.initialResourceId = info.resourceId;
        if (this.initialResourceId) {
          const descriptor = new ArmSiteDescriptor(this.initialResourceId);
          if (descriptor.site) {
            this._searchTermStream.next(`"${descriptor.site}"`);
            this.hasValue = true;
          } else {
            this._searchTermStream.next('');
          }
        } else if (!this.searchTerm) {
          // Ensure that we don't override existing search term if we get a startupInfo update
          this._searchTermStream.next('');
        }
      }
    });
  }

  ngAfterViewInit() {
    // Search box is not available for Try Functions
    if (this.searchBox) {
      this.searchBox.focus();
    }
  }

  private _initializeTree(info: StartupInfo<void>) {
    this._initialized = true;
    this.rootNode = new TreeNode(this, null, null);

    if (this._scenarioService.checkScenario(ScenarioIds.addTopLevelAppsNode).status !== 'disabled') {
      const appsNode = new AppsNode(this, this.rootNode, this._subscriptionsStream, this._searchTermStream, info.resourceId);

      this.rootNode.children = [appsNode];
      this.rootNode.isExpanded = true;

      appsNode.parent = this.rootNode;

      // Need to allow the appsNode to wire up its subscriptions
      setTimeout(() => {
        appsNode.select();
      }, 10);

      this._searchTermStream.subscribe(term => {
        this.searchTerm = term;
      });
    } else {
      const resourceIdMatch = /\/resources([a-z0-9\-\/]+)/gi.exec(this.router.url);

      if (resourceIdMatch && resourceIdMatch.length > 1) {
        const smallerMatch = resourceIdMatch[1]
          .split('/')
          .filter(part => !!part)
          .slice(0, 4)
          .join('/');
        const smallerId = `/providers/Microsoft.BlueRidge/${smallerMatch}`;
        const functionsNode = new EmbeddedFunctionsNode(this, this.rootNode, smallerId);
        this.rootNode.children = [functionsNode];
        this.rootNode.isExpanded = true;
        functionsNode.toggle(null);
        functionsNode.select();
      } else {
        // log error
      }
    }
  }

  private _getViewContainer(): HTMLDivElement {
    const treeViewContainer = this.treeViewContainer && <HTMLDivElement>this.treeViewContainer.nativeElement;

    if (!treeViewContainer) {
      return null;
    }

    return <HTMLDivElement>treeViewContainer.querySelector('.top-level-children');
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

  public scrollIntoView() {
    setTimeout(() => {
      const containerElement = this._getViewContainer();
      if (!containerElement) {
        return;
      }

      const node = <HTMLDivElement>containerElement.querySelector(':focus');
      if (!node) {
        return;
      }

      Dom.scrollIntoView(node, containerElement);
    }, 0);
  }

  updateView(
    newSelectedNode: TreeNode,
    newDashboardType: DashboardType,
    resourceId: string,
    force?: boolean,
    keepChildBladesOpen?: boolean
  ): Observable<boolean> {
    if (this.selectedNode) {
      if (!force && this.selectedNode === newSelectedNode && this.selectedDashboardType === newDashboardType) {
        return Observable.of(false);
      } else {
        if (this.selectedNode.shouldBlockNavChange()) {
          return Observable.of(false);
        }

        this.selectedNode.handleDeselection(newSelectedNode);
        this.selectedNode.showMenu = false;
      }
    }

    this._logDashboardTypeChange(
      this.selectedDashboardType,
      newDashboardType,
      this.selectedNode && this.selectedNode.resourceId,
      newSelectedNode && newSelectedNode.resourceId
    );

    this.selectedNode = newSelectedNode;
    this.selectedDashboardType = newDashboardType;
    this.resourceId = newSelectedNode.resourceId; // TODO: should this be updated to resourceId passed in or is this fine?
    this.selectedNode.showMenu = true;

    const viewInfo = <TreeViewInfo<any>>{
      resourceId: resourceId,
      dashboardType: newDashboardType,
      node: newSelectedNode,
      data: {},
    };

    this.globalStateService.setDisabledMessage(null);

    // TODO: I can't seem to get Angular to handle case-insensitive routes properly, even if
    // I follow the example from here: https://stackoverflow.com/questions/36154672/angular2-make-route-paths-case-insensitive

    // BUG: For now we need to remove the "microsoft.web" piece from the URL or Kudu won't list functions properly:
    // https://github.com/projectkudu/kudu/issues/2543
    const navId = resourceId
      .slice(1, resourceId.length)
      .toLowerCase()
      .replace('/providers/microsoft.web', '');
    this.logService.debug(LogCategories.SideNav, `Navigating to ${navId}`);
    this.router.navigate([navId], { relativeTo: this.route, queryParams: Url.getQueryStringObj() });

    // const dashboardString = DashboardType[newDashboardType];
    // setTimeout(() => this.broadcastService.broadcastEvent(BroadcastEvent[dashboardString], viewInfo), 100);
    this.broadcastService.broadcastEvent(BroadcastEvent.TreeNavigation, viewInfo);

    this._updateTitle(newSelectedNode);

    if (!keepChildBladesOpen) {
      this.portalService.closeBlades();
    }

    return newSelectedNode.handleSelection();
  }

  navidateToNewSub() {
    const navId = 'subs/new/subscription';
    this.router.navigate([navId], { relativeTo: this.route, queryParams: Url.getQueryStringObj() });
  }

  refreshSubs() {
    this.cacheService.getArm('/subscriptions', true).subscribe(r => {
      this.userService
        .getStartupInfo()
        .first()
        .subscribe(info => {
          const subs: Subscription[] = r.json().value;
          if (!SubUtil.subsChanged(info.subscriptions, subs)) {
            return;
          }
          info.subscriptions = subs;
          this.userService.updateStartupInfo(info);
        });
    });
  }

  private _logDashboardTypeChange(
    oldDashboard: DashboardType,
    newDashboard: DashboardType,
    oldResourceId?: string,
    newResourceId?: string
  ) {
    const oldDashboardType = DashboardType[oldDashboard];
    const newDashboardType = DashboardType[newDashboard];

    this.aiService.trackEvent('/sidenav/change-dashboard', {
      newResourceId,
      oldResourceId,
      source: oldDashboardType,
      dest: newDashboardType,
    });
  }

  private _updateTitle(node: TreeNode) {
    const pathNames = node.getTreePathNames();
    let title = '';
    let subtitle = '';

    for (let i = 0; i < pathNames.length; i++) {
      if (i % 2 === 1) {
        title += pathNames[i] + ' - ';
      }
    }

    // Remove trailing dash
    if (title.length > 3) {
      title = title.substring(0, title.length - 3);
    }

    if (!title) {
      title = this.translateService.instant(PortalResources.functionApps);
      subtitle = '';
    } else {
      subtitle = this.translateService.instant(PortalResources.functionApps);
    }

    this.portalService.updateBladeInfo(title, subtitle);
  }

  clearView(resourceId: string) {
    // We only want to clear the view if the user is currently looking at something
    // under the tree path being deleted
    if (this.resourceId.startsWith(resourceId)) {
      this.router.navigate(['blank'], { relativeTo: this.route, queryParams: Url.getQueryStringObj() });
    }
  }

  search(event: any) {
    if (typeof event === 'string') {
      this._searchTermStream.next(event);
      this.hasValue = !!event;
    } else {
      this.hasValue = !!event.target.value;

      const startPos = event.target.selectionStart;
      const endPos = event.target.selectionEnd;

      // TODO: [ehamai] - this is a hack and it's not perfect.  Basically everytime we update
      // the searchTerm, we end up resetting the cursor.  It's better than before, but
      // it's still not great because if the user types really fast, the cursor still moves.
      this._searchTermStream.next(event.target.value);

      if (event.target.value.length !== startPos) {
        setTimeout(() => {
          event.target.selectionStart = startPos;
          event.target.selectionEnd = endPos;
        });
      }
    }
  }

  searchExact(term: string) {
    this.hasValue = !!term;
    this._searchTermStream.next(`"${term}"`);
  }

  clearSearch() {
    this.hasValue = false;
    this._searchTermStream.next('');
  }

  onSubscriptionsSelect(subscriptions: Subscription[]) {
    let subIds: string[];

    if (subscriptions.length === this.subscriptionOptions.length) {
      subIds = []; // Equivalent of all subs
    } else {
      subIds = subscriptions.map<string>(s => s.subscriptionId);
    }

    const storedSelectedSubIds: StoredSubscriptions = {
      id: LocalStorageKeys.savedSubsKey,
      subscriptions: subIds,
    };

    this.localStorageService.setItem(storedSelectedSubIds.id, storedSelectedSubIds);
    this.selectedSubscriptions = subscriptions;
    this._subscriptionsStream.next(subscriptions);

    if (subscriptions.length === this.subscriptionOptions.length) {
      this._updateSubDisplayText(this.allSubscriptions);
    } else if (subscriptions.length > 1) {
      this._updateSubDisplayText(this.translateService.instant(PortalResources.sideNav_SubscriptionCount).format(subscriptions.length));
    } else {
      this._updateSubDisplayText(`${subscriptions[0].displayName}`);
    }
  }

  // The multi-dropdown component has its own default display text values,
  // so we need to make sure we're always overwriting them.  But if we simply
  // set the value to the same value twice, no change notification will happen.
  private _updateSubDisplayText(displayText: string) {
    setTimeout(() => {
      this.subscriptionsDisplayText = '';
      this.subscriptionsDisplayText = displayText;
    });
  }

  private _updateSubscriptions(info: StartupInfo<void>) {
    const savedSubs = <StoredSubscriptions>this.localStorageService.getItem(LocalStorageKeys.savedSubsKey);
    const savedSelectedSubscriptionIds = savedSubs ? savedSubs.subscriptions : [];
    let descriptor: ArmSiteDescriptor | null;

    if (info.resourceId) {
      descriptor = new ArmSiteDescriptor(info.resourceId);
    }

    let count = 0;

    this.subscriptionOptions = info.subscriptions
      .map(e => {
        let subSelected: boolean;

        if (descriptor) {
          subSelected = descriptor.subscription === e.subscriptionId;
        } else {
          // Multi-dropdown defaults to all of none is selected.  So setting it here
          // helps us figure out whether we need to limit the # of initial subscriptions
          subSelected =
            savedSelectedSubscriptionIds.length === 0 || savedSelectedSubscriptionIds.findIndex(s => s === e.subscriptionId) > -1;
        }

        if (subSelected) {
          count++;
        }

        return {
          displayLabel: e.displayName,
          value: e,
          isSelected: subSelected && count <= ARM.MaxSubscriptionBatchSize,
        };
      })
      .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
  }
}
