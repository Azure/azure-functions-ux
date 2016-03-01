import {Component, EventEmitter} from 'angular2/core';

Component({
    selector: 'radio-selector',
    inputs: ['options', 'default'],
    outputs: ['value'],
    templateUrl: 'templates/radio-selector.component.html',
    styleUrls: ['styles/radio-selector.style.css']
})
export class RadioSelectorComponent<T> {
    public value: EventEmitter<T>;
    //private _options: DropDownElement<T>[];

    constructor() {
        this.value = new EventEmitter<T>();
    }

}