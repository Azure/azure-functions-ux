import {Component} from '@angular/core';

@Component({
    selector: 'busy-state',
    templateUrl: 'templates/busy-state.component.html',
    styleUrls: ['styles/busy-state.style.css']
})
export class BusyStateComponent {
    private busy: boolean = false;

    setBusy() {
        this.busy = true;
    }

    clearBusy() {
        this.busy = false;
    }
}