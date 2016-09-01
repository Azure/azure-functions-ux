import {Component, Input, OnInit} from '@angular/core';
import {TryNowBusyStateComponent} from './try-now-busy-state.component';

@Component({
    selector: 'busy-state',
    templateUrl: 'templates/busy-state.component.html',
    styleUrls: ['styles/busy-state.style.css'],
    directives: [TryNowBusyStateComponent]
})
export class BusyStateComponent implements OnInit {
    private busy: boolean = false;
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