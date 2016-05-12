import {Component, OnInit, EventEmitter} from '@angular/core';
import {DropDownElement} from '../models/drop-down-element';

@Component({
    selector: 'drop-down',
    inputs: ['options', 'placeholder', 'resetOnChange', 'disabled', 'selectedValue'],
    outputs: ['value'],
    templateUrl: 'templates/drop-down.component.html',
    styleUrls: ['styles/drop-down.style.css']
})
export class DropDownComponent<T> {
    public placeholder: string;
    public empty: any;
    public disabled: boolean;
    public value: EventEmitter<T>;
    private _options: DropDownElement<T>[];
    public selectedElement: DropDownElement<T>;

    constructor() {
        this.value = new EventEmitter<T>();
    }

    set options(value: DropDownElement<T>[]) {
        this._options = [];
        for (var i = 0; i < value.length; i++) {
            this._options.push({
                id: i,
                displayLabel: value[i].displayLabel,
                value: value[i].value,
                default: value[i].default
            });
        }
        // If there is only 1, auto-select it
        if (this._options.find(d => d.default)) {
            this.onSelect(this._options.find(d => d.default).id.toString());
        } else if (this._options.length > 0) {
            this.onSelect(this._options[0].id.toString());
        } else if (this._options.length === 0) {
            delete this.selectedElement;
        }
    }

    set resetOnChange(value) {
        delete this.selectedElement;
    }

    set selectedValue(value: T) {
        if ((this.selectedElement.value !== value) && (value)) {
            this.onSelectValue(value);
        }
    }

    onSelect(id: string) {
        var element = this._options.find(e => e.id.toString() === id);
        this.selectedElement = element;
        this.value.emit(element.value);
    }

    onSelectValue(value: T) {
        var element = this._options.find(e => e.value === value);
        this.selectedElement = element;
        this.value.emit(element.value);
    }
}