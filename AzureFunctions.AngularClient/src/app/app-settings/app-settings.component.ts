import {Component, Input, EventEmitter, OnInit} from '@angular/core';
import {ArmService} from '../shared/services/arm.service';
import {PortalService} from '../shared/services/portal.service';
import {FunctionContainer} from '../shared/models/function-container';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {FunctionsService} from '../shared/services/functions.service';
import {Constants} from '../shared/models/constants';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {AiService} from '../shared/services/ai.service';
import {SelectOption} from '../shared/models/select-option';
import {Subject} from 'rxjs/Rx';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.css'],
  inputs: ['functionContainer']
})
export class AppSettingsComponent implements OnInit {
    private _functionContainer: FunctionContainer;
    public memorySize: number | string;
    public dirty: boolean;
    public needUpdateExtensionVersion;
    public extensionVersion: string;
    public latestExtensionVersion: string;
    public debugConsole: string;
    public appServiceEditor: string;
    public dailyMemoryTimeQuota: string;
    public showDailyMemoryWarning: boolean = false;
    public showDailyMemoryInfo: boolean = false;

    public functionStatusOptions: SelectOption<boolean>[];
    public disabled: boolean;
    public needUpdateRoutingExtensionVersion: boolean;
    public routingExtensionVersion: string;
    public latestRoutingExtensionVersion: string;
    public apiProxiesEnabled: boolean;
    private valueChange: Subject<boolean>;

    private showTryView: boolean;

    set functionContainer(value: FunctionContainer) {
        this.debugConsole = `https://${value.properties.hostNameSslStates.find(s => s.hostType === 1).name}/DebugConsole`;
        this.appServiceEditor = `https://${value.properties.hostNameSslStates.find(s => s.hostType === 1).name}/dev`;

        this.dailyMemoryTimeQuota = value.properties.dailyMemoryTimeQuota ? value.properties.dailyMemoryTimeQuota.toString() : "0";
        if (this.dailyMemoryTimeQuota === "0") {
            this.dailyMemoryTimeQuota = "";
        } else {
            this.showDailyMemoryInfo = true;
        }
        this.showDailyMemoryWarning = (!value.properties.enabled && value.properties.siteDisabledReason === 1);

        this._functionContainer = value;
    }

    get functionContainer() {
        return this._functionContainer;
    }

    constructor(private _armService: ArmService,
        private _portalService: PortalService,
        private _broadcastService: BroadcastService,
        private _functionsService: FunctionsService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _aiService: AiService) {
        this.showTryView = this._globalStateService.showTryView;

        this.functionStatusOptions = [
            {
                displayLabel: this._translateService.instant(PortalResources.off),
                value: false
            }, {
                displayLabel: this._translateService.instant(PortalResources.on),
                value: true
            }];

        this.valueChange = new Subject<boolean>();
        this.valueChange.subscribe((value: boolean) => {
            this._globalStateService.setBusyState();
            var appSettingValue: string = value ? Constants.routingExtensionVersion : Constants.disabled;
            this._armService.getFunctionContainerAppSettings(this.functionContainer).subscribe((appSettings) => {
                this._armService.updateApiProxiesVesrion(this.functionContainer, appSettings, appSettingValue).subscribe((r) => {
                    //this._armService.syncTriggers(this.functionContainer).subscribe(() => {
                        this._globalStateService.AppSettings = r;
                        this._globalStateService.clearBusyState();
                        this.apiProxiesEnabled = value;
                    //});
                });
            });
        });

    }

    onChange(value: string | number, event?: any) {
        if (this.isIE()) {
            value = event.srcElement.value;
            this.memorySize = value;
        }
        this.dirty = (typeof value === 'string' ? parseInt(value) : value) !== this.functionContainer.properties.containerSize;
    }

    ngOnInit() {
        this._globalStateService.clearBusyState();
        this.memorySize = this.functionContainer.properties.containerSize;
        this.needUpdateExtensionVersion = !this._globalStateService.IsLatest;
        this.extensionVersion = this._globalStateService.ExtensionVersion;
        this.latestExtensionVersion = Constants.runtimeVersion;

        this._globalStateService.clearBusyState();
        this.needUpdateRoutingExtensionVersion = !this._globalStateService.IsLatestRoutingVersion;
        this.routingExtensionVersion = this._globalStateService.RoutingExtensionVersion;
        this.latestRoutingExtensionVersion = Constants.routingExtensionVersion;

        this.apiProxiesEnabled = ((this.routingExtensionVersion) && (this.routingExtensionVersion !== Constants.disabled));
    }

    openBlade(name: string) {
        this._portalService.openBlade(name, "app-settings");
        this._aiService.trackEvent(`/actions/app_settings/open_${name}_blade`);
    }

    openNewTab(url: string) {
        var win = window.open(url, '_blank');
        win.focus();
        this._aiService.trackEvent(`/actions/app_settings/open_url`);
    }

    saveMemorySize(value: string | number) {
        this._globalStateService.setBusyState();
        this._armService.updateMemorySize(this.functionContainer, value)
            .subscribe(r => { this._globalStateService.clearBusyState(); Object.assign(this.functionContainer, r); this.dirty = false; });
    }

    isIE(): boolean {
        return navigator.userAgent.toLocaleLowerCase().indexOf("trident") !== -1;
    }

    updateVersion() {
        this._aiService.trackEvent('/actions/app_settings/update_version');
        this._globalStateService.setBusyState();
        this._armService.getFunctionContainerAppSettings(this.functionContainer).subscribe((appSettings) => {
            this._armService.updateFunctionContainerVersion(this.functionContainer, appSettings).subscribe((r) => {
                this.needUpdateExtensionVersion = false;
                this._globalStateService.AppSettings = r;
                this._functionsService.getResources().subscribe(() => {
                    this._globalStateService.clearBusyState();
                    this._broadcastService.broadcast(BroadcastEvent.VersionUpdated);
                });
            });
        });
    }

    updateRouingExtensionVersion() {
        this._aiService.trackEvent('/actions/app_settings/update_routing_version');
        this._globalStateService.setBusyState();
        
        this._armService.getFunctionContainerAppSettings(this.functionContainer).subscribe((appSettings) => {
            this._armService.updateApiProxiesVesrion(this.functionContainer, appSettings, Constants.routingExtensionVersion).subscribe((r) => {
                //this._armService.syncTriggers(this.functionContainer).subscribe(() => {
                this.needUpdateRoutingExtensionVersion = false;
                this._globalStateService.AppSettings = r;
                this._globalStateService.clearBusyState();
                //});
            });
        });
    }

    setQuota() {
        var dailyMemoryTimeQuota = +this.dailyMemoryTimeQuota;

        if (dailyMemoryTimeQuota > 0) {
            this._globalStateService.setBusyState();
            this._armService.dailyMemory(this._functionContainer, dailyMemoryTimeQuota).subscribe(() => {
                this.showDailyMemoryInfo = true;
                this._functionContainer.properties.dailyMemoryTimeQuota = dailyMemoryTimeQuota;
                this._globalStateService.clearBusyState();
            });
        }
    }

    removeQuota() {
        this._globalStateService.setBusyState();
        this._armService.dailyMemory(this._functionContainer, 0).subscribe(() => {
            this.showDailyMemoryInfo = false;
            this.showDailyMemoryWarning = false;
            this.dailyMemoryTimeQuota = "";
            this._functionContainer.properties.dailyMemoryTimeQuota = 0;
            this._globalStateService.clearBusyState();
        });
    }
}
