import { KeyCodes } from './../../../shared/models/constants';
import { Component, Input, Output } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'command',
    templateUrl: './command.component.html',
    styleUrls: ['./command.component.scss']
})
export class CommandComponent {
    @Input() displayText: string;
    @Input() iconUrl: string;
    @Input() disabled = false;
    @Output() click = new Subject<any>();

    constructor() { }

    onClick(event: any) {
        if (!this.disabled) {
            this.click.next(event);
        }

        event.stopPropagation();
    }

    onKeyPress(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.enter) {
            this.click.next(event);
        }
    }

}
