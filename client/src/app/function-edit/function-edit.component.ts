import { FunctionInfo } from './../shared/models/function-info';
import { FunctionAppService } from './../shared/services/function-app.service';
import { FunctionAppContext } from './../shared/function-app-context';
import { TreeUpdateEvent } from './../shared/models/broadcast-event';
import { GlobalStateService } from './../shared/services/global-state.service';
import { ConfigService } from './../shared/services/config.service';
import { AiService } from './../shared/services/ai.service';
import { PortalResources } from './../shared/models/portal-resources';
import { TopBarNotification } from './../top-bar/top-bar-models';
import { Site } from './../shared/models/arm/site';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { CacheService } from 'app/shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { NotificationIds, Constants, SiteTabIds, SubscriptionQuotaIds, ARMApiVersions } from './../shared/models/constants';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { Component, ViewChild, OnDestroy, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalService } from '../shared/services/portal.service';
import { UserService } from '../shared/services/user.service';
import { FunctionDevComponent } from '../function-dev/function-dev.component';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { Response } from '@angular/http';
import { FunctionsVersionInfoHelper } from '../shared/models/functions-version-info';
import { NavigableComponent, ExtendedTreeViewInfo } from '../shared/components/navigable-component';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { BillingService } from 'app/shared/services/billing.service';
import { Tier } from 'app/shared/models/serverFarmSku';
import { FunctionService } from 'app/shared/services/function.service';

@Component({
  selector: 'function-edit',
  templateUrl: './function-edit.component.html',
  styleUrls: ['./function-edit.component.scss'],
})
export class FunctionEditComponent extends NavigableComponent implements OnDestroy {
  @ViewChild(FunctionDevComponent)
  functionDevComponent: FunctionDevComponent;
  public selectedFunction: FunctionInfo;
  public inIFrame: boolean;
  public editorType = 'standard';
  public disabled: boolean;
  public isDreamSpark: boolean;

  public DevelopTab: string;
  public IntegrateTab: string;
  public MonitorTab: string;
  public ManageTab: string;
  public tabId = '';

  private _pollingTask: RxSubscription;

  public context: FunctionAppContext;

  constructor(
    private _globalStateService: GlobalStateService,
    private _userService: UserService,
    private _portalService: PortalService,
    private _functionAppService: FunctionAppService,
    private _cacheService: CacheService,
    private _translateService: TranslateService,
    private _aiService: AiService,
    private _configService: ConfigService,
    private _billingService: BillingService,
    private _functionService: FunctionService,
    injector: Injector
  ) {
    super('function-edit', injector, info => {
      if (this.viewInfo) {
        // If clicking on the same dashboard type for a different function, the component
        // is already initialized, so we can respond to the update
        if (this.viewInfo.dashboardType === info.dashboardType && this.viewInfo.resourceId !== info.resourceId) {
          return true;
        } else {
          // If the dashboard type or resourceId doesn't match, then don't respond
          // to the event because a new component instance will be created to handle it
          return false;
        }
      } else {
        // If this is first click, then make sure to only respond to these dashboard types
        return (
          info.dashboardType === DashboardType.FunctionDashboard ||
          info.dashboardType === DashboardType.FunctionIntegrateDashboard ||
          info.dashboardType === DashboardType.FunctionManageDashboard ||
          info.dashboardType === DashboardType.FunctionMonitorDashboard
        );
      }
    });

    this.inIFrame = this._userService.inIFrame;
    this.DevelopTab = _translateService.instant('tabNames_develop');
    this.IntegrateTab = _translateService.instant('tabNames_integrate');
    this.MonitorTab = _translateService.instant('tabNames_monitor');
    this.ManageTab = _translateService.instant('tabNames_manage');
  }

  setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
    return super
      .setup(navigationEvents)
      .distinctUntilChanged()
      .switchMap(viewInfo => {
        return Observable.zip(
          this._functionAppService.getAppContext(viewInfo.siteDescriptor.getTrimmedResourceId()),
          Observable.of(viewInfo.functionDescriptor)
        );
      })
      .switchMap(tuple => {
        this.context = tuple[0];
        const functionDescriptor = tuple[1];
        const subscriptionId = new ArmSiteDescriptor(this.context.site.id).subscription;
        return Observable.zip(
          this._functionService.getFunction(this.context.site.id, functionDescriptor.name),
          this._billingService.checkIfSubscriptionHasQuotaId(subscriptionId, SubscriptionQuotaIds.dreamSparkQuotaId)
        );
      })
      .takeUntil(this.ngUnsubscribe)
      .do(tuple => {
        const functionResult = tuple[0];
        this.isDreamSpark = tuple[1];
        if (functionResult.isSuccessful) {
          this.selectedFunction = functionResult.result.properties;
          this._setupPollingTasks();

          const segments = this.viewInfo.resourceId.split('/');
          // support for both site & slots
          if ((segments.length === 13 && segments[11] === 'functions') || (segments.length === 11 && segments[9] === 'functions')) {
            this.tabId = 'develop';
          } else {
            this.tabId = segments[segments.length - 1];
          }
        } else {
          this.showComponentError({
            message: functionResult.error.message,
            errorId: functionResult.error.errorId,
            resourceId: this.context.site.id,
          });
        }
      });
  }

  ngOnDestroy() {
    if (this._pollingTask) {
      this._pollingTask.unsubscribe();
    }
    super.ngOnDestroy();
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
      .takeUntil(this.ngUnsubscribe)
      .concatMap(() => {
        return Observable.zip(
          this._cacheService.getArm(`${this.context.site.id}/config/web`, null, ARMApiVersions.antaresApiVersion20181101),
          this._cacheService.postArm(`${this.context.site.id}/config/appsettings/list`),
          this._functionAppService.getSlotsList(this.context),
          this._functionAppService.pingScmSite(this.context),
          (c: Response, a: Response, s: ArmObj<Site>[]) => {
            return { configResponse: c, appSettingResponse: a, slotsResponse: s };
          }
        );
      })
      .catch(() => Observable.of({}))
      .subscribe((result: { configResponse: Response; appSettingResponse: Response; slotsResponse: ArmObj<Site>[] }) => {
        this._handlePollingTaskResult(result);
      });
  }

  private _handlePollingTaskResult(result: { configResponse: Response; appSettingResponse: Response; slotsResponse: ArmObj<Site>[] }) {
    if (result) {
      const notifications: TopBarNotification[] = [];

      if (result.configResponse) {
        const config = result.configResponse.json();
        const recommendAlwaysOn =
          config.properties.alwaysOn !== true &&
          this.context.site.properties.sku !== Tier.dynamic &&
          this.context.site.properties.sku !== Tier.elasticPremium;

        if (recommendAlwaysOn && !this.isDreamSpark) {
          notifications.push({
            id: NotificationIds.alwaysOn,
            message: this._translateService.instant(PortalResources.topBar_alwaysOn),
            iconClass: 'fa fa-exclamation-triangle warning',
            learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=830855',
            clickCallback: () => {
              this._portalService.openFrameBlade(
                {
                  detailBlade: 'SiteConfigSettingsFrameBladeReact',
                  detailBladeInputs: {
                    id: this.context.site.id,
                  },
                },
                'function-edit'
              );
            },
          });
        }
      }

      if (result.appSettingResponse) {
        const appSettings: ArmObj<any> = result.appSettingResponse.json();
        const extensionVersion = appSettings.properties[Constants.runtimeVersionAppSettingName];
        let isLatestFunctionRuntime = null;
        if (extensionVersion) {
          isLatestFunctionRuntime = !FunctionsVersionInfoHelper.needToUpdateRuntime(
            this._configService.FunctionsVersionInfo,
            extensionVersion
          );
          this._aiService.trackEvent('/values/runtime_version', { runtime: extensionVersion, appName: this.context.site.id });
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
                data: SiteTabIds.functionRuntime,
              });
            },
          });
        }
        if (result.slotsResponse) {
          const numSlots = result.slotsResponse.length;
          if (numSlots > 0 && !this._functionAppService.isSlotsSupported(appSettings)) {
            const message =
              FunctionsVersionInfoHelper.getFunctionGeneration(extensionVersion) === 'V1'
                ? this._translateService.instant(PortalResources.topBar_slotsHostId)
                : this._translateService.instant(PortalResources.topBar_slotsHostIdV2);

            notifications.push({
              id: NotificationIds.slotsHostId,
              message: message,
              iconClass: 'fa fa-exclamation-triangle warning',
              learnMoreLink: '',
              clickCallback: null,
            });
          }
        }
      }

      this._globalStateService.setTopBarNotifications(notifications);
    }
  }
}
