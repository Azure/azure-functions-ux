import {Component, EventEmitter} from 'angular2/core';
import {DropDownElement} from '../models/drop-down-element';

@Component({
    selector: 'drop-down',
    inputs: ['options', 'placeholder'],
    outputs: ['value'],
    templateUrl: 'templates/drop-down.html'
})
export class DropDownComponent<T> {
    public options: DropDownElement<T>[];
    public placeholder: string;
    public value: EventEmitter<T>;
    public selectedValue: DropDownElement<T>;

    constructor() {
        this.value = new EventEmitter<T>();
    }

    onSelect(value: DropDownElement<T>) {
        this.value.emit(value.value);
    }
}