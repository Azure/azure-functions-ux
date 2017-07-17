import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'busy-state',
    templateUrl: './busy-state.component.html',
    styleUrls: ['./busy-state.component.scss']
})
export class BusyStateComponent implements OnInit {

    public busy: boolean = false;
    @Input() name: string;
    isGlobal: boolean = false;
    @Input() message: string;

    ngOnInit() {
        this.isGlobal = this.name === 'global';
    }

    setBusyState() {
        this.busy = true;
    }

    clearBusyState() {
        this.busy = false;
    }

    get isBusy(): boolean {
        return this.busy;
    }

}
