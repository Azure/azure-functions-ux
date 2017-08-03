import { SiteTabIds } from './../shared/models/constants';
import { SlotsService } from './../shared/services/slots.service';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
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
import { ErrorIds } from './../shared/models/error-ids';
import { AuthzService } from './../shared/services/authz.service';
import { TopBarNotification } from './../top-bar/top-bar-models';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { Subscription } from './../shared/models/subscription';
import { SiteDescriptor } from './../shared/resourceDescriptors';
import { AppsNode } from './apps-node';
import { TreeNode, Disposable, Removable, CustomSelection, Collection, Refreshable, CanBlockNavChange } from './tree-node';
import { DashboardType } from './models/dashboard-type';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Site } from '../shared/models/arm/site';
import { SlotsNode } from './slots-node';
import { FunctionsNode } from './functions-node';
import { ProxiesNode } from './proxies-node';
import { FunctionApp } from '../shared/function-app';
import { Constants, NotificationIds } from '../shared/models/constants';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';

export class AppNode extends TreeNode
    implements Disposable, Removable, CustomSelection, Collection, Refreshable, CanBlockNavChange {

    public supportsAdvanced = true;
    public inAdvancedMode = false;
    public dashboardType = DashboardType.app;
    public disabled = false;
    public supportsScope = false;
    public supportsRefresh = false;
    public isSlot = false; // both slot & function are of type app, this is used to distinguish

    public title: string;
    public subscription: string;
    public resourceGroup: string;
    public location: string;

    public functionAppStream = new ReplaySubject<FunctionApp>(1);
    public slotProperties: any;
    private _functionApp: FunctionApp;
    public openTabId: string | null;

    public nodeClass = 'tree-node app-node';
    public iconClass = 'tree-node-svg-icon';
    public iconUrl = 'images/functions.svg';

    private _pollingTask: RxSubscription;
    private _loadingObservable: Observable<any>;

    constructor(sideBar: SideNavComponent,
        private _siteArmCacheObj: ArmObj<Site>,
        parentNode: TreeNode,
        private _subscriptions: Subscription[],
        disabled?: boolean) {
        super(sideBar, _siteArmCacheObj.id, parentNode);

        this.disabled = !!disabled;
        if (disabled) {
            this.supportsAdvanced = false;
        }

        this.title = _siteArmCacheObj.name;
        this.location = _siteArmCacheObj.location;

        const descriptor = new SiteDescriptor(_siteArmCacheObj.id);
        this.resourceGroup = descriptor.resourceGroup;


        const sub = _subscriptions.find(sub => {
            return sub.subscriptionId === descriptor.subscription;
        });

        this.subscription = sub && sub.displayName;
    }

    public handleSelection(): Observable<any> {
        if (!this.disabled) {
            return this.initialize(false);
        }

        return Observable.of({});
    }

    public loadChildren() {
        if (!this.disabled) {
            return this.initialize(true);
        }

        return Observable.of({});
    }

    public initialize(expandOnly?: boolean): Observable<any> {

        if (!expandOnly) {
            this.inSelectedTree = true;
        }

        this.supportsRefresh = false;
        this.isLoading = true;

        if (this._loadingObservable) {
            return this._loadingObservable;
        }

        this._loadingObservable = Observable.zip(
            this.sideNav.authZService.hasPermission(this._siteArmCacheObj.id, [AuthzService.writeScope]),
            this.sideNav.authZService.hasReadOnlyLock(this._siteArmCacheObj.id),
            this.sideNav.cacheService.getArm(this._siteArmCacheObj.id),
            (h, r, s) => ({ hasWritePermission: h, hasReadOnlyLock: r, siteResponse: s })
        )
            .mergeMap(r => {
                this.isLoading = false;

                const site: ArmObj<Site> = r.siteResponse.json();

                if (!this._functionApp) {
                    this._setupFunctionApp(site);

                    if (site.properties.state === 'Running' && r.hasWritePermission && !r.hasReadOnlyLock) {
                        return this._setupBackgroundTasks()
                            .map(() => {
                                this.supportsRefresh = true;
                            });
                    } else {
                        this.dispose();
                        this.supportsRefresh = true;
                        return Observable.of(null);
                    }
                }

                this.supportsRefresh = true;
                return Observable.of(null);
            })
            .do(() => {
                this.isLoading = false;

                if (this.inSelectedTree) {
                    this.children.forEach(c => c.inSelectedTree = true);
                }

                this._loadingObservable = null;
            }, () => {
                this.isLoading = false;
            })
            .share();

        return this._loadingObservable;
    }

    public shouldBlockNavChange() {
        let canSwitchNodes = true;
        const isDirty = this.sideNav.broadcastService.getDirtyState();

        if (isDirty) {
            canSwitchNodes = confirm(
                this.sideNav.translateService.instant(
                    PortalResources.siteDashboard_confirmLoseChanges).format(this._functionApp.site.name));

            if (canSwitchNodes) {
                this.sideNav.broadcastService.clearAllDirtyStates();
            }
        }

        return !canSwitchNodes;
    }

    private _setupFunctionApp(site: ArmObj<Site>) {
        if (this.sideNav.tryFunctionApp) {
            this._functionApp = this.sideNav.tryFunctionApp;

            const functionsNode = new FunctionsNode(this.sideNav, this._functionApp, this);
            functionsNode.toggle(null);
            this.children = [functionsNode];
        } else {
            this._functionApp = new FunctionApp(
                site,
                this.sideNav.http,
                this.sideNav.userService,
                this.sideNav.globalStateService,
                this.sideNav.translateService,
                this.sideNav.broadcastService,
                this.sideNav.armService,
                this.sideNav.cacheService,
                this.sideNav.languageService,
                this.sideNav.authZService,
                this.sideNav.aiService,
                this.sideNav.configService,
                this.sideNav.slotsService
            );

            this.functionAppStream.next(this._functionApp);

            const functionsNode = new FunctionsNode(this.sideNav, this._functionApp, this);
            functionsNode.toggle(null);
            this.children = [functionsNode];

            if (!this.sideNav.configService.isStandalone()) {
                const proxiesNode = new ProxiesNode(this.sideNav, this._functionApp, this);
                const slotsNode = new SlotsNode(this.sideNav, this._subscriptions, this._siteArmCacheObj, this);
                proxiesNode.toggle(null);
                // Do not auto expand slotsNode
                // for slots Node hide the slots as child Node
                if (this.isSlot) {
                    this.supportsScope = false;
                    this.children.push(proxiesNode);
                } else {
                    this.supportsScope = true;
                    this.children.push(proxiesNode, slotsNode);
                }
            }
        }
    }

    public handleRefresh(): Observable<any> {
        if (this.sideNav.selectedNode.shouldBlockNavChange()) {
            return Observable.of(null);
        }

        // Make sure there isn't a load operation currently being performed
        const loadObs = this._loadingObservable ? this._loadingObservable : Observable.of({});
        return loadObs
            .mergeMap(() => {
                this.sideNav.aiService.trackEvent('/actions/refresh');
                this._functionApp.fireSyncTrigger();
                this.sideNav.cacheService.clearCache();
                this.dispose();
                this._functionApp = null;
                this.functionAppStream.next(null);

                return this.initialize();
            })
            .do(() => {
                this.isLoading = false;
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
        this.dispose();
    }

    public dispose(newSelectedNode?: TreeNode) {
        // Ensures that we're only disposing if you're selecting a node that's not a child of the
        // the current app node.
        if (newSelectedNode) {

            // Tests whether you've selected a child node or newselectedNode is not a slot node
            if (newSelectedNode.resourceId !== this.resourceId
                && newSelectedNode.resourceId.startsWith(this.resourceId + '/')
                && !SlotsService.isSlot(newSelectedNode.resourceId)) {
                return;
            } else if (newSelectedNode.resourceId === this.resourceId && newSelectedNode === this) {
                // Tests whether you're navigating to this node from a child node
                return;
            }
        }

        this.inSelectedTree = false;
        this.children.forEach(c => c.inSelectedTree = false);

        if (this._loadingObservable) {
            this._loadingObservable.subscribe(() => {
                this._dispose();
            });
        } else {
            this._dispose();
        }
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

    private _dispose() {
        if (this._pollingTask && !this._pollingTask.closed) {
            this._pollingTask.unsubscribe();
            this._pollingTask = null;
        }

        if (this._functionApp) {
            this._functionApp.isDeleted = true;
        }

        this.sideNav.globalStateService.setTopBarNotifications([]);
        this.sideNav.broadcastService.clearAllDirtyStates();
    }

    private _setupBackgroundTasks() {

        return this._functionApp.initKeysAndWarmupMainSite()
            .catch(() => Observable.of(null))
            .map(() => {

                if (!this._pollingTask) {

                    this._pollingTask = Observable.timer(1, 60000)
                        .concatMap(() => {
                            const val = Observable.zip(
                                this._functionApp.getHostErrors().catch(() => Observable.of([])),
                                this.sideNav.cacheService.getArm(`${this.resourceId}/config/web`, true),
                                this.sideNav.cacheService.postArm(`${this.resourceId}/config/appsettings/list`, true),
                                this.sideNav.slotsService.getSlotsList(`${this.resourceId}`),
                                this._functionApp.pingScmSite(),
                                (e: string[], c: Response, a: Response, s: ArmObj<Site>[]) => ({ errors: e, configResponse: c, appSettingResponse: a, slotsResponse: s }));
                            return val;
                        })
                        .catch(() => Observable.of({}))
                        .subscribe((result: { errors: string[], configResponse: Response, appSettingResponse: Response, slotsResponse: ArmObj<Site>[] }) => {
                            this._handlePollingTaskResult(result);
                        });
                }
            });
    }

    private _handlePollingTaskResult(result: { errors: string[], configResponse: Response, appSettingResponse: Response, slotsResponse: ArmObj<Site>[] }) {
        if (result) {

            const notifications: TopBarNotification[] = [];

            if (result.errors) {

                this.sideNav.broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.generalHostErrorFromHost);
                // Give clearing a chance to run
                setTimeout(() => {
                    result.errors.forEach(e => {
                        this.sideNav.broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: this.sideNav.translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e }),
                            details: this.sideNav.translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e }),
                            errorId: ErrorIds.generalHostErrorFromHost,
                            errorType: ErrorType.RuntimeError,
                            resourceId: this._functionApp.site.id
                        });
                        this.sideNav.aiService.trackEvent('/errors/host', { error: e, app: this.resourceId });
                    });
                });
            }

            if (result.configResponse) {
                const config = result.configResponse.json();
                this._functionApp.isAlwaysOn = config.properties.alwaysOn === true || this._functionApp.site.properties.sku === 'Dynamic';

                if (!this._functionApp.isAlwaysOn) {
                    notifications.push({
                        id: NotificationIds.alwaysOn,
                        message: this.sideNav.translateService.instant(PortalResources.topBar_alwaysOn),
                        iconClass: 'fa fa-exclamation-triangle warning',
                        learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=830855',
                        clickCallback: null
                    });
                }
            }

            if (result.appSettingResponse) {
                const appSettings: ArmObj<any> = result.appSettingResponse.json();
                const extensionVersion = appSettings.properties[Constants.runtimeVersionAppSettingName];
                let isLatestFunctionRuntime = null;
                if (extensionVersion) {
                    isLatestFunctionRuntime = Constants.runtimeVersion === extensionVersion || Constants.latest === extensionVersion.toLowerCase();
                    this.sideNav.aiService.trackEvent('/values/runtime_version', { runtime: extensionVersion, appName: this.resourceId });
                }

                if (!isLatestFunctionRuntime) {
                    notifications.push({
                        id: NotificationIds.newRuntimeVersion,
                        message: this.sideNav.translateService.instant(PortalResources.topBar_newVersion),
                        iconClass: 'fa fa-info link',
                        learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=829530',
                        clickCallback: () => {
                            this.openSettings();
                        }
                    });
                }
                if (result.slotsResponse) {
                    let slotsStorageSetting = appSettings.properties[Constants.slotsSecretStorageSettingsName];
                    if (!!slotsStorageSetting) {
                        slotsStorageSetting = slotsStorageSetting.toLowerCase();
                    }
                    const numSlots = result.slotsResponse.length;
                    if (numSlots > 0 && slotsStorageSetting !== Constants.slotsSecretStorageSettingsValue.toLowerCase()) {
                        notifications.push({
                            id: NotificationIds.slotsHostId,
                            message: this.sideNav.translateService.instant(PortalResources.topBar_slotsHostId),
                            iconClass: 'fa fa-exclamation-triangle warning',
                            learnMoreLink: '',
                            clickCallback: null
                        });
                    }
                }

            }

            this.sideNav.globalStateService.setTopBarNotifications(notifications);
        }
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
