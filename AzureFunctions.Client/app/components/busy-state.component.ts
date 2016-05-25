import {Component, Input} from '@angular/core';

@Component({
    selector: 'busy-state',
    templateUrl: 'templates/busy-state.component.html',
    styleUrls: ['styles/busy-state.style.css']
})
export class BusyStateComponent {
    private busy: boolean = false;
    @Input() name: string;

    setBusyState() {
        this.busy = true;
    }

    clearBusyState() {
        this.busy = false;
    }
}