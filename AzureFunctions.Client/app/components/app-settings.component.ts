import {Component, Input, EventEmitter, OnInit} from '@angular/core';
import {ArmService} from '../services/arm.service';
import {PortalService} from '../services/portal.service';
import {FunctionContainer} from '../models/function-container';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {FunctionsService} from '../services/functions.service';
import {Constants} from '../models/constants';
import {GlobalStateService} from '../services/global-state.service';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {TooltipContentComponent} from './tooltip-content.component';
import {TooltipComponent} from './tooltip.component';
import {AiService} from '../services/ai.service';

@Component({
    selector: 'app-settings',
    templateUrl: 'templates/app-settings.component.html',
    styleUrls: ['styles/app-settings.style.css'],
    pipes: [TranslatePipe],
    inputs: ['functionContainer'],
    directives: [TooltipContentComponent, TooltipComponent]
})
export class AppSettingsComponent implements OnInit {
    private _functionContainer: FunctionContainer;
    public memorySize: number | string;
    public dirty: boolean;
    public needUpdateExtensionVersion;
    public extensionVersion: string;
    public latestExtensionVersion: string;
    public debugConsole: string;
    public dailyMemoryTimeQuota: string;
    public showDailyMemoryWarning: boolean = false;
    public showDailyMemoryInfo: boolean = false;
    private showTryView: boolean;

    set functionContainer(value: FunctionContainer) {
        this.debugConsole = `https://${value.properties.hostNameSslStates.find(s => s.hostType === 1).name}/DebugConsole`;
        this.dailyMemoryTimeQuota = value.properties.dailyMemoryTimeQuota.toString();
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

    constructor(private _armService : ArmService,
                private _portalService : PortalService,
                private _broadcastService: BroadcastService,
                private _functionsService: FunctionsService,
                private _globalStateService: GlobalStateService,
                private _aiService: AiService) {
        this.showTryView = this._globalStateService.showTryView;
    }

    onChange(value: string | number, event?: any) {
        if (this.isIE()) {
            value = event.srcElement.value;
            this.memorySize = value;
        }
        this.dirty = (typeof value === 'string' ? parseInt(value) : value) !== this.functionContainer.properties.containerSize;
    }

    ngOnInit() {
        this.memorySize = this.functionContainer.properties.containerSize;
        this.needUpdateExtensionVersion = !this._globalStateService.IsLatest;
        this.extensionVersion = this._globalStateService.ExtensionVersion;
        this.latestExtensionVersion = Constants.runtimeVersion;
    }

    openBlade(name : string) {
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