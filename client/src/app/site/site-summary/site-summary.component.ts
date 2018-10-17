import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { SiteService } from './../../shared/services/site.service';
import { Injector } from '@angular/core';
import {
  ScenarioIds,
  AvailabilityStates,
  KeyCodes,
  LogCategories,
  SiteTabIds,
  Links,
  NotificationIds,
} from './../../shared/models/constants';
import { ScenarioService } from './../../shared/services/scenario/scenario.service';
import { UserService } from './../../shared/services/user.service';
import { Component, OnDestroy, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from './../../shared/services/config.service';
import { PortalResources } from './../../shared/models/portal-resources';
import { PortalService } from './../../shared/services/portal.service';
import { Subscription } from './../../shared/models/subscription';
import { AiService } from './../../shared/services/ai.service';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { AppNode } from './../../tree-view/app-node';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { ArmService } from './../../shared/services/arm.service';
import { GlobalStateService } from './../../shared/services/global-state.service';
import { LogService } from './../../shared/services/log.service';
import { Router } from '@angular/router';
import { Url } from './../../shared/Utilities/url';
import { CacheService } from '../../shared/services/cache.service';
import { AuthzService } from '../../shared/services/authz.service';
import { ArmSiteDescriptor } from '../../shared/resourceDescriptors';
import { Site } from '../../shared/models/arm/site';
import { FunctionAppContext } from 'app/shared/function-app-context';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { errorIds } from '../../shared/models/error-ids';
import { TopBarNotification } from 'app/top-bar/top-bar-models';
import { OpenBladeInfo } from '../../shared/models/portal';

@Component({
  selector: 'site-summary',
  templateUrl: './site-summary.component.html',
  styleUrls: ['./site-summary.component.scss'],
})
export class SiteSummaryComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {
  public context: FunctionAppContext;
  public subscriptionId: string;
  public subscriptionName: string;
  public resourceGroup: string;
  public location: string;
  public state: string;
  public stateIcon: string;
  public availabilityState: string;
  public availabilityMesg: string;
  public availabilityIcon: string;
  public plan: string;
  public publishingUserName: string;
  public hasWriteAccess: boolean;
  public publishProfileLink: SafeUrl;
  public isStandalone: boolean;
  public hasSwapAccess: boolean;
  public hideAvailability: boolean;
  public Resources = PortalResources;
  public showDownloadFunctionAppModal = false;
  public showQuickstart = false;
  public notifications: TopBarNotification[];

  private _viewInfo: TreeViewInfo<SiteData>;
  private _subs: Subscription[];
  private _blobUrl: string;
  private _isSlot: boolean;
  private readonly _oldExtensionList = [
    'EventHubConfiguration',
    'CosmosDBConfiguration',
    'EventGridExtensionConfig',
    'MicrosoftGraphExtensionConfig',
    'SendGridConfiguration',
    'AuthTokenExtensionConfig',
    'ServiceBusExtensionConfig',
  ];

  constructor(
    private _cacheService: CacheService,
    private _authZService: AuthzService,
    private _armService: ArmService,
    private _globalStateService: GlobalStateService,
    private _aiService: AiService,
    private _portalService: PortalService,
    private _domSanitizer: DomSanitizer,
    public ts: TranslateService,
    _configService: ConfigService,
    private _functionAppService: FunctionAppService,
    private _logService: LogService,
    private _router: Router,
    userService: UserService,
    private _scenarioService: ScenarioService,
    private _siteService: SiteService,
    injector: Injector
  ) {
    super('site-summary', injector, SiteTabIds.overview);

    this.featureName = this.componentName;
    this.isParentComponent = true;

    this.isStandalone = _configService.isStandalone();

    userService
      .getStartupInfo()
      .first()
      .subscribe(info => {
        this._subs = info.subscriptions;
      });
  }

  protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
    return inputEvents
      .switchMap(viewInfo => {
        this._viewInfo = viewInfo;
        const siteDescriptor = new ArmSiteDescriptor(viewInfo.resourceId);
        return this._functionAppService.getAppContext(siteDescriptor.getTrimmedResourceId());
      })
      .switchMap(context => {
        this.context = context;
        const descriptor = new ArmSiteDescriptor(context.site.id);
        this.subscriptionId = descriptor.subscription;

        if (this.showTryView) {
          this.subscriptionName = 'Trial Subscription';
        } else {
          this.subscriptionName = this._subs ? this._subs.find(s => s.subscriptionId === this.subscriptionId).displayName : '';
        }

        this.resourceGroup = descriptor.resourceGroup;

        this.location = context.site.location;
        this.state = context.site.properties.state;
        this.stateIcon = this.state === 'Running' ? 'image/success.svg' : 'image/stopped.svg';

        this.availabilityState = null;
        this.availabilityMesg = this.ts.instant(PortalResources.functionMonitor_loading);
        this.availabilityIcon = null;

        this.publishProfileLink = null;

        const serverFarm = context.site.properties.serverFarmId.split('/')[8];
        this.plan = `${serverFarm} (${context.site.properties.sku.replace('Dynamic', 'Consumption')})`;
        this._isSlot = this._functionAppService.isSlot(context);

        this.clearBusyEarly();

        this.hideAvailability =
          this._scenarioService.checkScenario(ScenarioIds.showSiteAvailability, { site: context.site }).status === 'disabled';

        // Go ahead and assume write access at this point to unveal everything. This allows things to work when the RBAC API fails and speeds up reveal. In
        // cases where this causes a false positive, the backend will take care of giving a graceful failure.
        this.hasWriteAccess = true;

        return Observable.zip(
          this._authZService.hasPermission(context.site.id, [AuthzService.writeScope]),
          this._authZService.hasPermission(context.site.id, [AuthzService.actionScope]),
          this._authZService.hasReadOnlyLock(context.site.id),
          this._functionAppService.getSlotsList(context),
          this._functionAppService.pingScmSite(context),
          this._functionAppService.getFunctionHostStatus(context),
          this._functionAppService.getFunctions(context),
          this._functionAppService.getExtensionJson(context),
          (p, s, l, slots, ping, host, functions, extensions) => ({
            hasWritePermission: p,
            hasSwapPermission: s,
            hasReadOnlyLock: l,
            slotsList: slots.isSuccessful ? slots.result : [],
            pingedScmSite: ping.isSuccessful ? ping.result : false,
            runtime: host.isSuccessful ? host.result.version : '',
            functionInfo: functions.isSuccessful ? functions.result : [],
            extensionList: extensions.isSuccessful ? extensions.result.map(r => r.name) : [],
          })
        );
      })
      .mergeMap(r => {
        this.hasWriteAccess = r.hasWritePermission && !r.hasReadOnlyLock;
        if (!this._isSlot) {
          this.hasSwapAccess = this.hasWriteAccess && r.hasSwapPermission && r.slotsList.length > 0;
        } else {
          this.hasSwapAccess = this.hasWriteAccess && r.hasSwapPermission;
        }

        if (r.functionInfo.length === 0 && !this.isStandalone && this.hasWriteAccess && r.runtime.startsWith('2.')) {
          this.showQuickstart = true;
        }

        if (!r.pingedScmSite) {
          this.showComponentError({
            message: this.ts.instant(PortalResources.scmPingFailedErrorMessage),
            errorId: errorIds.preconditionsErrors.failedToPingScmSite,
            resourceId: this.context.site.id,
            href: Links.funcStorageLearnMore,
            hrefText: this.ts.instant(PortalResources.scmPingFailedLearnMore),
          });
        }

        this.notifications = [];
        if (ArmUtil.isLinuxDynamic(this.context.site)) {
          this.notifications.push({
            id: NotificationIds.dynamicLinux,
            message: this.ts.instant(PortalResources.dynamicLinuxPreview),
            iconClass: 'fa fa-exclamation-triangle warning',
            learnMoreLink: Links.dynamicLinuxPreviewLearnMore,
            clickCallback: null,
          });
          this._globalStateService.setTopBarNotifications(this.notifications);
        }

        if (!!r.runtime && r.runtime.includes('2.0.12050')) {
          const hasOldExtensions = this._oldExtensionList.some(oldExtension => r.extensionList.includes(oldExtension));
          if (hasOldExtensions) {
            this.notifications.push({
              id: NotificationIds.updateExtensions,
              message: this.ts.instant(PortalResources.topBar_updateExtensions),
              iconClass: 'fa fa-exclamation-triangle warning',
              learnMoreLink: Links.extensionInstallHelpLink,
              clickCallback: null,
            });
            this._globalStateService.setTopBarNotifications(this.notifications);
          }
        }

        return !this.hideAvailability ? this._siteService.getAvailability(this.context.site.id) : Observable.of(null);
      })
      .do(res => {
        if (res && res.isSuccessful) {
          this._setAvailabilityState(res.result.properties.availabilityState);
        } else if (!this._globalStateService.showTryView) {
          this._setAvailabilityState(AvailabilityStates.unknown);
        } else {
          this._setAvailabilityState(AvailabilityStates.available);
          this.plan = 'Trial';
        }
      });
  }

  private get showTryView() {
    return this._globalStateService.showTryView;
  }

  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    if (!viewInfo) {
      return;
    }

    this.setInput(viewInfo);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this._cleanupBlob();
  }

  toggleState() {
    if (!this.hasWriteAccess) {
      return;
    }

    if (this.context.site.properties.state === 'Running') {
      const confirmResult = confirm(this.ts.instant(PortalResources.siteSummary_stopConfirmation).format(this.context.site.name));
      if (confirmResult) {
        this._stopOrStartSite(true);
      }
    } else {
      this._stopOrStartSite(false);
    }
  }

  downloadPublishProfile() {
    if (!this.hasWriteAccess) {
      return;
    }

    this._armService.post(`${this.context.site.id}/publishxml`, null).subscribe(response => {
      const publishXml = response.text();

      // http://stackoverflow.com/questions/24501358/how-to-set-a-header-for-a-http-get-request-and-trigger-file-download/24523253#24523253
      const windowUrl = window.URL || (<any>window).webkitURL;
      const blob = new Blob([publishXml], { type: 'application/octet-stream' });
      this._cleanupBlob();

      if (window.navigator.msSaveOrOpenBlob) {
        // Currently, Edge doesn' respect the "download" attribute to name the file from blob
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7260192/
        window.navigator.msSaveOrOpenBlob(blob, `${this.context.site.name}.PublishSettings`);
      } else {
        // http://stackoverflow.com/questions/37432609/how-to-avoid-adding-prefix-unsafe-to-link-by-angular2
        this._blobUrl = windowUrl.createObjectURL(blob);
        this.publishProfileLink = this._domSanitizer.bypassSecurityTrustUrl(this._blobUrl);

        setTimeout(() => {
          const hiddenLink = document.getElementById('hidden-publish-profile-link');
          hiddenLink.click();
          this.publishProfileLink = null;
        });
      }
    });
  }

  openDownloadFunctionAppModal() {
    this.showDownloadFunctionAppModal = true;
  }

  hideDownloadFunctionAppModal() {
    this.showDownloadFunctionAppModal = false;
  }

  private _cleanupBlob() {
    const windowUrl = window.URL || (<any>window).webkitURL;
    if (this._blobUrl) {
      windowUrl.revokeObjectURL(this._blobUrl);
      this._blobUrl = null;
    }
  }

  resetPublishCredentials() {
    if (!this.hasWriteAccess) {
      return;
    }

    const confirmResult = confirm(this.ts.instant(PortalResources.siteSummary_resetProfileConfirmation));
    if (confirmResult) {
      let notificationId = null;
      this.setBusy();
      this._portalService
        .startNotification(
          this.ts.instant(PortalResources.siteSummary_resetProfileNotifyTitle),
          this.ts.instant(PortalResources.siteSummary_resetProfileNotifyTitle)
        )
        .first()
        .switchMap(r => {
          notificationId = r.id;
          return this._armService.post(`${this.context.site.id}/newpassword`, null);
        })
        .subscribe(
          () => {
            this.clearBusy();
            this._portalService.stopNotification(
              notificationId,
              true,
              this.ts.instant(PortalResources.siteSummary_resetProfileNotifySuccess)
            );
          },
          e => {
            this.clearBusy();
            this._portalService.stopNotification(
              notificationId,
              false,
              this.ts.instant(PortalResources.siteSummary_resetProfileNotifyFail)
            );

            this._aiService.trackException(e, '/errors/site-summary/reset-profile');
          }
        );
    }
  }

  restart() {
    if (!this.hasWriteAccess) {
      return;
    }

    const site = this.context.site;
    let notificationId = null;

    const confirmResult = confirm(this.ts.instant(PortalResources.siteSummary_restartConfirmation).format(this.context.site.name));
    if (confirmResult) {
      this.setBusy();

      this._portalService
        .startNotification(
          this.ts.instant(PortalResources.siteSummary_restartNotifyTitle).format(site.name),
          this.ts.instant(PortalResources.siteSummary_restartNotifyTitle).format(site.name)
        )
        .first()
        .switchMap(r => {
          notificationId = r.id;
          return this._armService.post(`${site.id}/restart`, null);
        })
        .subscribe(
          () => {
            this.clearBusy();
            this._portalService.stopNotification(
              notificationId,
              true,
              this.ts.instant(PortalResources.siteSummary_restartNotifySuccess).format(site.name)
            );
          },
          e => {
            this.clearBusy();
            this._portalService.stopNotification(
              notificationId,
              false,
              this.ts.instant(PortalResources.siteSummary_restartNotifyFail).format(site.name)
            );

            this._aiService.trackException(e, '/errors/site-summary/restart-app');
          },
          () => this.clearBusy()
        );
    }
  }

  openSubscriptionBlade() {
    // You shouldn't need to reference the menu blade directly, but I think the subscription
    // blade hasn't registered its asset type properly
    this._portalService.openBladeDeprecated(
      {
        detailBlade: 'ResourceMenuBlade',
        detailBladeInputs: {
          id: `/subscriptions/${this.subscriptionId}`,
        },
        extension: 'HubsExtension',
      },
      'site-summary'
    );
  }

  openResourceGroupBlade() {
    this._portalService.openBladeDeprecated(
      {
        detailBlade: 'ResourceGroupMapBlade',
        detailBladeInputs: {
          id: `/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}`,
        },
        extension: 'HubsExtension',
      },
      'site-summary'
    );
  }

  openMainAppUrl() {
    window.open(this.context.mainSiteUrl);
  }

  openPlanBlade() {
    this._portalService.openBladeDeprecated(
      {
        detailBlade:
          this._scenarioService.checkScenario(ScenarioIds.openOldWebhostingPlanBlade).status === 'enabled'
            ? 'WebHostingPlanBlade'
            : 'PlansOverviewBlade',
        detailBladeInputs: { id: this.context.site.properties.serverFarmId },
      },
      'site-summary'
    );
  }

  private _setAvailabilityState(availabilityState: string) {
    this.availabilityState = availabilityState.toLowerCase();
    switch (this.availabilityState) {
      case AvailabilityStates.unknown:
        this.availabilityIcon = '';
        this.availabilityMesg = this.ts.instant(PortalResources.notApplicable);
        break;
      case AvailabilityStates.unavailable:
        this.availabilityIcon = 'image/error.svg';
        this.availabilityMesg = this.ts.instant(PortalResources.notAvailable);
        break;
      case AvailabilityStates.available:
        this.availabilityIcon = 'image/success.svg';
        this.availabilityMesg = this.ts.instant(PortalResources.available);
        break;
      case AvailabilityStates.userinitiated:
        this.availabilityIcon = 'image/info.svg';
        this.availabilityMesg = this.ts.instant(PortalResources.notAvailable);
        break;
    }
  }

  private _stopOrStartSite(stop: boolean) {
    // Save reference to current values in case user clicks away
    const site = this.context.site;
    const appNode = <AppNode>this._viewInfo.node;
    let notificationId = null;

    const action = stop ? 'stop' : 'start';
    const notifyTitle = stop
      ? this.ts.instant(PortalResources.siteSummary_stopNotifyTitle).format(site.name)
      : this.ts.instant(PortalResources.siteSummary_startNotifyTitle).format(site.name);

    this.setBusy();

    this._portalService
      .startNotification(notifyTitle, notifyTitle)
      .first()
      .switchMap(r => {
        notificationId = r.id;
        return this._armService.post(`${site.id}/${action}`, null).concatMap(() => this._cacheService.getArm(`${site.id}`, true));
      })
      .subscribe(
        r => {
          this.clearBusy();
          const refreshedSite: ArmObj<Site> = r.json();

          // Current site could have changed if user clicked away
          if (refreshedSite.id === this.context.site.id) {
            this.context.site = refreshedSite;
          }

          const notifySuccess = stop
            ? this.ts.instant(PortalResources.siteSummary_stopNotifySuccess).format(site.name)
            : this.ts.instant(PortalResources.siteSummary_startNotifySuccess).format(site.name);

          this._portalService.stopNotification(notificationId, true, notifySuccess);

          appNode.refresh();
        },
        e => {
          this.clearBusy();
          const notifyFail = stop
            ? this.ts.instant(PortalResources.siteSummary_stopNotifyFail).format(site.name)
            : this.ts.instant(PortalResources.siteSummary_startNotifyFail).format(site.name);

          this._portalService.stopNotification(notificationId, false, notifyFail);

          this._aiService.trackException(e, '/errors/site-summary/stop-start');
        },
        () => this.clearBusy()
      );
  }

  openSwapBlade() {
    const bladeInfo: OpenBladeInfo = {
      detailBlade: 'SwapSlotsFrameBlade',
      detailBladeInputs: { id: this.context.site.id },
      openAsContextBlade: true,
    };

    this.setBusy();
    this._portalService
      .openBlade(bladeInfo, 'site-summary')
      .do(null, _ => {
        this.clearBusy();
      })
      .subscribe(_ => {
        this.clearBusy();
      });
  }

  openDeleteBlade() {
    if (this._scenarioService.checkScenario(ScenarioIds.deleteAppDirectly).status === 'enabled') {
      this.deleteAppDirectly();
      return;
    }
    this._portalService.openBladeDeprecated(
      {
        detailBlade: 'AppDeleteBlade',
        detailBladeInputs: { resourceUri: this.context.site.id },
      },
      'site-summary'
    );
  }

  openQuickstartTab() {
    this._broadcastService.broadcastEvent(BroadcastEvent.OpenTab, SiteTabIds.quickstart);
  }

  private deleteAppDirectly() {
    const appNode = <AppNode>this._viewInfo.node;
    const appsNode = appNode.parent;
    appsNode.select(true);

    this.setBusy();
    this._cacheService.deleteArm(this.context.site.id).subscribe(
      r => {
        this.clearBusy();
        appsNode.refresh();
        this._router.navigate(['/resources/apps'], { queryParams: Url.getQueryStringObj() });
      },
      err => {
        this._logService.error(LogCategories.subsCriptions, '/delete-app', err);
        this.clearBusy();
        this._router.navigate(['/resources/apps'], { queryParams: Url.getQueryStringObj() });
      }
    );
  }
  onKeyPress(event: KeyboardEvent, header: string) {
    if (event.keyCode === KeyCodes.enter) {
      switch (header) {
        case 'subscription':
          this.openSubscriptionBlade();
          break;
        case 'resourceGroup':
          this.openResourceGroupBlade();
          break;
        case 'url':
          this.openMainAppUrl();
          break;
        case 'appServicePlan':
          this.openPlanBlade();
          break;
        case 'functionNew':
          this.openQuickstartTab();
          break;
        default:
          break;
      }
    }
  }
}
