import {Component, Input, EventEmitter, OnInit} from 'angular2/core';
import {ArmService} from '../services/arm.service';
import {PortalService} from '../services/portal.service';
import {FunctionContainer} from '../models/function-container';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'

@Component({
    selector: 'app-settings',
    templateUrl: 'templates/app-settings.component.html',
    styleUrls: ['styles/app-settings.style.css']
})
export class AppSettingsComponent implements OnInit {
    @Input() functionContainer: FunctionContainer;
    public memorySize: number | string;
    public dirty: boolean;

    constructor(private _armService : ArmService,
                private _portalService : PortalService,
                private _broadcastService: BroadcastService) {
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
}