import {Component, Input, EventEmitter, OnInit} from '@angular/core';
import {ArmService} from '../services/arm.service';
import {PortalService} from '../services/portal.service';
import {FunctionContainer} from '../models/function-container';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {FunctionsService} from '../services/functions.service';
import {Constants} from '../models/constants';

@Component({
    selector: 'app-settings',
    templateUrl: 'templates/app-settings.component.html',
    styleUrls: ['styles/app-settings.style.css']
})
export class AppSettingsComponent implements OnInit {
    @Input() functionContainer: FunctionContainer;
    public memorySize: number | string;
    public dirty: boolean;
    public needUpdateExtensionVersion;
    public extensionVersion: string;
    public latestExtensionVersion: string;

    constructor(private _armService : ArmService,
                private _portalService : PortalService,
                private _broadcastService: BroadcastService,
                private _functionsService: FunctionsService) {
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
        this.needUpdateExtensionVersion = Constants.latestExtensionVersion !== this._functionsService.extensionVersion;
        this.extensionVersion = this._functionsService.extensionVersion;
        this.latestExtensionVersion = Constants.latestExtensionVersion;
    }

    openBlade(name : string) {
        this._portalService.openBlade(name, "app-settings");
    }

    saveMemorySize(value: string | number) {
        this._broadcastService.setBusyState();
        this._armService.updateMemorySize(this.functionContainer, value)
            .subscribe(r => { this._broadcastService.clearBusyState(); Object.assign(this.functionContainer, r); this.dirty = false; });
    }

    isIE(): boolean {
        return navigator.userAgent.toLocaleLowerCase().indexOf("trident") !== -1;
    }

    updateVersion() {
        this._broadcastService.setBusyState();
        this._armService.getFunctionContainerAppSettings(this.functionContainer).subscribe((appSettings) => {
            this._armService.updateFunctionContainerVersion(this.functionContainer, appSettings).subscribe((r) => {
                this.needUpdateExtensionVersion = false;              
                this._functionsService.extensionVersion = Constants.latestExtensionVersion;
                this._broadcastService.clearBusyState();
                this._broadcastService.broadcast(BroadcastEvent.VesrionUpdated);
            });
        });
    }
}