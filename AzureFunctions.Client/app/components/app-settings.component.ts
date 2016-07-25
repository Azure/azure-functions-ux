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

@Component({
    selector: 'app-settings',
    templateUrl: 'templates/app-settings.component.html',
    styleUrls: ['styles/app-settings.style.css'],
    pipes: [TranslatePipe]
})
export class AppSettingsComponent implements OnInit {
    @Input() functionContainer: FunctionContainer;
    public memorySize: number | string;
    public dirty: boolean;
    public needUpdateExtensionVersion;
    public extensionVersion: string;
    public latestExtensionVersion: string;
    private showTryView: boolean;

    constructor(private _armService : ArmService,
                private _portalService : PortalService,
                private _broadcastService: BroadcastService,
                private _functionsService: FunctionsService,
                private _globalStateService: GlobalStateService) {
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
        this.latestExtensionVersion = Constants.latestExtensionVersion;
    }

    openBlade(name : string) {
        this._portalService.openBlade(name, "app-settings");
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
}