import { TreeUpdateEvent } from './../shared/models/broadcast-event';
import { GlobalStateService } from './../shared/services/global-state.service';
import { ConfigService } from './../shared/services/config.service';
import { AiService } from './../shared/services/ai.service';
import { PortalResources } from './../shared/models/portal-resources';
import { ErrorIds } from './../shared/models/error-ids';
import { TopBarNotification } from './../top-bar/top-bar-models';
import { Site } from './../shared/models/arm/site';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { SiteService } from './../shared/services/slots.service';
import { CacheService } from 'app/shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { LogCategories, NotificationIds, Constants, SiteTabIds } from './../shared/models/constants';
import { LogService } from './../shared/services/log.service';
import { FunctionsService, FunctionAppContext } from './../shared/services/functions-service';
import { FunctionDescriptor } from 'app/shared/resourceDescriptors';
import { SiteDescriptor } from './../shared/resourceDescriptors';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { Component, ViewChild, OnDestroy, Injector } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { FunctionApp } from '../shared/function-app';
import { PortalService } from '../shared/services/portal.service';
import { UserService } from '../shared/services/user.service';
import { FunctionInfo } from '../shared/models/function-info';
import { FunctionDevComponent } from '../function-dev/function-dev.component';
import { BroadcastService } from '../shared/services/broadcast.service';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import { Response } from '@angular/http';
import { FunctionsVersionInfoHelper } from '../../../../common/models/functions-version-info';

@Component({
    selector: 'function-edit',
    templateUrl: './function-edit.component.html',
    styleUrls: ['./function-edit.component.scss'],
})
export class FunctionEditComponent implements OnDestroy {

    @ViewChild(FunctionDevComponent) functionDevComponent: FunctionDevComponent;
    public selectedFunction: FunctionInfo;
    public viewInfo: TreeViewInfo<any>;
    public inIFrame: boolean;
    public editorType = "standard";
    public disabled: boolean;

    public DevelopTab: string;
    public IntegrateTab: string;
    public MonitorTab: string;
    public ManageTab: string;
    public tabId = '';

    private _pollingTask: RxSubscription;
    private _ngUnsubscribe = new Subject<void>();

    private functionApp: FunctionApp;
    public context: FunctionAppContext;

    constructor(
        private _userService: UserService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _functionsService: FunctionsService,
        private _injector: Injector,
        private _logService: LogService,
        private _cacheService: CacheService,
        private _siteService: SiteService,
        private _translateService: TranslateService,
        private _aiService: AiService,
        private _configService: ConfigService,
        private _globalStateService: GlobalStateService) {

        this.inIFrame = this._userService.inIFrame;

        this.DevelopTab = _translateService.instant('tabNames_develop');
        this.IntegrateTab = _translateService.instant('tabNames_integrate');
        this.MonitorTab = _translateService.instant('tabNames_monitor');
        this.ManageTab = _translateService.instant('tabNames_manage');

        this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.TreeNavigation)
            .takeUntil(this._ngUnsubscribe)
            .filter(info => {
                if (this.viewInfo) {

                    // If clicking on the same dashboard type for a different function, the component
                    // is already initialized, so we can respond to the update
                    if (this.viewInfo.dashboardType === info.dashboardType
                        && this.viewInfo.resourceId !== info.resourceId) {

                        return true;

                    } else {
                        // If the dashboard type or resourceId doesn't match, then don't respond
                        // to the event because a new component instance will be created to handle it
                        return false;
                    }
                } else {

                    // If this is first click, then make sure to only respond to these dashboard types
                    return info.dashboardType === DashboardType.FunctionDashboard
                        || info.dashboardType === DashboardType.FunctionIntegrateDashboard
                        || info.dashboardType === DashboardType.FunctionManageDashboard
                        || info.dashboardType === DashboardType.FunctionMonitorDashboard;
                }
            })
            .distinctUntilChanged()
            .switchMap(viewInfo => {
                this._globalStateService.setBusyState();
                this.viewInfo = viewInfo;
                const siteDescriptor = new SiteDescriptor(viewInfo.resourceId);
                return this._functionsService.getAppContext(siteDescriptor.getTrimmedResourceId());
            })
            .switchMap(context => {
                this.context = context;
                const functionDescriptor = new FunctionDescriptor(this.viewInfo.resourceId);
                return this._functionsService.getFunction(context, functionDescriptor.name);
            })
            .switchMap(functionInfo => {
                this.selectedFunction = functionInfo;

                if (this.functionApp) {
                    this.functionApp.dispose();
                }

                this.functionApp = new FunctionApp(this.selectedFunction.context.site, this._injector);
                functionInfo.functionApp = this.functionApp;
                return this.functionApp.initKeysAndWarmupMainSite();
            })
            .do(null, err => {
                this._globalStateService.clearBusyState();
                this._logService.error(LogCategories.FunctionEdit, '/loading', err);
            })
            .retry()
            .subscribe(() => {
                this._globalStateService.clearBusyState();
                this._setupPollingTasks();

                const segments = this.viewInfo.resourceId.split('/');
                // support for both site & slots
                if (segments.length === 13 && segments[11] === 'functions' || segments.length === 11 && segments[9] === 'functions') {
                    this.tabId = 'develop';
                } else {
                    this.tabId = segments[segments.length - 1];
                }
            });
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();

        if(this._pollingTask){
            this._pollingTask.unsubscribe();
        }

        if (this.functionApp) {
            this.functionApp.dispose();
        }
    }

    onEditorChange(editorType: string) {
        this._portalService.logAction('function-edit', 'switchEditor', { type: editorType });
        this.editorType = editorType;
    }

    private _setupPollingTasks() {
        if (this._pollingTask) {
            this._pollingTask.unsubscribe();
        }

        this._pollingTask = Observable.timer(1, 60000)
            .takeUntil(this._ngUnsubscribe)
            .concatMap(() => {
                const val = Observable.zip(
                    this.functionApp.getHostErrors().catch(() => Observable.of([])),
                    this._cacheService.getArm(`${this.context.site.id}/config/web`, true),
                    this._cacheService.postArm(`${this.context.site.id}/config/appsettings/list`, true),
                    this._siteService.getSlotsList(`${this.context.site.id}`),
                    this.functionApp.pingScmSite(),
                    (e: string[], c: Response, a: Response, s: ArmObj<Site>[]) => ({ errors: e, configResponse: c, appSettingResponse: a, slotsResponse: s }));
                return val;
            })
            .catch(() => Observable.of({}))
            .subscribe((result: { errors: string[], configResponse: Response, appSettingResponse: Response, slotsResponse: ArmObj<Site>[] }) => {
                this._handlePollingTaskResult(result);
            });
    }

    private _handlePollingTaskResult(result: { errors: string[], configResponse: Response, appSettingResponse: Response, slotsResponse: ArmObj<Site>[] }) {
        if (result) {

            const notifications: TopBarNotification[] = [];

            if (result.errors) {

                this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.generalHostErrorFromHost);
                // Give clearing a chance to run
                setTimeout(() => {
                    result.errors.forEach(e => {
                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: this._translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e }),
                            details: this._translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e }),
                            errorId: ErrorIds.generalHostErrorFromHost,
                            errorType: ErrorType.RuntimeError,
                            resourceId: this.functionApp.site.id
                        });

                        this._aiService.trackEvent('/errors/host', { error: e, app: this.context.site.id });
                    });
                });
            }

            if (result.configResponse) {
                const config = result.configResponse.json();
                this.functionApp.isAlwaysOn = config.properties.alwaysOn === true || this.functionApp.site.properties.sku === 'Dynamic';

                if (!this.functionApp.isAlwaysOn) {
                    notifications.push({
                        id: NotificationIds.alwaysOn,
                        message: this._translateService.instant(PortalResources.topBar_alwaysOn),
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
                    if (extensionVersion === 'beta') {
                        isLatestFunctionRuntime = true;
                        notifications.push({
                            id: NotificationIds.runtimeV2,
                            message: this._translateService.instant(PortalResources.topBar_runtimeV2),
                            iconClass: 'fa fa-exclamation-triangle warning',
                            learnMoreLink: '',
                            clickCallback: () => {
                                this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
                                    operation: 'navigate',
                                    resourceId: this.context.site.id,
                                    data: SiteTabIds.functionRuntime
                                });
                            }
                        });
                    } else {
                        isLatestFunctionRuntime = !FunctionsVersionInfoHelper.needToUpdateRuntime(this._configService.FunctionsVersionInfo, extensionVersion);
                        this._aiService.trackEvent('/values/runtime_version', { runtime: extensionVersion, appName: this.context.site.id });
                    }
                }

                if (!isLatestFunctionRuntime) {
                    notifications.push({
                        id: NotificationIds.newRuntimeVersion,
                        message: this._translateService.instant(PortalResources.topBar_newVersion),
                        iconClass: 'fa fa-info link',
                        learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=829530',
                        clickCallback: () => {
                            this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
                                operation: 'navigate',
                                resourceId: this.context.site.id,
                                data: SiteTabIds.functionRuntime
                            });
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
                            message: this._translateService.instant(PortalResources.topBar_slotsHostId),
                            iconClass: 'fa fa-exclamation-triangle warning',
                            learnMoreLink: '',
                            clickCallback: null
                        });
                    }
                }
            }

            this._globalStateService.setTopBarNotifications(notifications);
        }
    }
}
