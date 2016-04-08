import {Component, OnInit, EventEmitter, Input, Output} from 'angular2/core';
import {DropDownElement} from '../models/drop-down-element';

@Component({
    selector: 'pop-over',
    templateUrl: 'templates/pop-over.component.html',
    styleUrls: ['styles/pop-over.style.css']
})

export class PopOverComponent{
    @Input() public message : string;
    @Input() hideAfter: number;
    public show : boolean;
    @Output() public clicked: EventEmitter<any>;

    constructor() {
        this.clicked = new EventEmitter<any>();
    }

    onBlur(event: any) {
        this.show = false;

        if (event.relatedTarget) {
            window.open(
                event.relatedTarget.toString(),
                '_blank' // <- This is what makes it open in a new window.
            );
        }
    }

    handleClick() {
        this.clicked.emit(0);
        if (this.hideAfter) {
            setTimeout(() => {
                this.show = false;
            }, this.hideAfter);
        }
    }
}