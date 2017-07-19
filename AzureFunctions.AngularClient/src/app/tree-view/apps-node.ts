import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';

import { ErrorIds } from './../shared/models/error-ids';
import { PortalResources } from './../shared/models/portal-resources';
import { Arm } from './../shared/models/constants';
import { StorageAccount } from './../shared/models/storage-account';
import { Subscription } from './../shared/models/subscription';
import { ArmObj, ArmArrayResult } from './../shared/models/arm/arm-obj';
import { TreeNode, MutableCollection, Disposable, Refreshable } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { Site } from '../shared/models/arm/site';
import { AppNode } from './app-node';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';

export class AppsNode extends TreeNode implements MutableCollection, Disposable, Refreshable {
    public title = this.sideNav.translateService.instant(PortalResources.functionApps);
    public dashboardType = DashboardType.apps;

    public resourceId = "/apps";
    public childrenStream = new ReplaySubject<AppNode[]>(1);
    public isExpanded = true;
    private _exactAppSearchExp = '\"(.+)\"';
    private _subscriptions: Subscription[];

    constructor(
        sideNav: SideNavComponent,
        rootNode: TreeNode,
        private _subscriptionsStream: Subject<Subscription[]>,
        private _searchTermStream: Subject<string>,
        private _initialResourceId: string) {  // Should only be used for when the iframe is open on a specific app

        super(sideNav, null, rootNode);

        this.newDashboardType = sideNav.configService.isStandalone() ? DashboardType.createApp : null;
        this.inSelectedTree = !!this.newDashboardType;

        this.iconClass = "tree-node-collection-icon"
        this.iconUrl = "images/BulletList.svg";
        this.showExpandIcon = false;
        this.childrenStream.subscribe(children => {
            this.children = children;
        })

        let searchStream = this._searchTermStream
            .debounceTime(400)
            .distinctUntilChanged()
            .switchMap((searchTerm) => {
                return this._subscriptionsStream.distinctUntilChanged()
                    .map(subscriptions => {
                        return {
                            searchTerm: searchTerm,
                            subscriptions: subscriptions
                        };
                    });
            })
            .switchMap(result => {

                if (!result.subscriptions || result.subscriptions.length === 0) {
                    return Observable.of(null);
                }

                // Purposely not calling next on childrenStream because that would cause appsListComponent
                // to think that loading is complete with empty children, when really you want it to
                // only update when we get responses from the server.
                this.children = [];

                this.isLoading = true;
                this._subscriptions = result.subscriptions;
                return this._doSearch(<AppNode[]>this.children, result.searchTerm, result.subscriptions, 0, null);
            })
            .subscribe((result: { term: string, children: TreeNode[] }) => {
                if (!result) {
                    this.isLoading = false;
                    return;
                }

                let regex = new RegExp(this._exactAppSearchExp, "i");
                let exactSearchResult = regex.exec(result.term);

                if (exactSearchResult && exactSearchResult.length > 1) {
                    let filteredChildren = result.children.filter(c => {
                        if (c.title.toLowerCase() === exactSearchResult[1].toLowerCase()) {
                            c.select();
                            return true;
                        }

                        return false;
                    })

                    // Purposely don't update the stream with the filtered list of children.
                    // This is because we only want the exact matching to affect the tree view,
                    // not any other listeners.
                    this.childrenStream.next(<AppNode[]>result.children);
                    this.children = filteredChildren;

                    // Scoping to an app will cause the currently focused item in the tree to be
                    // recreated.  In that case, we'll just refocus on the root node.  It's probably
                    // not ideal but simple for us to do.
                    this.treeView.setFocus(this);
                }

                this.isLoading = false;
            });
    }

    public dispose() {
        this._initialResourceId = "";
    }

    private _doSearch(
        children: AppNode[],
        term: string,
        subscriptions: Subscription[],
        subsIndex: number,
        nextLink: string): Observable<{ term: string, children: TreeNode[] }> {

        let url: string = null;

        let regex = new RegExp(this._exactAppSearchExp, "i");
        let exactSearchResult = regex.exec(term);
        let exactSearch = !!exactSearchResult && exactSearchResult.length > 1;

        let subsBatch = subscriptions.slice(subsIndex, subsIndex + Arm.MaxSubscriptionBatchSize);

        // If the user wants an exact match, then we'll query everything and then filter to that
        // item.  This would be slower for some scenario's where you do an exact search and there
        // is already a filtered list.  But it will be much faster if the full list is already cached.
        if (!term || exactSearch) {
            url = this._getArmCacheUrl(subsBatch, nextLink, "Microsoft.Web/sites");
        }
        else {
            url = this._getArmSearchUrl(term, subsBatch, nextLink);
        }

        return this.sideNav.cacheService.get(url, false, null, true)
            .catch(e => {
                let err = e && e.json && e.json().error;

                if (!err) {
                    err = { message: "Failed to query for resources." }
                }

                this.sideNav.broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: err.message,
                    details: err.code,
                    errorId: ErrorIds.failedToQueryArmResource,
                    errorType: ErrorType.ApiError,
                    resourceId: 'none'
                });
                return Observable.of(null);
            })
            .switchMap(r => {
                if (!r) {
                    return Observable.of(r);
                }

                let result: ArmArrayResult = r.json();
                let nodes = result.value
                    .filter(armObj => {
                        return armObj.kind && armObj.kind.toLowerCase() === "functionapp";
                    })
                    .map(armObj => {

                        let newNode: AppNode;
                        if (armObj.id === this.sideNav.selectedNode.resourceId) {
                            newNode = <AppNode>this.sideNav.selectedNode;
                        }
                        else {
                            newNode = new AppNode(this.sideNav, armObj, this, subscriptions);
                            if (newNode.resourceId === this._initialResourceId) {
                                newNode.select();
                            }
                        }

                        return newNode;
                    })

                children = children.concat(nodes);

                // Only update children if we're not doing an exact match.  For exact matches, we
                // wait until everything is done loading and then show the final result
                if (!exactSearch) {
                    this.childrenStream.next(children);
                }

                if (result.nextLink || (subsIndex + Arm.MaxSubscriptionBatchSize < subscriptions.length)) {
                    return this._doSearch(
                        children,
                        term,
                        subscriptions,
                        subsIndex + Arm.MaxSubscriptionBatchSize,
                        result.nextLink);
                }
                else {
                    return Observable.of({
                        term: term,
                        children: children,
                    });
                }
            })
    }

    public addChild(childSiteObj: ArmObj<Site>) {
        let newNode = new AppNode(this.sideNav, childSiteObj, this, this._subscriptions);
        this._addChildAlphabetically(newNode);
        newNode.select();
    }

    public removeChild(child: TreeNode, callRemoveOnChild?: boolean) {
        let removeIndex = this.children.findIndex((childNode: TreeNode) => {
            return childNode.resourceId === child.resourceId;
        })

        this._removeHelper(removeIndex, callRemoveOnChild);
        this.childrenStream.next(<AppNode[]>this.children);
        this.sideNav.cacheService.clearArmIdCachePrefix(`/resources`);
    }

    private _getArmCacheUrl(subs: Subscription[], nextLink: string, type1: string, type2?: string) {
        let url: string;

        if (nextLink) {
            url = nextLink;
        }
        else {
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
        }
        else {
            url = `${this.sideNav.armService.armUrl}/resources?api-version=${this.sideNav.armService.armApiVersion}&$filter=(resourceType eq 'microsoft.web/sites') and (`;

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
