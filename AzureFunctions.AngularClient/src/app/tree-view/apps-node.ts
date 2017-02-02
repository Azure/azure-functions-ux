import { RootNode } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Subject } from 'rxjs/Rx';
import { DashboardType } from './models/dashboard-type';
import { Site } from '../shared/models/arm/site';
import { ArmObj } from '../shared/models/arm/arm-obj';
import { AppNode } from './app-node';

export class AppsNode extends RootNode {
    public title = "Function Apps";
    public dashboardType = DashboardType.collection;

    constructor(
        sideNav: SideNavComponent,
        resourceId: string,
        subscriptionIdObs: Subject<string>) {

        super(sideNav, resourceId, subscriptionIdObs);
    }

    protected _loadChildren() {
        this.sideNav.armService.getArmCacheResources(this._subscriptionId, "Microsoft.Web/sites", "Microsoft.Web/sites/slots")
            .subscribe(appsAndSlots => {
                this.children = this._getAppNodes(appsAndSlots);
                this._doneLoading();
            })
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