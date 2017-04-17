import { Subject } from 'rxjs/Rx';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {SelectOption} from '../shared/models/select-option';
@Component({
  selector: 'radio-selector',
  templateUrl: './radio-selector.component.html',
  styleUrls: ['./radio-selector.component.scss'],
})
export class RadioSelectorComponent<T> {
    @Input() disabled: boolean;
    @Input() public defaultValue: T;
    @Output() public value: Subject<T>;
    private _options: SelectOption<T>[];

    constructor() {
        this.value = new EventEmitter<T>();
    }

    @Input('options') set options(value: SelectOption<T>[]) {
        this._options = [];
        for (let i = 0; i < value.length; i++) {
            this._options.push({
                id: this.getRandomInt(),
                displayLabel: value[i].displayLabel,
                value: value[i].value
            });
        }
    }

    select(option: SelectOption<T>) {
        if (!this.disabled) {
            this.defaultValue = option.value;
            this.value.next(option.value);
        }
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    getRandomInt() {
        let min = 1, max = 10000;
       return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
