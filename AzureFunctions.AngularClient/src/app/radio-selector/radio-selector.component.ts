import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../shared/models/select-option';

@Component({
    selector: 'radio-selector',
    templateUrl: './radio-selector.component.html',
    styleUrls: ['./radio-selector.component.scss'],
})
export class RadioSelectorComponent<T> implements OnInit, OnChanges {
    selectedValue: T = null;
    @Input() control: FormControl;
    @Input() group: FormGroup;
    @Input() name: string;
    @Input() options: SelectOption<T>[];
    @Input() disabled: boolean;
    @Input() highlightDirty: boolean;
    @Input() defaultValue: T;
    @Output() value: Subject<T>;

    private _initialized: boolean = false;
    private _originalValue: T = null;

    constructor() {
        this.value = new EventEmitter<T>();
    }

    private _setControlValue(value: T) {
        if (this.control) {

            if (value !== this._originalValue) {
                this.control.markAsDirty();
            } else {
                this.control.markAsPristine();
            }

            this.control.setValue(value);
        }
    }

    ngOnInit() {
        this._initialized = true;
    }

    ngOnChanges(changes: SimpleChanges) {
        //If control and defaultValue are modified at the same time, the value of defaultValue will be used.
        //If only one input is modifed, the value of that input will be used.

        let value = null;
        let valueChanged = false;

        if (this.group && this.name) {
            this.control = <FormControl>this.group.controls[this.name];
            this._originalValue = this.control.value;
        }

        if (changes['control']) {
            value = this.control ? this.control.value : null;
            valueChanged = true;
            this._originalValue = value;
        }

        if (changes['defaultValue']) {
            value = this.defaultValue;
            valueChanged = true;
        }

        if (valueChanged) {
            this.selectedValue = value;
            if (this._initialized) {
                this.value.next(value);
            }
        }
    }

    select(option: SelectOption<T>) {
        if (this.control ? !this.control.disabled : !this.disabled) {
            this._setControlValue(option.value);
            this.selectedValue = option.value;
            this.value.next(option.value);
        }
    }
}
