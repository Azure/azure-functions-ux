import { ErrorIds } from './../../shared/models/error-ids';
import { ErrorEvent, ErrorType } from './../../shared/models/error-event';
import { SiteConfig } from './../../shared/models/arm/site-config';
import { NotificationIds, Constants } from './../../shared/models/constants';
import { Response } from '@angular/http';
import { LanguageService } from './../../shared/services/language.service';
import { Observable, Subject, Subscription as RxSubscription } from 'rxjs/Rx';
import { CacheService } from './../../shared/services/cache.service';
import { Site } from './../../shared/models/arm/site';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { AppNode } from './../../tree-view/app-node';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
import { Component, Input, OnDestroy } from '@angular/core';
import { ArmService } from '../../shared/services/arm.service';
import { PortalService } from '../../shared/services/portal.service';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../shared/models/broadcast-event'
import { FunctionsService } from '../../shared/services/functions.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { TranslatePipe } from '@ngx-translate/core';
import { AiService } from '../../shared/services/ai.service';
import { SelectOption } from '../../shared/models/select-option';
import { PortalResources } from '../../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { FunctionApp } from './../../shared/function-app';
import { FunctionAppEditMode } from "../../shared/models/function-app-edit-mode";

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
  public showDailyMemoryWarning: boolean = false;
  public showDailyMemoryInfo: boolean = false;
  public functionApp: FunctionApp;

  public functionStatusOptions: SelectOption<boolean>[];
  public needUpdateRoutingExtensionVersion: boolean;
  public routingExtensionVersion: string;
  public latestRoutingExtensionVersion: string;
  public apiProxiesEnabled: boolean;
  private proxySettingValueStream: Subject<boolean>;
  private functionEditModeValueStream: Subject<boolean>;
  public showTryView: boolean;

  private _viewInfoStream = new Subject<TreeViewInfo>();
  private _viewInfo: TreeViewInfo;
  private _viewInfoSub: RxSubscription;
  private _appNode: AppNode;

  public functionAppEditMode: boolean = true;
  public functionAppEditModeOptions: SelectOption<boolean>[];

  constructor(
    private _armService: ArmService,
    private _cacheService: CacheService,
    private _portalService: PortalService,
    private _broadcastService: BroadcastService,
    private _functionsService: FunctionsService,
    private _globalStateService: GlobalStateService,
    private _aiService: AiService,
    private _languageService: LanguageService,
    private _translateService: TranslateService) {

    this.showTryView = this._globalStateService.showTryView;
    this._viewInfoSub = this._viewInfoStream
      .switchMap(viewInfo => {
        this._viewInfo = viewInfo;
        this._globalStateService.setBusyState();

        this._appNode = (<AppNode>viewInfo.node);

            return Observable.zip(
                this._cacheService.getArm(viewInfo.resourceId),
                this._cacheService.postArm(`${viewInfo.resourceId}/config/appsettings/list`, true),
                this._appNode.functionAppStream,
                (s: Response, a: Response, fa: FunctionApp) => ({ siteResponse: s, appSettingsResponse: a, functionApp: fa }))
                .flatMap(result => {
                  return result.functionApp
                          .getFunctionAppEditMode()
                          .map(editMode => ({
                              siteResponse: result.siteResponse,
                              appSettingsResponse: result.appSettingsResponse,
                              functionApp: result.functionApp,
                              editMode: editMode
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

            this.dailyMemoryTimeQuota = this.site.properties.dailyMemoryTimeQuota
                ? this.site.properties.dailyMemoryTimeQuota.toString()
                : '0';

            if (this.dailyMemoryTimeQuota === '0') {
                this.dailyMemoryTimeQuota = '';
            } else {
                this.showDailyMemoryInfo = true;
            }

            this.showDailyMemoryWarning = (!this.site.properties.enabled && this.site.properties.siteDisabledReason === 1);

            this.memorySize = this.site.properties.containerSize;
            this.latestExtensionVersion = Constants.runtimeVersion;
            this.extensionVersion = appSettings.properties[Constants.runtimeVersionAppSettingName];

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

            if (r.editMode === FunctionAppEditMode.ReadOnly || r.editMode === FunctionAppEditMode.ReadOnlySourceControlled) {
                this.functionAppEditMode = false;
            } else {
                this.functionAppEditMode = true;
            }
            this._globalStateService.clearBusyState();
            let traceKey = this._viewInfo.data.siteTraceKey;
            this._aiService.stopTrace('/site/function-runtime-tab-ready', traceKey);
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

    this.proxySettingValueStream = new Subject<boolean>();
    this.proxySettingValueStream
      .subscribe((value: boolean) => {
        this._globalStateService.setBusyState();
        let appSettingValue: string = value ? Constants.routingExtensionVersion : Constants.disabled;

        this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
            .flatMap(r => {
                return this._updateProxiesVersion(this.site, r.json(), appSettingValue);
            })
            .subscribe(r => {
                this.functionApp.fireSyncTrigger();
                this.apiProxiesEnabled = value;
                this.needUpdateRoutingExtensionVersion = false;
                this.routingExtensionVersion = Constants.routingExtensionVersion;
                this._globalStateService.clearBusyState();
                this._cacheService.clearArmIdCachePrefix(this.site.id);
            });
    });

    this.functionEditModeValueStream = new Subject<boolean>();
    this.functionEditModeValueStream
      .switchMap(state => {
        let originalState = this.functionAppEditMode;
        this._globalStateService.setBusyState();
        this.functionAppEditMode = state;
        let appSetting = this.functionAppEditMode ? Constants.ReadWriteMode : Constants.ReadOnlyMode;
        return this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
            .flatMap(r => {
              let response: ArmObj<any> = r.json();
              response.properties[Constants.functionAppEditModeSettingName] = appSetting;
              return this._cacheService.putArm(response.id, this._armService.websiteApiVersion, response);
            })
            .catch(e => { throw originalState; } );
      })
      .do(null, originalState => {
        this.functionAppEditMode = originalState;
        this._globalStateService.clearBusyState();
        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
          message: this._translateService.instant(PortalResources.error_unableToUpdateFunctionAppEditMode),
          errorType: ErrorType.ApiError,
          errorId: ErrorIds.unableToUpdateFunctionAppEditMode
        });
      })
      .retry()
      .subscribe(fi => {
        this._globalStateService.clearBusyState();
      });
  }

  @Input('viewInfoInput') set viewInfoInput(viewInfo: TreeViewInfo) {
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
    this._globalStateService.setBusyState();
    this._updateMemorySize(this.site, value)
      .subscribe(r => { this._globalStateService.clearBusyState(); Object.assign(this.site, r); this.dirty = false; });
  }

  isIE(): boolean {
    return navigator.userAgent.toLocaleLowerCase().indexOf('trident') !== -1;
  }

  updateVersion() {
    this._aiService.trackEvent('/actions/app_settings/update_version');
    this._globalStateService.setBusyState();
    this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
      .flatMap(r => {
        return this._updateContainerVersion(this.site, r.json());
      })
      .subscribe(r => {
        this.needUpdateExtensionVersion = false;
        this._globalStateService.clearBusyState();
        this._cacheService.clearArmIdCachePrefix(this.site.id);
        this._appNode.clearNotification(NotificationIds.newRuntimeVersion);
      });
  }

  updateRoutingExtensionVersion() {
      this._aiService.trackEvent('/actions/app_settings/update_routing_version');
      this._globalStateService.setBusyState();

    this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
      .flatMap(r => {
        return this._updateProxiesVersion(this.site, r.json());
      })
      .subscribe(r => {
        this.needUpdateRoutingExtensionVersion = false;
        this._globalStateService.clearBusyState();
        this._cacheService.clearArmIdCachePrefix(this.site.id);
      });
  }

  setQuota() {
    let dailyMemoryTimeQuota = +this.dailyMemoryTimeQuota;

    if (dailyMemoryTimeQuota > 0) {
      this._globalStateService.setBusyState();
      this._updateDailyMemory(this.site, dailyMemoryTimeQuota).subscribe((r) => {
        var site = r.json();
        this.showDailyMemoryWarning = (!site.properties.enabled && site.properties.siteDisabledReason === 1);
        this.showDailyMemoryInfo = true;
        this.site.properties.dailyMemoryTimeQuota = dailyMemoryTimeQuota;
        this._globalStateService.clearBusyState();
      });
    }
  }

  removeQuota() {
    this._globalStateService.setBusyState();
    this._updateDailyMemory(this.site, 0).subscribe(() => {
      this.showDailyMemoryInfo = false;
      this.showDailyMemoryWarning = false;
      this.dailyMemoryTimeQuota = '';
      this.site.properties.dailyMemoryTimeQuota = 0;
      this._globalStateService.clearBusyState();
    });
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
