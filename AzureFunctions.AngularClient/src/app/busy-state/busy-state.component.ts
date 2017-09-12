import { Component, Input, Output, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Guid } from './../shared/Utilities/Guid';
import { BusyStateScopeManager } from './busy-state-scope-manager';

@Component({
    selector: 'busy-state',
    templateUrl: './busy-state.component.html',
    styleUrls: ['./busy-state.component.scss']
})
export class BusyStateComponent implements OnInit {

    public busy = false;
    @Input() name: string;
    isGlobal = false;
    @Input() message: string;
    @Output() clear = new Subject<any>();

    private busyStateMap: { [key: string]: boolean } = {};
    private reservedKey = '-';

    ngOnInit() {
        this.isGlobal = this.name === 'global';
    }

    setBusyState() {
        this.setScopedBusyState(this.reservedKey);
    }

    setScopedBusyState(key: string): string {
        key = key || Guid.newGuid();
        this.busyStateMap[key] = true;
        this.busy = true;
        return key;
    }

    clearBusyState(key?: string) {
        key = key || this.reservedKey;
        if (this.busyStateMap[key]) {
            delete this.busyStateMap[key];
        }
        this.busy = !this.isEmptyMap(this.busyStateMap);
    }

    clearOverallBusyState() {
        this.busyStateMap = {};
        this.clear.next(1);
        this.busy = false;
    }

    getBusyState(): boolean {
        return this.getScopedBusyState(this.reservedKey);
    }

    getScopedBusyState(key: string): boolean {
        return !!key && !!this.busyStateMap[key];
    }

    get isBusy(): boolean {
        return this.busy;
    }

    // http://stackoverflow.com/a/20494546/3234163
    isEmptyMap(map: any): boolean {
        for (const key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    getScopeManager(): BusyStateScopeManager {
        return new BusyStateScopeManager(this);
    }

}
