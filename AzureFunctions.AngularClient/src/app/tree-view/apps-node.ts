import { Subscription } from './../shared/models/subscription';
import { ArmObj, ArmArrayResult } from './../shared/models/arm/arm-obj';
import { TreeNode } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Subject, Subscription as RxSubscription, Observable } from 'rxjs/Rx';
import { DashboardType } from './models/dashboard-type';
import { Site } from '../shared/models/arm/site';
import { AppNode } from './app-node';

export class AppsNode extends TreeNode {
    public title = "Function Apps";
    public dashboardType = DashboardType.collection;

    constructor(
        sideNav: SideNavComponent,
        resourceId: string,
        private _subscriptionsStream : Subject<Subscription[]>) {

        super(sideNav, resourceId, null);

        this._subscriptionsStream
        .distinctUntilChanged()
        .switchMap(subscriptions =>{
            this.children = [];

            if(!subscriptions || subscriptions.length === 0){
                return Observable.of(null);
            }
            
            this.isLoading = true;
            this.isExpanded = true;
            return this._getAllFunctionApps(subscriptions, null);
        })
        .subscribe(() =>{
            this._doneLoading();
        });
    }

    private _getAllFunctionApps(subscriptions: Subscription[], nextLink : string) : Observable<AppNode[]>{
        
        // TODO: ellhamai - Need to add back searching for slots.  I removed it for now since querying for slots in parallel is expensive, especially
        // now that we support multiple subscriptions.  Instead, querying for slots should come after we've already built the tree for sites.
        // return this.sideNav.armService.getArmCacheResources(subscriptions, nextLink, "Microsoft.Web/sites", "Microsoft.Web/sites/slots")

        return this.sideNav.cacheService.getArmCacheResources(subscriptions, nextLink, "Microsoft.Web/sites")
        .switchMap((arrayResult :ArmArrayResult) =>{
            
            this.children = this.children.concat(this._getAppNodes(arrayResult.value));

            if(arrayResult.nextLink){
                return this._getAllFunctionApps(subscriptions, arrayResult.nextLink);
            }
            else{
                return Observable.of(null);
            }
        });
    }

    private _getAppNodes(appsAndSlots: ArmObj<Site>[]): AppNode[] {
        let appNodes: AppNode[] = [];
        appsAndSlots.forEach((r1, index1) => {
            if (r1.kind === "functionapp") {
                if (r1.type === "Microsoft.Web/sites/slots") {
                    let slotParts = r1.id.split('/');
                    slotParts.length = slotParts.length - 2;
                    let siteName = slotParts[slotParts.length - 1];
                    let siteId = slotParts.join('/');
                    let siteIdLowerCase = siteId.toLowerCase();

                    let hostSite: ArmObj<Site> = null;

                    // In all the cases I've seen, when the container app exists in the list, it will
                    // be right before the slot.  So this optimizes the scenario where the container
                    // app does exist.
                    for (var i = index1 - 1; i >= 0; i--) {
                        let app = appsAndSlots[i];
                        if (app.id.toLowerCase() === siteIdLowerCase) {
                            hostSite = app;
                            break;
                        }
                    }

                    if (!hostSite) {
                        // If we haven't found the container, then we'll search up just in case.
                        for (var i = index1 + 1; i < appsAndSlots.length; i++) {
                            let app = appsAndSlots[i];
                            if (app.id.toLowerCase() === siteIdLowerCase) {
                                hostSite = app;
                                break;
                            }
                        }
                    }

                    if (!hostSite) {
                        // add a disabled app
                        let disabledSite = <ArmObj<Site>>{
                            id: siteId,
                            type: "Microsoft.Web/sites",
                            name: siteName
                        }

                        // Check for the case where an app has multiple slots
                        let foundExistingAppNode = false;
                        for (let i = appNodes.length - 1; i >= 0; i--) {
                            if (appNodes[i].resourceId.toLowerCase() === siteIdLowerCase) {
                                foundExistingAppNode = true;
                                break;
                            }
                        }

                        if (!foundExistingAppNode) {
                            appNodes.push(new AppNode(this.sideNav, disabledSite, false, this, true));
                        }
                    }
                }
                else {
                    appNodes.push(new AppNode(this.sideNav, r1, false, this));
                }
            }
        })

        return appNodes;
    }
}