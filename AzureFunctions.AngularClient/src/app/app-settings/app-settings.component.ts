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
import {TooltipContentComponent} from '../tooltip-content/tooltip-content.component';
import {TooltipDirective} from '../tooltip-content/tooltip.directive';
import {AiService} from '../shared/services/ai.service';
import {CacheService} from '../shared/services/cache.service';
import {ArmObj} from '../shared/models/arm/arm-obj';

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
    // public extensionVersion: string;
    public latestExtensionVersion: string;
    public debugConsole: string;
    public appServiceEditor: string;
    public dailyMemoryTimeQuota: string;
    public showDailyMemoryWarning: boolean = false;
    public showDailyMemoryInfo: boolean = false;
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

    constructor(private _armService : ArmService,
                private _portalService : PortalService,
                private _broadcastService: BroadcastService,
                private _functionsService: FunctionsService,
                private _globalStateService: GlobalStateService,
                private _cacheService : CacheService,
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
        this._globalStateService.clearBusyState();
        this.memorySize = this.functionContainer.properties.containerSize;
        // this.needUpdateExtensionVersion = !this._globalStateService.IsLatest;
        // this.extensionVersion = this._globalStateService.ExtensionVersion;
        this.latestExtensionVersion = Constants.runtimeVersion;
    }

    openBlade(name : string) {
        // this._portalService.openBlade(name, "app-settings");
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
        this._cacheService.postArm(`${this.functionContainer.id}/config/appsettings/list`, true)
        .subscribe(r =>{
            let appSettingsArm : ArmObj<any> = r.json();

            this._updateFunctionContainerVersion(this.functionContainer.id, appSettingsArm.properties).subscribe((r) => {
                this.needUpdateExtensionVersion = false;
                this._globalStateService.AppSettings = r;
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

    private _updateFunctionContainerVersion(resourceId : string, appSettings: { [key: string]: string }) {
        if (appSettings[Constants.azureJobsExtensionVersion]) {
            delete appSettings[Constants.azureJobsExtensionVersion];
        }
        appSettings[Constants.runtimeVersionAppSettingName] = Constants.runtimeVersion;
        appSettings[Constants.nodeVersionAppSettingName] = Constants.nodeVersion;

        return this._cacheService.putArm(
            `${resourceId}/config/appsettings`,
            this._armService.websiteApiVersion,
            {properties: appSettings})
            .map<{ [key: string]: string }>(r => r.json().properties);


        // var putUrl = `${this.armUrl}${functionContainer.id}/config/appsettings?api-version=${this.websiteApiVersion}`;
        // return this._http.put(putUrl, JSON.stringify({ properties: appSettings }), { headers: this.getHeaders() })
        //         .map<{ [key: string]: string }>(r => r.json().properties);
    }
}