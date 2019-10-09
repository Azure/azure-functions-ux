import { NotificationIds, SiteTabIds, Constants, FunctionAppRuntimeSetting } from './../../shared/models/constants';
import { ScenarioIds } from './../../shared/models/constants';
import { ScenarioService } from 'app/shared/services/scenario/scenario.service';
import { BusyStateScopeManager } from './../../busy-state/busy-state-scope-manager';
import { ConfigService } from './../../shared/services/config.service';
import { EditModeHelper } from './../../shared/Utilities/edit-mode.helper';
import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';
import { errorIds } from './../../shared/models/error-ids';
import { CacheService } from './../../shared/services/cache.service';
import { Site } from './../../shared/models/arm/site';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { AppNode } from './../../tree-view/app-node';
import { ArmService } from '../../shared/services/arm.service';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { AiService } from '../../shared/services/ai.service';
import { SelectOption } from '../../shared/models/select-option';
import { PortalResources } from '../../shared/models/portal-resources';
import { HostStatus } from './../../shared/models/host-status';
import { FunctionsVersionInfoHelper } from './../../shared/models/functions-version-info';
import { AccessibilityHelper } from './../../shared/Utilities/accessibility-helper';
import { ArmUtil } from './../../shared/Utilities/arm-utils';
import { LanguageService } from '../../shared/services/language.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { Subscription } from 'rxjs/Subscription';
import { SiteService } from 'app/shared/services/site.service';
import { PortalService } from 'app/shared/services/portal.service';
import { FunctionService } from 'app/shared/services/function.service';

@Component({
  selector: 'function-runtime',
  templateUrl: './function-runtime.component.html',
  styleUrls: ['./function-runtime.component.scss'],
})
export class FunctionRuntimeComponent extends FunctionAppContextComponent {
  public memorySize: number | string;
  public dirty: boolean;
  public needUpdateExtensionVersion;
  public extensionVersion: string;
  public latestExtensionVersion: string;
  public dailyMemoryTimeQuota: string;
  public dailyMemoryTimeQuotaOriginal: string;
  public showDailyMemoryWarning = false;
  public showDailyMemoryInfo = false;
  public exactExtensionVersion: string;
  public showIpRestrictionsWarning = false;

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
  public badRuntimeVersion: boolean;
  public isLinuxDynamic: boolean;

  private _appNode: AppNode;

  public functionAppEditMode = true;
  public functionAppEditModeOptions: SelectOption<boolean>[];
  public functionAppEditModeForcedWarning: string;

  public betaDisabled = false;
  public disableRuntimeSelector = false;
  public disableSomeVersionSwaps = false;
  private _busyManager: BusyStateScopeManager;

  constructor(
    private _armService: ArmService,
    private _cacheService: CacheService,
    broadcastService: BroadcastService,
    private _globalStateService: GlobalStateService,
    private _aiService: AiService,
    private _translateService: TranslateService,
    private _configService: ConfigService,
    private _functionAppService: FunctionAppService,
    private _scenarioService: ScenarioService,
    private _languageService: LanguageService,
    private _siteService: SiteService,
    private _portalService: PortalService,
    private _functionService: FunctionService
  ) {
    super('function-runtime', _functionAppService, broadcastService, _functionService, () => this._busyManager.setBusy());

    this._busyManager = new BusyStateScopeManager(broadcastService, SiteTabIds.functionRuntime);

    this.betaDisabled = this._scenarioService.checkScenario(ScenarioIds.functionBeta).status === 'disabled';

    this.functionStatusOptions = [
      {
        displayLabel: this._translateService.instant(PortalResources.off),
        value: false,
      },
      {
        displayLabel: this._translateService.instant(PortalResources.on),
        value: true,
      },
    ];

    this.functionAppEditModeOptions = [
      {
        displayLabel: this._translateService.instant(PortalResources.appFunctionSettings_readWriteMode),
        value: true,
      },
      {
        displayLabel: this._translateService.instant(PortalResources.appFunctionSettings_readOnlyMode),
        value: false,
      },
    ];

    this.functionRutimeOptions = [
      {
        displayLabel: FunctionAppRuntimeSetting.tilda1,
        value: FunctionAppRuntimeSetting.tilda1,
      },
      {
        displayLabel: FunctionAppRuntimeSetting.tilda2,
        value: FunctionAppRuntimeSetting.tilda2,
      },
    ];

    this.proxySettingValueStream = new Subject<boolean>();
    this.proxySettingValueStream
      .filter(value => value === true)
      .subscribe((value: boolean) => {
        if (this.showProxyEnable) {
          this._busyManager.setBusy();

          this._cacheService
            .postArm(`${this.context.site.id}/config/appsettings/list`, true)
            .mergeMap(r => {
              return this._updateProxiesVersion(r.json());
            })
            .subscribe(() => {
              this.showProxyEnable = false;
              this.showProxyEnabledWarning = true;
              this._busyManager.clearBusy();
              this._cacheService.clearArmIdCachePrefix(this.context.site.id);
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
        return this._cacheService
          .postArm(`${this.context.site.id}/config/appsettings/list`, true)
          .mergeMap(r => {
            const response: ArmObj<any> = r.json();
            response.properties[Constants.functionAppEditModeSettingName] = appSetting;
            return this._cacheService.putArm(response.id, this._armService.antaresApiVersion20181101, response);
          })
          .catch(() => {
            throw originalState;
          });
      })
      .do(null, originalState => {
        this.functionAppEditMode = originalState;
        this._busyManager.clearBusy();
        this.showComponentError({
          message: this._translateService.instant(PortalResources.error_unableToUpdateFunctionAppEditMode),
          errorId: errorIds.unableToUpdateFunctionAppEditMode,
          resourceId: this.context.site.id,
        });
      })
      .retry()
      // This is needed to update the editMode value for other subscribers
      // getFunctionAppEditMode returns a subject and updates it on demand.
      .mergeMap(_ => this._functionAppService.getFunctionAppEditMode(this.context))
      .subscribe(() => {
        this._aiService.stopTrace('/timings/site/tab/function-runtime/full-ready', this.viewInfo.data.siteTabFullReadyTraceKey);

        this._appNode.refresh();
        this._busyManager.clearBusy();
      });

    this.functionRuntimeValueStream = new Subject<string>();
    this.functionRuntimeValueStream.subscribe((value: string) => {
      this.updateVersion(value);
    });
  }

  setup(): Subscription {
    return this.viewInfoEvents
      .switchMap(viewInfo => {
        this._appNode = <AppNode>viewInfo.node;
        this.isStopped =
          this.context.site.properties.state && this.context.site.properties.state.toLocaleLowerCase() !== 'Running'.toLocaleLowerCase();
        this.isLinuxApp = ArmUtil.isLinuxApp(this.context.site);
        this.isLinuxDynamic = ArmUtil.isLinuxDynamic(this.context.site);

        return Observable.forkJoin(
          this._cacheService.postArm(`${this.viewInfo.resourceId}/config/appsettings/list`, true),
          this._functionAppService.getSlotsList(this.context),
          this._functionAppService.getFunctionAppEditMode(this.context),
          this._functionAppService.getFunctionHostStatus(this.context),
          this._functionService.getFunctions(this.context.site.id)
        );
      })
      .do(() => this._busyManager.clearBusy())
      .subscribe(tuple => {
        // Assume true if there was an error.
        this.hasFunctions = tuple[4].isSuccessful ? tuple[4].result.value.length > 0 : true;

        const appSettings: ArmObj<any> = tuple[0].json();
        this.exactExtensionVersion = tuple[3].isSuccessful ? tuple[3].result.version : '';
        this.dailyMemoryTimeQuota = this.context.site.properties.dailyMemoryTimeQuota
          ? this.context.site.properties.dailyMemoryTimeQuota.toString()
          : '0';

        if (this.dailyMemoryTimeQuota === '0') {
          this.dailyMemoryTimeQuota = '';
        } else {
          this.showDailyMemoryInfo = true;
        }

        this.dailyMemoryTimeQuotaOriginal = this.dailyMemoryTimeQuota;

        this.showDailyMemoryWarning = !this.context.site.properties.enabled && this.context.site.properties.siteDisabledReason === 1;

        this.memorySize = this.context.site.properties.containerSize;
        this.extensionVersion = appSettings.properties[Constants.runtimeVersionAppSettingName];

        if (!this.extensionVersion) {
          this.extensionVersion = Constants.latest;
        }

        this.disableRuntimeSelector = this.extensionVersion !== Constants.latest && (this.hasFunctions || this.betaDisabled);

        this._handleV3Option();

        this.badRuntimeVersion = !this._validRuntimeVersion();

        this.setNeedUpdateExtensionVersion();

        this.showProxyEnable = appSettings.properties[Constants.routingExtensionVersionAppSettingName]
          ? appSettings.properties[Constants.routingExtensionVersionAppSettingName].toLocaleLowerCase() ===
            Constants.disabled.toLocaleLowerCase()
          : false;

        if (tuple[2].isSuccessful) {
          this.functionAppEditMode = !EditModeHelper.isReadOnly(tuple[2].result);
          this.functionAppEditModeForcedWarning = EditModeHelper.getWarningIfForced(tuple[2].result);
        } else {
          this.functionAppEditMode = true;
          this.functionAppEditModeForcedWarning = null;
        }
        this._busyManager.clearBusy();
        this._aiService.stopTrace('/timings/site/tab/function-runtime/revealed', this.viewInfo.data.siteTabRevealedTraceKey);
      });
  }

  onChange(value: string | number, event?: any) {
    if (this.isIE()) {
      value = event.srcElement.value;
      this.memorySize = value;
    }
    this.dirty = (typeof value === 'string' ? parseInt(value, 10) : value) !== this.context.site.properties.containerSize;
  }

  saveMemorySize(value: string | number) {
    this._busyManager.setBusy();
    this._updateMemorySize(this.context.site, value).subscribe(r => {
      this._busyManager.clearBusy();
      Object.assign(this.context.site, r);
      this.dirty = false;
    });
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
    }
    this._aiService.trackEvent('/actions/app_settings/update_version');
    this._busyManager.setBusy();
    this._cacheService
      .postArm(`${this.context.site.id}/config/appsettings/list`, true)
      .mergeMap(r => {
        return this._updateContainerVersion(r.json(), version);
      })
      .mergeMap(r => {
        if (r.isSuccessful) {
          return this._functionAppService
            .getFunctionHostStatus(this.context)
            .map(hostStatus => {
              if (
                !hostStatus.isSuccessful ||
                !hostStatus.result.version ||
                (hostStatus.result.version === this.exactExtensionVersion && !updateButtonClicked)
              ) {
                throw Observable.throw('Host version is not updated yet');
              }
              return hostStatus.result;
            })
            .retryWhen(error => {
              return error
                .scan((errorCount: number, err: any) => {
                  if (errorCount >= 20) {
                    throw err;
                  } else {
                    return errorCount + 1;
                  }
                }, 0)
                .delay(3000);
            });
        } else {
          throw Observable.throw(r.error);
        }
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
        this._cacheService.clearArmIdCachePrefix(this.context.site.id);
        this._appNode.clearNotification(NotificationIds.newRuntimeVersion);
        this._languageService.getResources(version);
      });
  }

  setQuota() {
    if (this.dailyMemoryTimeQuotaOriginal !== this.dailyMemoryTimeQuota) {
      const dailyMemoryTimeQuota = +this.dailyMemoryTimeQuota;

      if (dailyMemoryTimeQuota > 0) {
        this._busyManager.setBusy();
        this._updateDailyMemory(this.context.site, dailyMemoryTimeQuota).subscribe(r => {
          const site = r.json();
          this.showDailyMemoryWarning = !site.properties.enabled && site.properties.siteDisabledReason === 1;
          this.showDailyMemoryInfo = true;
          this.context.site.properties.dailyMemoryTimeQuota = dailyMemoryTimeQuota;
          this.dailyMemoryTimeQuotaOriginal = this.dailyMemoryTimeQuota;
          this._busyManager.clearBusy();
        });
      }
    }
  }

  removeQuota() {
    this._busyManager.setBusy();
    this._updateDailyMemory(this.context.site, 0).subscribe(() => {
      this.showDailyMemoryInfo = false;
      this.showDailyMemoryWarning = false;
      this.dailyMemoryTimeQuota = '';
      this.dailyMemoryTimeQuotaOriginal = this.dailyMemoryTimeQuota;
      this.context.site.properties.dailyMemoryTimeQuota = 0;
      this._busyManager.clearBusy();
    });
  }

  openAppSettings() {
    this._portalService.openFrameBlade(
      {
        detailBlade: 'SiteConfigSettingsFrameBladeReact',
        detailBladeInputs: {
          id: this.context.site.id,
        },
      },
      'function-runtime'
    );
  }

  keyDown(event: any, command: string) {
    if (AccessibilityHelper.isEnterOrSpace(event)) {
      switch (command) {
        case 'openAppSettings': {
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

    if (version === '~1' && appSettings.properties[Constants.functionsWorkerRuntimeAppSettingsName]) {
      delete appSettings.properties[Constants.functionsWorkerRuntimeAppSettingsName];
    }

    if (version === '~2') {
      appSettings.properties[Constants.nodeVersionAppSettingName] = Constants.nodeVersionV2;
    } else {
      appSettings.properties[Constants.nodeVersionAppSettingName] = Constants.nodeVersion;
    }

    return this._siteService.updateAppSettings(this.context.site.id, appSettings);
  }

  private _updateProxiesVersion(appSettings: ArmObj<any>) {
    if (appSettings.properties[Constants.routingExtensionVersionAppSettingName]) {
      delete appSettings.properties[Constants.routingExtensionVersionAppSettingName];
    }

    return this._cacheService.putArm(appSettings.id, this._armService.antaresApiVersion20181101, appSettings);
  }

  private _updateDailyMemory(site: ArmObj<Site>, value: number) {
    const body = JSON.stringify({
      Location: site.location,
      Properties: {
        dailyMemoryTimeQuota: value,
        enabled: true,
      },
    });

    return this._cacheService.putArm(site.id, this._armService.antaresApiVersion20181101, body);
  }

  private _updateMemorySize(site: ArmObj<Site>, memorySize: string | number) {
    const nMemorySize = typeof memorySize === 'string' ? parseInt(memorySize, 10) : memorySize;
    site.properties.containerSize = nMemorySize;

    return this._cacheService.putArm(site.id, this._armService.antaresApiVersion20181101, site).map(r => <ArmObj<Site>>r.json());
  }

  public get GlobalDisabled() {
    return this._globalStateService.GlobalDisabled;
  }

  private setNeedUpdateExtensionVersion() {
    this.needUpdateExtensionVersion = FunctionsVersionInfoHelper.needToUpdateRuntime(
      this._configService.FunctionsVersionInfo,
      this.extensionVersion
    );
    this.latestExtensionVersion = this.getLatestVersion(this.extensionVersion);
  }

  private getLatestVersion(version: string): string {
    const match = this._configService.FunctionsVersionInfo.runtimeStable.find(v => {
      return this.extensionVersion.toLowerCase() === v;
    });
    if (match) {
      return match;
    } else if (!!version) {
      if (version.startsWith('1.')) {
        return FunctionAppRuntimeSetting.tilda1;
      } else if (version.startsWith('2.')) {
        return FunctionAppRuntimeSetting.tilda2;
      } else if (version.startsWith('3.')) {
        return FunctionAppRuntimeSetting.tilda3;
      }
    }
    return this._configService.FunctionsVersionInfo.runtimeDefault;
  }

  private _validRuntimeVersion(): boolean {
    if (this.extensionVersion === this.exactExtensionVersion) {
      return true;
    } else if (this.extensionVersion === this.exactExtensionVersion.replace(/.0$/, '-alpha')) {
      return true;
    } else {
      return !!this._configService.FunctionsVersionInfo.runtimeStable.find(v => {
        return this.extensionVersion.toLowerCase() === v;
      });
    }
  }

  // Currently we will only show the V3 option when user has V3 running
  // Will update logic for V3 public preview
  private _handleV3Option() {
    if (this.extensionVersion === FunctionAppRuntimeSetting.tilda3) {
      this.functionRutimeOptions = [
        {
          displayLabel: FunctionAppRuntimeSetting.tilda1,
          value: FunctionAppRuntimeSetting.tilda1,
          disabled: this.disableRuntimeSelector,
        },
        {
          displayLabel: FunctionAppRuntimeSetting.tilda2,
          value: FunctionAppRuntimeSetting.tilda2,
        },
        {
          displayLabel: this._translateService.instant(PortalResources.version3Preview),
          value: FunctionAppRuntimeSetting.tilda3,
        },
      ];
      if (this.disableRuntimeSelector) {
        this.disableSomeVersionSwaps = true;
        this.disableRuntimeSelector = false;
      }
    }
  }
}
