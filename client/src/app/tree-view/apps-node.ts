import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { errorIds } from './../shared/models/error-ids';
import { PortalResources } from './../shared/models/portal-resources';
import { LogCategories, ScenarioIds, ARM } from './../shared/models/constants';
import { Subscription } from './../shared/models/subscription';
import { ArmObj, ArmArrayResult } from './../shared/models/arm/arm-obj';
import { TreeNode, MutableCollection, Disposable, Refreshable } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { Site } from '../shared/models/arm/site';
import { AppNode } from './app-node';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { UserService } from '../shared/services/user.service';
import { ScenarioService } from '../shared/services/scenario/scenario.service';

import { BroadcastService } from 'app/shared/services/broadcast.service';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';

interface SearchInfo {
  searchTerm: string;
  subscriptions: Subscription[];
}

export class AppsNode extends TreeNode implements MutableCollection, Disposable, Refreshable {
  public title = this.sideNav.translateService.instant(PortalResources.functionApps);
  public dashboardType = DashboardType.AppsDashboard;
  public supportsRefresh = true;

  public resourceId = '/apps';
  public isExpanded = true;
  private _exactAppSearchExp = '"(.+)"';

  private _searchTerm: string;
  private _subscriptions: Subscription[];
  private _searchInfo = new Subject<SearchInfo>();
  private _broadcastService: BroadcastService;
  private _userService: UserService;
  private _scenarioService: ScenarioService;
  private _initialResourceId: string;

  constructor(
    sideNav: SideNavComponent,
    rootNode: TreeNode,
    private _subscriptionsStream: Subject<Subscription[]>,
    private _searchTermStream: Subject<string>,
    private _permanentResourceId: string
  ) {
    // Should only be used for when the iframe is open on a specific app

    super(sideNav, null, rootNode, '/apps/new/app');

    this._initialResourceId = this._permanentResourceId;

    this.newDashboardType = null;
    this._userService = sideNav.injector.get(UserService);
    this._scenarioService = sideNav.injector.get(ScenarioService);

    this._userService.getStartupInfo().subscribe(info => {
      if (this._scenarioService.checkScenario(ScenarioIds.createApp).status === 'enabled') {
        if (info.subscriptions && info.subscriptions.length > 0) {
          this.newDashboardType = DashboardType.createApp;
          this.nodeClass += ' create-app';
        } else {
          this.newDashboardType = null;
        }
      } else {
        this.newDashboardType = null;
      }
    });

    this._broadcastService = sideNav.injector.get(BroadcastService);

    this.iconClass = 'tree-node-collection-icon';
    this.iconUrl = 'image/BulletList.svg';
    this.showExpandIcon = false;

    // Always listening for list update
    this._broadcastService.getEvents<AppNode[]>(BroadcastEvent.UpdateAppsList).subscribe(children => {
      this.children = children ? children : [];
    });

    // Always listening for subscription changes
    this._subscriptionsStream.subscribe(subs => {
      this._subscriptions = subs;

      if (!this._initialized()) {
        return;
      }

      this._searchInfo.next({
        searchTerm: this._searchTerm,
        subscriptions: subs,
      });
    });

    // Always listening for search term changes
    this._searchTermStream
      .distinctUntilChanged()
      .debounceTime(500)
      .subscribe(term => {
        this._searchTerm = term;

        if (!this._initialized()) {
          return;
        }

        this._searchInfo.next({
          searchTerm: this._searchTerm,
          subscriptions: this._subscriptions,
        });
      });

    this._searchInfo
      .switchMap(result => {
        this._broadcastService.broadcastEvent<AppNode[]>(BroadcastEvent.UpdateAppsList, null);

        this.isLoading = true;
        this.supportsRefresh = false;

        this._subscriptions = result.subscriptions;

        return this._doSearch(<AppNode[]>this.children, result.searchTerm, result.subscriptions, 0, null);
      })
      .do(
        () => {
          this.supportsRefresh = true;
        },
        err => {
          this.sideNav.logService.error(LogCategories.SideNav, '/search-error', err);
        }
      )
      .retry()
      .subscribe((result: { term: string; children: TreeNode[] }) => {
        try {
          if (!result) {
            this.isLoading = false;
            return;
          }

          const regex = new RegExp(this._exactAppSearchExp, 'i');
          const exactSearchResult = regex.exec(result.term);

          if (exactSearchResult && exactSearchResult.length > 1) {
            this.supportsRefresh = false;

            const filteredChildren = result.children.filter(c => {
              if (c.title.toLowerCase() === exactSearchResult[1].toLowerCase()) {
                c.select();
                return true;
              }

              return false;
            });

            // Purposely don't update the stream with the filtered list of children.
            // This is because we only want the exact matching to affect the tree view,
            // not any other listeners.
            this._broadcastService.broadcastEvent<AppNode[]>(BroadcastEvent.UpdateAppsList, result.children as AppNode[]);
            this.children = filteredChildren;

            // Scoping to an app will cause the currently focused item in the tree to be
            // recreated.  In that case, we'll just refocus on the root node.  It's probably
            // not ideal but simple for us to do.
            this.treeView.setFocus(this);
          } else {
            this.supportsRefresh = true;
          }

          this.isLoading = false;
        } catch (err) {
          this.isLoading = false;
          this.sideNav.logService.error(LogCategories.SideNav, '/parse-search', err);
        }
      });
  }

  public handleSelection(): Observable<any> {
    this.inSelectedTree = true;
    this.supportsRefresh = true;
    return Observable.of(null);
  }

  public handleDeselection() {
    // For now, we're just hiding the refresh icon if you're not currently on the apps node.  The only reason
    // is because we're not properly handling the restoration of the selection properly if you're currently
    // selected on a node that's a few levels deep in the tree.  If we fix that, then we just need to also
    // make sure that we check for dirty state before we allow someone to refresh.
    this.inSelectedTree = false;
    this.supportsRefresh = false;

    this._initialResourceId = '';
  }

  public handleRefresh(): Observable<any> {
    this.sideNav.cacheService.clearArmIdCachePrefix(`/resources`);

    this.isLoading = true;

    this._searchInfo.next({
      searchTerm: this._searchTerm,
      subscriptions: this._subscriptions,
    });

    return Observable.of(null);
  }

  private _initialized() {
    return this._subscriptions && this._subscriptions.length > 0 && this._searchTerm !== undefined;
  }

  private _getFakeSitesArrayResult(children: AppNode[], subscriptions: Subscription[], term: string, exactSearch: boolean) {
    // Return a fake ArmArryResult containing a single fake site object corresponding to _permanentResourceId
    // Only add the fake site object to the fake result if all of the following are true:
    //  - A child node corresonding to _permanentResourceId doesn't already exist.
    //  - The subscription for _permanentResourceId matches one of the values in the subscriptions filter array.
    //  - The site name for _permanentResourceId matches the filter term.

    const fakeArrayResult: ArmArrayResult<any> = { value: [], nextLink: null };

    try {
      if (!!this._permanentResourceId) {
        const nodeIndex = children.findIndex(
          c => !!c.resourceId && c.resourceId.toLocaleLowerCase() === this._permanentResourceId.toLocaleLowerCase()
        );
        const nodeAlreadyExists = nodeIndex !== -1;
        if (!nodeAlreadyExists) {
          const siteDescriptor = new ArmSiteDescriptor(this._permanentResourceId);
          const [siteName, siteSubscription] = [siteDescriptor.site, siteDescriptor.subscription];

          const suscriptionMatches = subscriptions.findIndex(s => s.subscriptionId.toLowerCase() === siteSubscription.toLowerCase()) !== -1;
          if (suscriptionMatches) {
            const exactNameMatch = exactSearch && term.toLocaleLowerCase() === `"${siteName.toLocaleLowerCase()}"`;
            const nonExactNameMatch = !exactSearch && (!term || siteName.indexOf(term) !== -1);
            if (exactNameMatch || nonExactNameMatch) {
              fakeArrayResult.value.push({
                id: this._permanentResourceId,
                kind: 'functionapp',
                location: '---',
                name: siteName,
                type: 'Microsoft.Web/sites',
              } as ArmObj<any>);
            }
          }
        }
      }
    } catch (e) {}

    return fakeArrayResult;
  }

  private _doSearch(
    children: AppNode[],
    term: string,
    subscriptions: Subscription[],
    subsIndex: number,
    nextLink: string
  ): Observable<{ term: string; children: TreeNode[] }> {
    let url: string = null;

    const regex = new RegExp(this._exactAppSearchExp, 'i');
    const exactSearchResult = regex.exec(term);
    const exactSearch = !!exactSearchResult && exactSearchResult.length > 1;

    const subsBatch = subscriptions.slice(subsIndex, subsIndex + ARM.MaxSubscriptionBatchSize);

    // If the user wants an exact match, then we'll query everything and then filter to that
    // item.  This would be slower for some scenario's where you do an exact search and there
    // is already a filtered list.  But it will be much faster if the full list is already cached.
    if (!term || exactSearch) {
      url = this._getArmCacheUrl(subsBatch, nextLink, 'Microsoft.Web/sites');
    } else {
      url = this._getArmSearchUrl(term, subsBatch, nextLink);
    }

    const sitesPromise = this.sideNav.cacheService
      .get(url, false, null, true)
      .map(r => {
        return !!r ? (r.json() as ArmArrayResult<any>) : null;
      })
      .catch((e: any) => {
        const err = (e && e.json && e.json().error) || { message: 'Failed to query for resources.' };
        this.sideNav.logService.error(LogCategories.SideNav, errorIds.failedToQueryArmResource, err);

        // The /resources API call failed, so we're going to fallback to a fake result object.
        const fakeArraryResult = this._getFakeSitesArrayResult(children, subscriptions, term, exactSearch);
        return Observable.of(fakeArraryResult);
      });

    return sitesPromise
      .switchMap(result => {
        if (!result) {
          return Observable.of(null);
        }

        const nodes = result.value.filter(ArmUtil.isFunctionApp).map(armObj => {
          let newNode: AppNode;
          if (armObj.id === this.sideNav.selectedNode.resourceId) {
            newNode = <AppNode>this.sideNav.selectedNode;
          } else {
            newNode = new AppNode(this.sideNav, armObj, this, subscriptions);
            if (newNode.resourceId === this._initialResourceId) {
              newNode.select();
            }
          }

          return newNode;
        });

        children = children.concat(nodes);

        // Only update children if we're not doing an exact match.  For exact matches, we
        // wait until everything is done loading and then show the final result
        if (!exactSearch) {
          this._broadcastService.broadcastEvent<AppNode[]>(BroadcastEvent.UpdateAppsList, children);
        }

        if (result.nextLink || subsIndex + ARM.MaxSubscriptionBatchSize < subscriptions.length) {
          return this._doSearch(children, term, subscriptions, subsIndex + ARM.MaxSubscriptionBatchSize, result.nextLink);
        } else {
          return Observable.of({
            term: term,
            children: children,
          });
        }
      })
      .share();
  }

  public addChild(childSiteObj: ArmObj<Site>) {
    const newNode = new AppNode(this.sideNav, childSiteObj, this, this._subscriptions);
    this._addChildAlphabetically(newNode);
    newNode.select();
  }

  public removeChild(child: TreeNode, callRemoveOnChild?: boolean) {
    const removeIndex = this.children.findIndex((childNode: TreeNode) => {
      return childNode.resourceId === child.resourceId;
    });

    this._removeHelper(removeIndex, callRemoveOnChild);
    this._broadcastService.broadcastEvent<AppNode[]>(BroadcastEvent.UpdateAppsList, this.children as AppNode[]);
    this.sideNav.cacheService.clearArmIdCachePrefix(`/resources`);
  }

  private _getArmCacheUrl(subs: Subscription[], nextLink: string, type1: string, type2?: string) {
    let url: string;

    if (nextLink) {
      url = nextLink;
    } else {
      url = `${this.sideNav.armService.armUrl}/resources?api-version=${this.sideNav.armService.armApiVersion}&$filter=(`;

      for (let i = 0; i < subs.length; i++) {
        url += `subscriptionId eq '${subs[i].subscriptionId}'`;
        if (i < subs.length - 1) {
          url += ` or `;
        }
      }

      url += `) and (resourceType eq '${type1}'`;

      if (type2) {
        url += ` or resourceType eq '${type2}'`;
      }

      url += `)`;
    }

    return url;
  }

  private _getArmSearchUrl(term: string, subs: Subscription[], nextLink: string) {
    let url: string;
    if (nextLink) {
      url = nextLink;
    } else {
      url = `${this.sideNav.armService.armUrl}/resources?api-version=${
        this.sideNav.armService.armApiVersion
      }&$filter=(resourceType eq 'microsoft.web/sites') and (`;

      for (let i = 0; i < subs.length; i++) {
        url += `subscriptionId eq '${subs[i].subscriptionId}'`;
        if (i < subs.length - 1) {
          url += ` or `;
        }
      }

      url += `) and (substringof('${term}', name))`;
    }

    return url;
  }
}
