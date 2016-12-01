import {Component, EventEmitter} from '@angular/core';
import {SelectOption} from '../shared/models/select-option';
@Component({
  selector: 'radio-selector',
  templateUrl: './radio-selector.component.html',
  styleUrls: ['./radio-selector.component.css'],
  inputs: ['options', 'defaultValue']
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