import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../shared/models/select-option';

@Component({
  selector: 'radio-selector',
  templateUrl: './radio-selector.component.html',
  styleUrls: ['./radio-selector.component.scss'],
})
export class RadioSelectorComponent<T> {
    @Input() options: SelectOption<T>[];
    @Input() disabled: boolean;
    @Input() public defaultValue: T;
    @Output() public value: Subject<T>;

    constructor() {
        this.value = new EventEmitter<T>();
    }

    select(option: SelectOption<T>) {
        if (!this.disabled) {
            this.defaultValue = option.value;
            this.value.next(option.value);
        }
    }
}
