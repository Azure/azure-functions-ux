import { TabsComponent } from './../../tabs/tabs.component';
import { BusyStateComponent } from './../../busy-state/busy-state.component';
import { EditModeHelper } from './../../shared/Utilities/edit-mode.helper';
import { Component, Input, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/zip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ErrorIds } from './../../shared/models/error-ids';
import { ErrorEvent, ErrorType } from './../../shared/models/error-event';
import { SiteConfig } from './../../shared/models/arm/site-config';
import { NotificationIds, Constants } from './../../shared/models/constants';
import { CacheService } from './../../shared/services/cache.service';
import { Site } from './../../shared/models/arm/site';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { AppNode } from './../../tree-view/app-node';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { ArmService } from '../../shared/services/arm.service';
import { PortalService } from '../../shared/services/portal.service';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../shared/models/broadcast-event'
import { FunctionsService } from '../../shared/services/functions.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { AiService } from '../../shared/services/ai.service';
import { SelectOption } from '../../shared/models/select-option';
import { PortalResources } from '../../shared/models/portal-resources';
import { FunctionApp } from './../../shared/function-app';
import { FunctionAppEditMode } from '../../shared/models/function-app-edit-mode';
import { SlotsService } from '../../shared/services/slots.service';
import { HostStatus } from './../../shared/models/host-status';

@Component({
  selector: 'function-runtime',
  templateUrl: './function-runtime.component.html',
  styleUrls: ['./function-runtime.component.scss']
})
export class FunctionRuntimeComponent implements OnDestroy {
  public site: ArmObj<Site>;
  public memorySize: number | string;
  public dirty: boolean;
  public needUpdateExtensionVersion;
  public extensionVersion: string;
  public latestExtensionVersion: string;
  public dailyMemoryTimeQuota: string;
  public dailyMemoryTimeQuotaOriginal: string;
  public showDailyMemoryWarning: boolean = false;
  public showDailyMemoryInfo: boolean = false;
  public functionApp: FunctionApp;
  public exactExtensionVersion: string;

  public functionStatusOptions: SelectOption<boolean>[];
  public needUpdateRoutingExtensionVersion: boolean;
  public routingExtensionVersion: string;
  public latestRoutingExtensionVersion: string;
  public apiProxiesEnabled: boolean;
  private proxySettingValueStream: Subject<boolean>;
  private functionEditModeValueStream: Subject<boolean>;
  public showTryView: boolean;

  private _viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
  private _viewInfo: TreeViewInfo<SiteData>;
  private _viewInfoSub: RxSubscription;
  private _appNode: AppNode;

  public functionAppEditMode: boolean = true;
  public functionAppEditModeOptions: SelectOption<boolean>[];

  private _isSlotApp: boolean = false;
  public slotsStatusOptions: SelectOption<boolean>[];
  public slotsAppSetting: string;
  public slotsEnabled: boolean;
  private slotsValueChange: Subject<boolean>;
  private _numSlots: number = 0;
  private _busyState: BusyStateComponent;

  constructor(
    private _armService: ArmService,
    private _cacheService: CacheService,
    private _portalService: PortalService,
    private _broadcastService: BroadcastService,
    private _functionsService: FunctionsService,
    private _globalStateService: GlobalStateService,
    private _aiService: AiService,
    private _translateService: TranslateService,
    private _slotsService: SlotsService,
    tabsComponent: TabsComponent
  ) {

    this._busyState = tabsComponent.busyState;

    this.showTryView = this._globalStateService.showTryView;
    this._viewInfoSub = this._viewInfoStream
      .switchMap(viewInfo => {
        this._viewInfo = viewInfo;
        this._busyState.setBusyState();

        this._appNode = (<AppNode>viewInfo.node);

        return Observable.zip(
          this._cacheService.getArm(viewInfo.resourceId),
          this._cacheService.postArm(`${viewInfo.resourceId}/config/appsettings/list`, true),
          this._appNode.functionAppStream,
          this._slotsService.getSlotsList(viewInfo.resourceId),
          (s: Response, a: Response, fa: FunctionApp, slots: ArmObj<Site>[]) => ({ siteResponse: s, appSettingsResponse: a, functionApp: fa, slotsList: slots }))
          .mergeMap(result => {
            return Observable.zip(result.functionApp.getFunctionAppEditMode(), result.functionApp.getFunctionHostStatus(),
              (editMode: FunctionAppEditMode, hostStatus: HostStatus) => ({ editMode: editMode, hostStatus: hostStatus }))
              .map(r => ({
                siteResponse: result.siteResponse,
                appSettingsResponse: result.appSettingsResponse,
                functionApp: result.functionApp,
                editMode: r.editMode,
                hostStatus: r.hostStatus,
                slotsList: result.slotsList
              })
              );
          });
      })
      .do(null, e => {
        this._aiService.trackException(e, 'function-runtime');
      })
      .retry()
      .subscribe(r => {
        let appSettings: ArmObj<any> = r.appSettingsResponse.json();

        this.functionApp = r.functionApp;
        this.site = r.siteResponse.json();
        this.exactExtensionVersion = r.hostStatus ? r.hostStatus.version : '';
        this._isSlotApp = SlotsService.isSlot(this.site.id);
        this.dailyMemoryTimeQuota = this.site.properties.dailyMemoryTimeQuota
          ? this.site.properties.dailyMemoryTimeQuota.toString()
          : '0';

        if (this.dailyMemoryTimeQuota === '0') {
          this.dailyMemoryTimeQuota = '';
        } else {
          this.showDailyMemoryInfo = true;
        }

        this.dailyMemoryTimeQuotaOriginal = this.dailyMemoryTimeQuota;

        this.showDailyMemoryWarning = (!this.site.properties.enabled && this.site.properties.siteDisabledReason === 1);

        this.memorySize = this.site.properties.containerSize;
        this.latestExtensionVersion = Constants.runtimeVersion;
        this.extensionVersion = appSettings.properties[Constants.runtimeVersionAppSettingName];

        if (!this.extensionVersion) {
          this.extensionVersion = Constants.latest;
        }

        this.needUpdateExtensionVersion =
          Constants.runtimeVersion !== this.extensionVersion && Constants.latest !== this.extensionVersion.toLowerCase();

        this.routingExtensionVersion = appSettings.properties[Constants.routingExtensionVersionAppSettingName];
        if (!this.routingExtensionVersion) {
          this.routingExtensionVersion = Constants.disabled;
        }
        this.latestRoutingExtensionVersion = Constants.routingExtensionVersion;
        this.apiProxiesEnabled = ((this.routingExtensionVersion) && (this.routingExtensionVersion !== Constants.disabled));
        this.needUpdateRoutingExtensionVersion
          = Constants.routingExtensionVersion !== this.routingExtensionVersion && Constants.latest !== this.routingExtensionVersion.toLowerCase();

        if (EditModeHelper.isReadOnly(r.editMode)) {
          this.functionAppEditMode = false;
        } else {
          this.functionAppEditMode = true;
        }
        this._busyState.clearBusyState();
        this._aiService.stopTrace('/timings/site/tab/function-runtime/revealed', this._viewInfo.data.siteTabRevealedTraceKey);

        //settings for enabling slots, display if there are no slots && appSetting property for slot is set
        this.slotsAppSetting = appSettings.properties[Constants.slotsSecretStorageSettingsName];
        if (this._isSlotApp) { //Slots Node
          this.slotsEnabled = true;
        } else {
          this.slotsEnabled = r.slotsList.length > 0 || this.slotsAppSetting === Constants.slotsSecretStorageSettingsValue;
        }
      });

    this.functionStatusOptions = [
      {
        displayLabel: this._translateService.instant(PortalResources.off),
        value: false
      }, {
        displayLabel: this._translateService.instant(PortalResources.on),
        value: true
      }];

    this.functionAppEditModeOptions = [
      {
        displayLabel: this._translateService.instant(PortalResources.appFunctionSettings_readWriteMode),
        value: true
      }, {
        displayLabel: this._translateService.instant(PortalResources.appFunctionSettings_readOnlyMode),
        value: false
      }
    ];
    this.slotsStatusOptions = [
      {
        displayLabel: this._translateService.instant(PortalResources.off),
        value: false
      }, {
        displayLabel: this._translateService.instant(PortalResources.on),
        value: true
      }];

    this.proxySettingValueStream = new Subject<boolean>();
    this.proxySettingValueStream
      .subscribe((value: boolean) => {
        this._busyState.setBusyState();
        let appSettingValue: string = value ? Constants.routingExtensionVersion : Constants.disabled;

        this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
          .mergeMap(r => {
            return this._updateProxiesVersion(this.site, r.json(), appSettingValue);
          })
          .subscribe(r => {
            this.functionApp.fireSyncTrigger();
            this.apiProxiesEnabled = value;
            this.needUpdateRoutingExtensionVersion = false;
            this.routingExtensionVersion = Constants.routingExtensionVersion;
            this._busyState.clearBusyState();
            this._cacheService.clearArmIdCachePrefix(this.site.id);
          });
      });

    this.functionEditModeValueStream = new Subject<boolean>();
    this.functionEditModeValueStream
      .switchMap(state => {
        let originalState = this.functionAppEditMode;
        this._busyState.setBusyState();
        this.functionAppEditMode = state;
        let appSetting = this.functionAppEditMode ? Constants.ReadWriteMode : Constants.ReadOnlyMode;
        return this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
          .mergeMap(r => {
            let response: ArmObj<any> = r.json();
            response.properties[Constants.functionAppEditModeSettingName] = appSetting;
            return this._cacheService.putArm(response.id, this._armService.websiteApiVersion, response);
          })
          .catch(e => { throw originalState; });
      })
      .do(null, originalState => {
        this.functionAppEditMode = originalState;
        this._busyState.clearBusyState();
        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
          message: this._translateService.instant(PortalResources.error_unableToUpdateFunctionAppEditMode),
          errorType: ErrorType.ApiError,
          errorId: ErrorIds.unableToUpdateFunctionAppEditMode,
          resourceId: this.functionApp.site.id
        });
      })
      .retry()
      // This is needed to update the editMode value for other subscribers
      // getFunctionAppEditMode returns a subject and updates it on demand.
      .mergeMap(_ => this.functionApp.getFunctionAppEditMode())
      .subscribe(fi => {

        this._aiService.stopTrace('/timings/site/tab/function-runtime/full-ready',
        this._viewInfo.data.siteTabFullReadyTraceKey);

        this._busyState.clearBusyState();
      });

    this.slotsValueChange = new Subject<boolean>();
    this.slotsValueChange.subscribe((value: boolean) => {
      this._busyState.setBusyState();
      let slotsSettingsValue: string = value ? Constants.slotsSecretStorageSettingsValue : Constants.disabled;
      this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
        .mergeMap(r => {
          return this._slotsService.setStatusOfSlotOptIn(this.site, r.json(), slotsSettingsValue);
        })
        .do(null, e => {
          this._busyState.clearBusyState();
          this._aiService.trackException(e, 'function-runtime')
        })
        .retry()
        .subscribe(r => {
          this.functionApp.fireSyncTrigger();
          this.slotsEnabled = value;
          this._busyState.clearBusyState();
          this._cacheService.clearArmIdCachePrefix(this.site.id);
        });
    });
  }

  @Input('viewInfoInput') set viewInfoInput(viewInfo: TreeViewInfo<any>) {
    this._viewInfoStream.next(viewInfo);
  }

  onChange(value: string | number, event?: any) {
    if (this.isIE()) {
      value = event.srcElement.value;
      this.memorySize = value;
    }
    this.dirty = (typeof value === 'string' ? parseInt(value, 10) : value) !== this.site.properties.containerSize;
  }

  ngOnDestroy() {
    if (this._viewInfoSub) {
      this._viewInfoSub.unsubscribe();
      this._viewInfoSub = null;
    }
  }

  saveMemorySize(value: string | number) {
    this._busyState.setBusyState();
    this._updateMemorySize(this.site, value)
      .subscribe(r => { this._busyState.clearBusyState(); Object.assign(this.site, r); this.dirty = false; });
  }

  isIE(): boolean {
    return navigator.userAgent.toLocaleLowerCase().indexOf('trident') !== -1;
  }

  updateVersion() {
    this._aiService.trackEvent('/actions/app_settings/update_version');
    this._busyState.setBusyState();
    this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
      .mergeMap(r => {
        return this._updateContainerVersion(this.site, r.json());
      })
      .subscribe(r => {
        this.needUpdateExtensionVersion = false;
        this._busyState.clearBusyState();
        this._cacheService.clearArmIdCachePrefix(this.site.id);
        this._appNode.clearNotification(NotificationIds.newRuntimeVersion);
      });
  }

  updateRoutingExtensionVersion() {
    this._aiService.trackEvent('/actions/app_settings/update_routing_version');
    this._busyState.setBusyState();

    this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
      .mergeMap(r => {
        return this._updateProxiesVersion(this.site, r.json());
      })
      .subscribe(r => {
        this.needUpdateRoutingExtensionVersion = false;
        this._busyState.clearBusyState();
        this._cacheService.clearArmIdCachePrefix(this.site.id);
      });
  }

  setQuota() {
    if (this.dailyMemoryTimeQuotaOriginal !== this.dailyMemoryTimeQuota) {

      let dailyMemoryTimeQuota = +this.dailyMemoryTimeQuota;

      if (dailyMemoryTimeQuota > 0) {
        this._busyState.setBusyState();
        this._updateDailyMemory(this.site, dailyMemoryTimeQuota).subscribe((r) => {
          var site = r.json();
          this.showDailyMemoryWarning = (!site.properties.enabled && site.properties.siteDisabledReason === 1);
          this.showDailyMemoryInfo = true;
          this.site.properties.dailyMemoryTimeQuota = dailyMemoryTimeQuota;
          this.dailyMemoryTimeQuotaOriginal = this.dailyMemoryTimeQuota;
          this._busyState.clearBusyState();
        });
      }
    }
  }

  removeQuota() {
    this._busyState.setBusyState();
    this._updateDailyMemory(this.site, 0).subscribe(() => {
      this.showDailyMemoryInfo = false;
      this.showDailyMemoryWarning = false;
      this.dailyMemoryTimeQuota = '';
      this.dailyMemoryTimeQuotaOriginal = this.dailyMemoryTimeQuota;
      this.site.properties.dailyMemoryTimeQuota = 0;
      this._busyState.clearBusyState();
    });
  }

  openAppSettings() {
    this._portalService.openBlade({
      detailBlade: "WebsiteConfigSiteSettings",
      detailBladeInputs: {
        resourceUri: this.site.id,
      }
    }, "settings");
  }

  private _updateContainerVersion(site: ArmObj<Site>, appSettings: ArmObj<any>) {
    if (appSettings.properties[Constants.azureJobsExtensionVersion]) {
      delete appSettings[Constants.azureJobsExtensionVersion];
    }
    appSettings.properties[Constants.runtimeVersionAppSettingName] = Constants.runtimeVersion;
    appSettings.properties[Constants.nodeVersionAppSettingName] = Constants.nodeVersion;

    return this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings);
  }

  private _updateProxiesVersion(site: ArmObj<Site>, appSettings: ArmObj<any>, value?: string) {

    if (value !== Constants.disabled) {
      this._aiService.trackEvent('/actions/proxy/enabled');
    }

    if (appSettings[Constants.routingExtensionVersionAppSettingName]) {
      delete appSettings.properties[Constants.routingExtensionVersionAppSettingName];
    }
    appSettings.properties[Constants.routingExtensionVersionAppSettingName] = value ? value : Constants.routingExtensionVersion;

    return this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings);
  }

  private _updateDailyMemory(site: ArmObj<Site>, value: number) {

    let body = JSON.stringify({
      Location: site.location,
      Properties: {
        dailyMemoryTimeQuota: value,
        enabled: true
      }
    });

    return this._cacheService.putArm(site.id, this._armService.websiteApiVersion, body);
  }


  private _updateMemorySize(site: ArmObj<Site>, memorySize: string | number) {
    let nMemorySize = typeof memorySize === 'string' ? parseInt(memorySize, 10) : memorySize;
    site.properties.containerSize = nMemorySize;

    return this._cacheService.putArm(site.id, this._armService.websiteApiVersion, site)
      .map(r => <ArmObj<Site>>(r.json()));
  }

  public get GlobalDisabled() {
    return this._globalStateService.GlobalDisabled;
  }
}
