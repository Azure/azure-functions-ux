import { LogCategories } from 'app/shared/models/constants';
import { LogService } from './../../shared/services/log.service';
import { FunctionsService } from './../../shared/services/functions-service';
import { BusyStateScopeManager } from './../../busy-state/busy-state-scope-manager';
import { ConfigService } from './../../shared/services/config.service';
import { EditModeHelper } from './../../shared/Utilities/edit-mode.helper';
import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';
import { ErrorIds } from './../../shared/models/error-ids';
import { ErrorEvent, ErrorType } from './../../shared/models/error-event';
import { NotificationIds, Constants, SiteTabIds } from './../../shared/models/constants';
import { CacheService } from './../../shared/services/cache.service';
import { Site } from './../../shared/models/arm/site';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { AppNode } from './../../tree-view/app-node';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { ArmService } from '../../shared/services/arm.service';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../shared/models/broadcast-event';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { AiService } from '../../shared/services/ai.service';
import { SelectOption } from '../../shared/models/select-option';
import { PortalResources } from '../../shared/models/portal-resources';
import { FunctionApp } from './../../shared/function-app';
import { FunctionAppEditMode } from '../../shared/models/function-app-edit-mode';
import { SiteService } from '../../shared/services/slots.service';
import { HostStatus } from './../../shared/models/host-status';
import { FunctionsVersionInfoHelper } from './../../shared/models/functions-version-info';
import { AccessibilityHelper } from './../../shared/Utilities/accessibility-helper';
import { ArmUtil } from './../../shared/Utilities/arm-utils';
import { LanguageService } from '../../shared/services/language.service';

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
  public showDailyMemoryWarning = false;
  public showDailyMemoryInfo = false;
  public functionApp: FunctionApp;
  public exactExtensionVersion: string;

  public functionStatusOptions: SelectOption<boolean>[];
  public showProxyEnable = false;
  public showProxyEnabledWarning = false;
  public functionRutimeOptions: SelectOption<string>[];
  public functionRuntimeValueStream: Subject<string>;
  public proxySettingValueStream: Subject<boolean>;
  public functionEditModeValueStream: Subject<boolean>;
  public isLinuxApp: boolean;
  public isStopped: boolean;
  public hasFunctions: boolean;

  private _viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
  private _viewInfo: TreeViewInfo<SiteData>;
  private _appNode: AppNode;

  public functionAppEditMode = true;
  public functionAppEditModeOptions: SelectOption<boolean>[];

  private _isSlotApp = false;
  public slotsStatusOptions: SelectOption<boolean>[];
  public slotsAppSetting: string;
  public slotsEnabled: boolean;
  public slotsValueChange: Subject<boolean>;
  private _busyManager: BusyStateScopeManager;
  private _ngUnsubscribe = new Subject();

  constructor(
    private _armService: ArmService,
    private _cacheService: CacheService,
    private _broadcastService: BroadcastService,
    private _globalStateService: GlobalStateService,
    private _aiService: AiService,
    private _translateService: TranslateService,
    private _slotsService: SiteService,
    private _configService: ConfigService,
    private _functionsService: FunctionsService,
    private _injector: Injector,
    private _logService: LogService,
    private _languageService: LanguageService) {

    this._busyManager = new BusyStateScopeManager(_broadcastService, 'site-tabs');

    let appContext;
    this._viewInfoStream
      .takeUntil(this._ngUnsubscribe)
      .switchMap(viewInfo => {
        this._viewInfo = viewInfo;
        this._busyManager.setBusy();

        this._appNode = (<AppNode>viewInfo.node);

        return this._functionsService.getAppContext(this._viewInfo.resourceId);
      })
      .switchMap(context => {
        this.site = context.site;
        appContext = context;

        if (this.functionApp) {
          this.functionApp.dispose();
        }

        this.functionApp = new FunctionApp(context.site, this._injector);

        this.isStopped = context.site.properties.state.toLocaleLowerCase() !== 'Running'.toLocaleLowerCase();
        this.isLinuxApp = ArmUtil.isLinuxApp(this.site);
        return this.functionApp.initKeysAndWarmupMainSite();
      })
      .switchMap(() => {
        const getFunctions = this.isStopped ? Observable.of([]) : this._functionsService.getFunctions(appContext);

        return Observable.zip(
          this._cacheService.postArm(`${this._viewInfo.resourceId}/config/appsettings/list`, true),
          this._slotsService.getSlotsList(this._viewInfo.resourceId),
          getFunctions,
          (a: Response, slots: ArmObj<Site>[], functions: any[]) => ({ appSettingsResponse: a, slotsList: slots , functionsList: functions}))
          .mergeMap(result => {
            this.hasFunctions = result.functionsList.length > 0;
            return Observable.zip(this.functionApp.getFunctionAppEditMode(), this.functionApp.checkRuntimeStatus(),
              (editMode: FunctionAppEditMode, hostStatus: HostStatus) => ({ editMode: editMode, hostStatus: hostStatus }))
              .map(r => ({
                appSettingsResponse: result.appSettingsResponse,
                editMode: r.editMode,
                hostStatus: r.hostStatus,
                slotsList: result.slotsList
              })
              );
          });
      })
      .do(null, e => {
        this._logService.error(LogCategories.functionAppSettings, 'function-runtime-load', e);
        this._busyManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        const appSettings: ArmObj<any> = r.appSettingsResponse.json();
        this.exactExtensionVersion = r.hostStatus ? r.hostStatus.version : '';
        this._isSlotApp = SiteService.isSlot(this.site.id);
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
        this.extensionVersion = appSettings.properties[Constants.runtimeVersionAppSettingName];

        if (!this.extensionVersion) {
          this.extensionVersion = Constants.latest;
        }

        this.setNeedUpdateExtensionVersion();

        this.showProxyEnable = appSettings.properties[Constants.routingExtensionVersionAppSettingName]
          ? appSettings.properties[Constants.routingExtensionVersionAppSettingName].toLocaleLowerCase() === Constants.disabled.toLocaleLowerCase()
          : false;

        if (EditModeHelper.isReadOnly(r.editMode)) {
          this.functionAppEditMode = false;
        } else {
          this.functionAppEditMode = true;
        }
        this._busyManager.clearBusy();
        this._aiService.stopTrace('/timings/site/tab/function-runtime/revealed', this._viewInfo.data.siteTabRevealedTraceKey);

        // settings for enabling slots, display if there are no slots && appSetting property for slot is set
        this.slotsAppSetting = appSettings.properties[Constants.slotsSecretStorageSettingsName];
        if (this._isSlotApp) { // Slots Node
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

    this.functionRutimeOptions = [
      {
        displayLabel: '~1',
        value: '~1'
      }, {
        displayLabel: 'beta',
        value: 'beta'
      }];

    this.proxySettingValueStream = new Subject<boolean>();
    this.proxySettingValueStream
      .filter(value => value === true)
      .subscribe((value: boolean) => {
        if (this.showProxyEnable) {

          this._busyManager.setBusy();

          this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
            .mergeMap(r => {
              return this._updateProxiesVersion(r.json());
            })
            .subscribe(() => {
              this.showProxyEnable = false;
              this.showProxyEnabledWarning = true;
              this._busyManager.clearBusy();
              this._cacheService.clearArmIdCachePrefix(this.site.id);
            });
        }
      });

    this.functionEditModeValueStream = new Subject<boolean>();
    this.functionEditModeValueStream
      .filter(state => state !== this.functionAppEditMode)
      .switchMap(state => {
        const originalState = this.functionAppEditMode;
        this._busyManager.setBusy();
        this.functionAppEditMode = state;
        const appSetting = this.functionAppEditMode ? Constants.ReadWriteMode : Constants.ReadOnlyMode;
        return this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
          .mergeMap(r => {
            const response: ArmObj<any> = r.json();
            response.properties[Constants.functionAppEditModeSettingName] = appSetting;
            return this._cacheService.putArm(response.id, this._armService.websiteApiVersion, response);
          })
          .catch(() => { throw originalState; });
      })
      .do(null, originalState => {
        this.functionAppEditMode = originalState;
        this._busyManager.clearBusy();
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
      .subscribe(() => {

        this._aiService.stopTrace('/timings/site/tab/function-runtime/full-ready',
          this._viewInfo.data.siteTabFullReadyTraceKey);

        this._busyManager.clearBusy();
      });

    this.slotsValueChange = new Subject<boolean>();
    this.slotsValueChange
      .filter(value => value !== this.slotsEnabled)
      .subscribe((value: boolean) => {
        this._busyManager.setBusy();
        const slotsSettingsValue: string = value ? Constants.slotsSecretStorageSettingsValue : Constants.disabled;
        this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
          .mergeMap(r => {
            return this._slotsService.setStatusOfSlotOptIn(r.json(), slotsSettingsValue);
          })
          .do(null, e => {
            this._busyManager.clearBusy();
            this._logService.error(LogCategories.functionAppSettings, '/save-slot-change', e);
          })
          .retry()
          .subscribe(() => {
            this.functionApp.fireSyncTrigger();
            this.slotsEnabled = value;
            this._busyManager.clearBusy();
            this._cacheService.clearArmIdCachePrefix(this.site.id);
          });
      });

    this.functionRuntimeValueStream = new Subject<string>();
    this.functionRuntimeValueStream.subscribe((value: string) => {
      this.updateVersion(value);
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
    this._ngUnsubscribe.next();

    if (this.functionApp) {
      this.functionApp.dispose();
    }
  }

  saveMemorySize(value: string | number) {
    this._busyManager.setBusy();
    this._updateMemorySize(this.site, value)
      .subscribe(r => { this._busyManager.clearBusy(); Object.assign(this.site, r); this.dirty = false; });
  }

  isIE(): boolean {
    return navigator.userAgent.toLocaleLowerCase().indexOf('trident') !== -1;
  }

  updateVersion(version?: string) {
    if (version === this.extensionVersion) {
      return;
    }
    let updateButtonClicked = false;
    if (!version) {
      updateButtonClicked = true;
      version = this.getLatestVersion(this.extensionVersion);
    };
    this._aiService.trackEvent('/actions/app_settings/update_version');
    this._busyManager.setBusy();
    this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
      .mergeMap(r => {
        return this._updateContainerVersion(r.json(), version);
      })
      .mergeMap(r => {
        return this.functionApp.checkRuntimeStatus()
          .map((hostStatus: HostStatus) => {
            if (!hostStatus.version || (hostStatus.version === this.exactExtensionVersion && !updateButtonClicked)) {
              throw Observable.throw('Host version is not updated yet');
            }
            return hostStatus;
          })
          .retryWhen(error => {
            return error.scan((errorCount: number, err: any) => {
              if (errorCount >= 20) {
                throw err;
              } else {
                return errorCount + 1;
              }
            }, 0).delay(3000);
          });
      })
      .do(null, e => {
        this._busyManager.clearBusy();
        this._aiService.trackException(e, '/errors/rutime-update');
        console.error(e);
      })
      .subscribe((hostStatus: HostStatus) => {
        this.exactExtensionVersion = hostStatus ? hostStatus.version : '';
        this.extensionVersion = version;
        this.setNeedUpdateExtensionVersion();
        this._busyManager.clearBusy();
        this._cacheService.clearArmIdCachePrefix(this.site.id);
        this._appNode.clearNotification(NotificationIds.newRuntimeVersion);

        this._languageService.getResources(version);
      });
  }

  setQuota() {
    if (this.dailyMemoryTimeQuotaOriginal !== this.dailyMemoryTimeQuota) {

      const dailyMemoryTimeQuota = +this.dailyMemoryTimeQuota;

      if (dailyMemoryTimeQuota > 0) {
        this._busyManager.setBusy();
        this._updateDailyMemory(this.site, dailyMemoryTimeQuota).subscribe((r) => {
          const site = r.json();
          this.showDailyMemoryWarning = (!site.properties.enabled && site.properties.siteDisabledReason === 1);
          this.showDailyMemoryInfo = true;
          this.site.properties.dailyMemoryTimeQuota = dailyMemoryTimeQuota;
          this.dailyMemoryTimeQuotaOriginal = this.dailyMemoryTimeQuota;
          this._busyManager.clearBusy();
        });
      }
    }
  }

  removeQuota() {
    this._busyManager.setBusy();
    this._updateDailyMemory(this.site, 0).subscribe(() => {
      this.showDailyMemoryInfo = false;
      this.showDailyMemoryWarning = false;
      this.dailyMemoryTimeQuota = '';
      this.dailyMemoryTimeQuotaOriginal = this.dailyMemoryTimeQuota;
      this.site.properties.dailyMemoryTimeQuota = 0;
      this._busyManager.clearBusy();
    });
  }

  openAppSettings() {
    this._broadcastService.broadcastEvent<string>(BroadcastEvent.OpenTab, SiteTabIds.applicationSettings);
  }


  keyDown(event: any, command: string) {
    if (AccessibilityHelper.isEnterOrSpace(event)) {
      switch (command) {
        case 'openAppSettings':
          {
            this.openAppSettings();
            break;
          }
      }
    }
  }

  private _updateContainerVersion(appSettings: ArmObj<any>, version: string) {
    if (appSettings.properties[Constants.azureJobsExtensionVersion]) {
      delete appSettings[Constants.azureJobsExtensionVersion];
    }
    appSettings.properties[Constants.runtimeVersionAppSettingName] = version;
    appSettings.properties[Constants.nodeVersionAppSettingName] = Constants.nodeVersion;

    return this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings);
  }

  private _updateProxiesVersion(appSettings: ArmObj<any>) {
    if (appSettings.properties[Constants.routingExtensionVersionAppSettingName]) {
      delete appSettings.properties[Constants.routingExtensionVersionAppSettingName];
    }

    return this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings);
  }

  private _updateDailyMemory(site: ArmObj<Site>, value: number) {

    const body = JSON.stringify({
      Location: site.location,
      Properties: {
        dailyMemoryTimeQuota: value,
        enabled: true
      }
    });

    return this._cacheService.putArm(site.id, this._armService.websiteApiVersion, body);
  }


  private _updateMemorySize(site: ArmObj<Site>, memorySize: string | number) {
    const nMemorySize = typeof memorySize === 'string' ? parseInt(memorySize, 10) : memorySize;
    site.properties.containerSize = nMemorySize;

    return this._cacheService.putArm(site.id, this._armService.websiteApiVersion, site)
      .map(r => <ArmObj<Site>>(r.json()));
  }

  public get GlobalDisabled() {
    return this._globalStateService.GlobalDisabled;
  }

  private setNeedUpdateExtensionVersion() {
    this.needUpdateExtensionVersion = FunctionsVersionInfoHelper.needToUpdateRuntime(this._configService.FunctionsVersionInfo, this.extensionVersion);
    this.latestExtensionVersion = this.getLatestVersion(this.extensionVersion);
  }

  private getLatestVersion(version: string): string {
    const match = this._configService.FunctionsVersionInfo.runtimeStable.find(v => {
      return this.extensionVersion.toLowerCase() === v;
    });
    if (match) {
      return match;
    } else {
      if (version.startsWith('1.')) {
        return '~1';
      } else if (version.startsWith('2.')) {
        return '~2';
      } else {
        return this._configService.FunctionsVersionInfo.runtimeDefault;
      }
    }
  }
}
