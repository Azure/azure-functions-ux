import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'busy-state',
    templateUrl: 'templates/busy-state.component.html',
    styleUrls: ['styles/busy-state.style.css']
})
export class BusyStateComponent implements OnInit {
    private busy: boolean = false;
    @Input() name: string;
    isGlobal: boolean = false;

    ngOnInit() {
        this.isGlobal = this.name === 'global';
    }

    setBusyState() {
        this.busy = true;
    }

    clearBusyState() {
        this.busy = false;
    }
}