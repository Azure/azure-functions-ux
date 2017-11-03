import { DashboardType } from 'app/tree-view/models/dashboard-type';
// import { TreeUpdateEvent } from './../shared/models/broadcast-event';
import { BroadcastService } from 'app/shared/services/broadcast.service';
// import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { FunctionsService } from './../shared/services/functions-service';
import { LogCategories } from 'app/shared/models/constants';
import { LogService } from './../shared/services/log.service';
import { CacheService } from './../shared/services/cache.service';
import { ScenarioService } from './../shared/services/scenario/scenario.service';
import { SiteTabIds, ScenarioIds } from './../shared/models/constants';
// import { SiteService } from './../shared/services/slots.service';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/zip';

import { PortalResources } from './../shared/models/portal-resources';
// import { ErrorIds } from './../shared/models/error-ids';
// import { TopBarNotification } from './../top-bar/top-bar-models';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { SiteDescriptor } from './../shared/resourceDescriptors';
import { AppsNode } from './apps-node';
import { TreeNode, Disposable, Removable, CustomSelection, Collection, Refreshable, CanBlockNavChange } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Site } from '../shared/models/arm/site';
import { SlotsNode } from './slots-node';
import { FunctionsNode } from './functions-node';
import { ProxiesNode } from './proxies-node';
import { FunctionApp } from '../shared/function-app';
import { Subscription } from 'app/shared/models/subscription';
// import { Constants, NotificationIds } from '../shared/models/constants';
// import { BroadcastEvent } from '../shared/models/broadcast-event';
// import { ErrorEvent, ErrorType } from '../shared/models/error-event';
// import { FunctionsVersionInfoHelper } from '../../../../common/models/functions-version-info';
// import { ArmUtil } from 'app/shared/Utilities/arm-utils';

export class AppNode extends TreeNode
    implements Disposable, Removable, CustomSelection, Collection, Refreshable, CanBlockNavChange {

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

    public functionAppStream = new ReplaySubject<FunctionApp>(1);
    public slotProperties: any;
    public openTabId: string | null;

    public iconClass = 'tree-node-svg-icon';
    public iconUrl = 'image/functions.svg';

    // private _treeUpdateSubscription: RxSubscription;
    private _ngUnsubscribe = new Subject();

    private _functionsService: FunctionsService;
    private _scenarioService: ScenarioService;
    private _cacheService: CacheService;
    private _logService: LogService;
    private _broadcastService: BroadcastService;

    constructor(sideBar: SideNavComponent,
        private _siteArmCacheObj: ArmObj<Site>,
        parentNode: TreeNode,
        private _subscriptions: Subscription[],
        disabled?: boolean) {
        super(sideBar, _siteArmCacheObj.id, parentNode);

        this._functionsService = this.sideNav.injector.get(FunctionsService);
        this._scenarioService = this.sideNav.injector.get(ScenarioService);
        this._cacheService = this.sideNav.injector.get(CacheService);
        this._logService = this.sideNav.injector.get(LogService);
        this._broadcastService = this.sideNav.injector.get(BroadcastService);

        this.disabled = !!disabled;
        if (disabled) {
            this.supportsAdvanced = false;
        }

        this.title = _siteArmCacheObj.name;
        this.location = _siteArmCacheObj.location;

        const descriptor = new SiteDescriptor(_siteArmCacheObj.id);
        this.resourceGroup = descriptor.resourceGroup;

        this.nodeClass += ' app-node';

        const sub = _subscriptions.find(sub => {
            return sub.subscriptionId === descriptor.subscription;
        });

        this.subscription = sub && sub.displayName;
        this.subscriptionId = sub && sub.subscriptionId;
    }

    public handleSelection(): Observable<any> {
        // if (!this._treeUpdateSubscription) {
        //     this._treeUpdateSubscription = this._broadcastService.getEvents<TreeUpdateEvent>(BroadcastEvent.TreeUpdate)
        //         .takeUntil(this._ngUnsubscribe)
        //         .subscribe(event => {
        //             if (event.dashboardType === DashboardType.FunctionDashboard) {

        //                 const functionsNode = <FunctionsNode>this.children.find(c => c.dashboardType === DashboardType.FunctionsDashboard);
        //                 if (event.operation === 'delete') {
        //                     functionsNode.removeChild(event.resourceId);
        //                 } else if(event.operation === 'update'){
        //                     functionsNode.updateChild(event.resourceId, event.data);
        //                 }
        //             }
        //         });
        // }

        return Observable.of({});
    }

    public loadChildren() {

        this.supportsRefresh = false;
        this.isLoading = true;
        return this._functionsService.getAppContext(this.resourceId)
            .do(context => {
                this.isLoading = false;
                this.supportsRefresh = true;

                const children = [
                    new FunctionsNode(this.sideNav, context, this),
                    new ProxiesNode(this.sideNav, context, this),
                    new SlotsNode(this.sideNav, this._subscriptions, this._siteArmCacheObj, this)
                ];

                const filteredChildren = this._scenarioService.checkScenario(ScenarioIds.filterAppNodeChildren, {
                    site: context.site,
                    appNodeChildren: children
                });

                this.children = filteredChildren && filteredChildren.data ? filteredChildren.data : children;
                this.children.forEach(c => {
                    if (c.dashboardType === DashboardType.FunctionsDashboard) {
                        c.toggle(null);
                    }
                });

            }, err => {
                this.supportsRefresh = true;
                this.isLoading = false;
                this._logService.error(LogCategories.SideNav, '/app-node/loadChildren', err);
            })
            .map(context => context);
    }

    public shouldBlockNavChange() {
        let canSwitchNodes = true;
        const isDirty = this.sideNav.broadcastService.getDirtyState();

        if (isDirty) {
            canSwitchNodes = confirm(
                this.sideNav.translateService.instant(
                    PortalResources.siteDashboard_confirmLoseChanges).format(this._siteArmCacheObj.name));

            if (canSwitchNodes) {
                this.sideNav.broadcastService.clearAllDirtyStates();
            }
        }

        return !canSwitchNodes;
    }

    public handleRefresh(): Observable<any> {
        if (this.sideNav.selectedNode.shouldBlockNavChange()) {
            return Observable.of(null);
        }

        // Don't need to check for existing loadChildren operations because the refresh button shouldn't
        // be visible during load.
        this.sideNav.aiService.trackEvent('/actions/refresh');
        this.sideNav.cacheService.clearCache();
        // this.dispose();
        this.functionAppStream.next(null);

        return this.loadChildren()
            .do(context => {
                this._functionsService.fireSyncTrigger(context);
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
        // Ensures that we're only disposing if you're selecting a node that's not a child of the
        // the current app node.
        // if (newSelectedNode) {

        //     // Tests whether you've selected a child node or newselectedNode is not a slot node
        //     if (newSelectedNode.resourceId !== this.resourceId
        //         && newSelectedNode.resourceId.startsWith(this.resourceId + '/')
        //         && !SiteService.isSlot(newSelectedNode.resourceId)) {
        //         return;
        //     } else if (newSelectedNode.resourceId === this.resourceId && newSelectedNode === this) {
        //         // Tests whether you're navigating to this node from a child node
        //         return;
        //     }
        // }

        this.inSelectedTree = false;
        this.children.forEach(c => c.inSelectedTree = false);

        this.sideNav.globalStateService.setTopBarNotifications([]);
        this.sideNav.broadcastService.clearAllDirtyStates();

        this._ngUnsubscribe.next();
    }

    public clearNotification(id: string) {
        this.sideNav.globalStateService.topBarNotificationsStream
            .take(1)
            .subscribe(notifications => {
                notifications = notifications.filter(n => n.id !== id);
                this.sideNav.globalStateService.setTopBarNotifications(notifications);
            });
    }

    public openSettings() {
        this.openTabId = SiteTabIds.functionRuntime;
        this.select(true /* force */);
    }

    // private _setupBackgroundTasks() {

    //     return this._functionApp.initKeysAndWarmupMainSite()
    //         .catch(() => Observable.of(null))
    //         .map(() => {

    //             if (!this._pollingTask) {

    //                 this._pollingTask = Observable.timer(1, 60000)
    //                     .concatMap(() => {
    //                         const val = Observable.zip(
    //                             this._functionApp.getHostErrors().catch(() => Observable.of([])),
    //                             this.sideNav.cacheService.getArm(`${this.resourceId}/config/web`, true),
    //                             this.sideNav.cacheService.postArm(`${this.resourceId}/config/appsettings/list`, true),
    //                             this.sideNav.slotsService.getSlotsList(`${this.resourceId}`),
    //                             this._functionApp.pingScmSite(),
    //                             (e: string[], c: Response, a: Response, s: ArmObj<Site>[]) => ({ errors: e, configResponse: c, appSettingResponse: a, slotsResponse: s }));
    //                         return val;
    //                     })
    //                     .catch(() => Observable.of({}))
    //                     .subscribe((result: { errors: string[], configResponse: Response, appSettingResponse: Response, slotsResponse: ArmObj<Site>[] }) => {
    //                         this._handlePollingTaskResult(result);
    //                     });
    //             }
    //         });
    // }

    // private _handlePollingTaskResult(result: { errors: string[], configResponse: Response, appSettingResponse: Response, slotsResponse: ArmObj<Site>[] }) {
    //     if (result) {

    //         const notifications: TopBarNotification[] = [];

    //         if (result.errors) {

    //             this.sideNav.broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.generalHostErrorFromHost);
    //             // Give clearing a chance to run
    //             setTimeout(() => {
    //                 result.errors.forEach(e => {
    //                     this.sideNav.broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
    //                         message: this.sideNav.translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e }),
    //                         details: this.sideNav.translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e }),
    //                         errorId: ErrorIds.generalHostErrorFromHost,
    //                         errorType: ErrorType.RuntimeError,
    //                         resourceId: this._functionApp.site.id
    //                     });
    //                     this.sideNav.aiService.trackEvent('/errors/host', { error: e, app: this.resourceId });
    //                 });
    //             });
    //         }

    //         if (result.configResponse) {
    //             const config = result.configResponse.json();
    //             this._functionApp.isAlwaysOn = config.properties.alwaysOn === true || this._functionApp.site.properties.sku === 'Dynamic';

    //             if (!this._functionApp.isAlwaysOn) {
    //                 notifications.push({
    //                     id: NotificationIds.alwaysOn,
    //                     message: this.sideNav.translateService.instant(PortalResources.topBar_alwaysOn),
    //                     iconClass: 'fa fa-exclamation-triangle warning',
    //                     learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=830855',
    //                     clickCallback: null
    //                 });
    //             }
    //         }

    //         if (result.appSettingResponse) {
    //             const appSettings: ArmObj<any> = result.appSettingResponse.json();
    //             const extensionVersion = appSettings.properties[Constants.runtimeVersionAppSettingName];
    //             let isLatestFunctionRuntime = null;
    //             if (extensionVersion) {
    //                 if (extensionVersion === 'beta') {
    //                     isLatestFunctionRuntime = true;
    //                     notifications.push({
    //                         id: NotificationIds.runtimeV2,
    //                         message: this.sideNav.translateService.instant(PortalResources.topBar_runtimeV2),
    //                         iconClass: 'fa fa-exclamation-triangle warning',
    //                         learnMoreLink: '',
    //                         clickCallback: () => {
    //                             this.openSettings();
    //                         }
    //                     });
    //                 } else {
    //                     isLatestFunctionRuntime = !FunctionsVersionInfoHelper.needToUpdateRuntime(this.sideNav.configService.FunctionsVersionInfo, extensionVersion);
    //                     this.sideNav.aiService.trackEvent('/values/runtime_version', { runtime: extensionVersion, appName: this.resourceId });
    //                 }
    //             }

    //             if (!isLatestFunctionRuntime) {
    //                 notifications.push({
    //                     id: NotificationIds.newRuntimeVersion,
    //                     message: this.sideNav.translateService.instant(PortalResources.topBar_newVersion),
    //                     iconClass: 'fa fa-info link',
    //                     learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=829530',
    //                     clickCallback: () => {
    //                         this.openSettings();
    //                     }
    //                 });
    //             }
    //             if (result.slotsResponse) {
    //                 let slotsStorageSetting = appSettings.properties[Constants.slotsSecretStorageSettingsName];
    //                 if (!!slotsStorageSetting) {
    //                     slotsStorageSetting = slotsStorageSetting.toLowerCase();
    //                 }
    //                 const numSlots = result.slotsResponse.length;
    //                 if (numSlots > 0 && slotsStorageSetting !== Constants.slotsSecretStorageSettingsValue.toLowerCase()) {
    //                     notifications.push({
    //                         id: NotificationIds.slotsHostId,
    //                         message: this.sideNav.translateService.instant(PortalResources.topBar_slotsHostId),
    //                         iconClass: 'fa fa-exclamation-triangle warning',
    //                         learnMoreLink: '',
    //                         clickCallback: null
    //                     });
    //                 }
    //             }

    //         }

    //         this.sideNav.globalStateService.setTopBarNotifications(notifications);
    //     }
    // }
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
        super(sideBar,
            siteArmCacheObj,
            parentNode,
            subscriptions,
            disabled);
        const slotName = siteArmCacheObj.name;
        this.title = slotName.substring(slotName.indexOf('/') + 1); // change to display name
        this.slotProperties = siteArmCacheObj.properties;
        this.isSlot = true;
    }
}
