import {Component, EventEmitter} from '@angular/core';
import {SelectOption} from '../models/select-option';

@Component({
    selector: 'radio-selector',
    inputs: ['options', 'defaultValue'],
    outputs: ['value'],
    templateUrl: 'templates/radio-selector.component.html',
    styleUrls: ['styles/radio-selector.style.css']
})
export class RadioSelectorComponent<T> {
    public value: EventEmitter<T>;
    public defaultValue: T;
    private _options: SelectOption<T>[];

    constructor() {
        this.value = new EventEmitter<T>();
    }

    set options(value: SelectOption<T>[]) {
        this._options = [];
        for (var i = 0; i < value.length; i++) {
            this._options.push({
                id: i,
                displayLabel: value[i].displayLabel,
                value: value[i].value
            });
        }
    }

    select(option: SelectOption<T>) {
        this.defaultValue = option.value;
        this.value.emit(option.value);
    }
}