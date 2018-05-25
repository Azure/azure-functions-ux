import { NotificationIds, SiteTabIds, Constants, LogCategories } from './../../shared/models/constants';
import { LogService } from './../../shared/services/log.service';
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
import { BroadcastEvent } from '../../shared/models/broadcast-event';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { AiService } from '../../shared/services/ai.service';
import { SelectOption } from '../../shared/models/select-option';
import { PortalResources } from '../../shared/models/portal-resources';
import { SlotsService } from '../../shared/services/slots.service';
import { HostStatus } from './../../shared/models/host-status';
import { FunctionsVersionInfoHelper } from './../../shared/models/functions-version-info';
import { AccessibilityHelper } from './../../shared/Utilities/accessibility-helper';
import { ArmUtil } from './../../shared/Utilities/arm-utils';
import { LanguageService } from '../../shared/services/language.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { Subscription } from 'rxjs/Subscription';


@Component({
    selector: 'function-runtime',
    templateUrl: './function-runtime.component.html',
    styleUrls: ['./function-runtime.component.scss']
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

    private _appNode: AppNode;

    public functionAppEditMode = true;
    public functionAppEditModeOptions: SelectOption<boolean>[];

    private _isSlotApp = false;
    public slotsStatusOptions: SelectOption<boolean>[];
    public slotsAppSetting: string;
    public slotsEnabled: boolean;
    public slotsValueChange: Subject<boolean>;
    private _busyManager: BusyStateScopeManager;

    constructor(
        private _armService: ArmService,
        private _cacheService: CacheService,
        broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _aiService: AiService,
        private _translateService: TranslateService,
        private _slotsService: SlotsService,
        private _configService: ConfigService,
        private _functionAppService: FunctionAppService,
        private _logService: LogService,
        private _languageService: LanguageService) {
        super('function-runtime', _functionAppService, broadcastService, () => this._busyManager.setBusy());

        this._busyManager = new BusyStateScopeManager(broadcastService, SiteTabIds.functionRuntime);

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

                    this._cacheService.postArm(`${this.context.site.id}/config/appsettings/list`, true)
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
                return this._cacheService.postArm(`${this.context.site.id}/config/appsettings/list`, true)
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
                this.showComponentError({
                    message: this._translateService.instant(PortalResources.error_unableToUpdateFunctionAppEditMode),
                    errorId: errorIds.unableToUpdateFunctionAppEditMode,
                    resourceId: this.context.site.id
                });
            })
            .retry()
            // This is needed to update the editMode value for other subscribers
            // getFunctionAppEditMode returns a subject and updates it on demand.
            .mergeMap(_ => this._functionAppService.getFunctionAppEditMode(this.context))
            .subscribe(() => {

                this._aiService.stopTrace('/timings/site/tab/function-runtime/full-ready',
                    this.viewInfo.data.siteTabFullReadyTraceKey);

                this._busyManager.clearBusy();
            });

        this.slotsValueChange = new Subject<boolean>();
        this.slotsValueChange
            .filter(value => value !== this.slotsEnabled)
            .subscribe((value: boolean) => {
                this._busyManager.setBusy();
                const slotsSettingsValue: string = value ? Constants.slotsSecretStorageSettingsValue : Constants.disabled;
                this._cacheService.postArm(`${this.context.site.id}/config/appsettings/list`, true)
                    .mergeMap(r => {
                        return this._slotsService.setStatusOfSlotOptIn(r.json(), slotsSettingsValue);
                    })
                    .do(null, e => {
                        this._busyManager.clearBusy();
                        this._logService.error(LogCategories.functionAppSettings, '/save-slot-change', e);
                    })
                    .retry()
                    .subscribe(() => {
                        this._functionAppService.fireSyncTrigger(this.context);
                        this.slotsEnabled = value;
                        this._busyManager.clearBusy();
                        this._cacheService.clearArmIdCachePrefix(this.context.site.id);
                    });
            });

        this.functionRuntimeValueStream = new Subject<string>();
        this.functionRuntimeValueStream.subscribe((value: string) => {
            this.updateVersion(value);
        });
    }

    setup(): Subscription {
        return this.viewInfoEvents
            .switchMap(viewInfo => {
                this._appNode = (<AppNode>viewInfo.node);
                this.isStopped = this.context.site.properties.state.toLocaleLowerCase() !== 'Running'.toLocaleLowerCase();
                this.isLinuxApp = ArmUtil.isLinuxApp(this.context.site);

                return Observable.forkJoin(
                    this._cacheService.postArm(`${this.viewInfo.resourceId}/config/appsettings/list`, true),
                    this._functionAppService.getSlotsList(this.context),
                    this._functionAppService.getFunctionAppEditMode(this.context),
                    this._functionAppService.getFunctionHostStatus(this.context),
                    this._functionAppService.getFunctions(this.context));
            })
            .do(() => this._busyManager.clearBusy())
            .subscribe(tuple => {
                // Assume true if there was an error.
                this.hasFunctions = tuple[4].isSuccessful ? tuple[4].result.length > 0 : true;

                const appSettings: ArmObj<any> = tuple[0].json();
                this.exactExtensionVersion = tuple[3].isSuccessful ? tuple[3].result.version : '';
                this._isSlotApp = this._functionAppService.isSlot(this.context);
                this.dailyMemoryTimeQuota = this.context.site.properties.dailyMemoryTimeQuota
                    ? this.context.site.properties.dailyMemoryTimeQuota.toString()
                    : '0';

                if (this.dailyMemoryTimeQuota === '0') {
                    this.dailyMemoryTimeQuota = '';
                } else {
                    this.showDailyMemoryInfo = true;
                }

                this.dailyMemoryTimeQuotaOriginal = this.dailyMemoryTimeQuota;

                this.showDailyMemoryWarning = (!this.context.site.properties.enabled && this.context.site.properties.siteDisabledReason === 1);

                this.memorySize = this.context.site.properties.containerSize;
                this.extensionVersion = appSettings.properties[Constants.runtimeVersionAppSettingName];

                if (!this.extensionVersion) {
                    this.extensionVersion = Constants.latest;
                }

                const match = this._configService.FunctionsVersionInfo.runtimeStable.find(v => {
                    return this.extensionVersion.toLowerCase() === v;
                });

                if (!match) {
                    this.badRuntimeVersion = true;
                }

                this.setNeedUpdateExtensionVersion();

                this.showProxyEnable = appSettings.properties[Constants.routingExtensionVersionAppSettingName]
                    ? appSettings.properties[Constants.routingExtensionVersionAppSettingName].toLocaleLowerCase() === Constants.disabled.toLocaleLowerCase()
                    : false;

                if (tuple[2].isSuccessful && EditModeHelper.isReadOnly(tuple[2].result)) {
                    this.functionAppEditMode = false;
                } else {
                    this.functionAppEditMode = true;
                }
                this._busyManager.clearBusy();
                this._aiService.stopTrace('/timings/site/tab/function-runtime/revealed', this.viewInfo.data.siteTabRevealedTraceKey);

                // settings for enabling slots, display if there are no slots && appSetting property for slot is set
                this.slotsAppSetting = appSettings.properties[Constants.slotsSecretStorageSettingsName];
                if (this._isSlotApp) { // Slots Node
                    this.slotsEnabled = true;
                } else {
                    this.slotsEnabled = tuple[1].isSuccessful && tuple[1].result.length > 0 || this.slotsAppSetting === Constants.slotsSecretStorageSettingsValue;
                }
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
        this._updateMemorySize(this.context.site, value)
            .subscribe(r => { this._busyManager.clearBusy(); Object.assign(this.context.site, r); this.dirty = false; });
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
        this._cacheService.postArm(`${this.context.site.id}/config/appsettings/list`, true)
            .mergeMap(r => {
                return this._updateContainerVersion(r.json(), version);
            })
            .mergeMap(r => {
                return this._functionAppService.getFunctionHostStatus(this.context)
                    .map(hostStatus => {
                        if (!hostStatus.isSuccessful || !hostStatus.result.version || (hostStatus.result.version === this.exactExtensionVersion && !updateButtonClicked)) {
                            throw Observable.throw('Host version is not updated yet');
                        }
                        return hostStatus.result;
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
                this._updateDailyMemory(this.context.site, dailyMemoryTimeQuota).subscribe((r) => {
                    const site = r.json();
                    this.showDailyMemoryWarning = (!site.properties.enabled && site.properties.siteDisabledReason === 1);
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
