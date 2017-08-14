import { Subject } from 'rxjs/Subject';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, OnChanges, SimpleChanges, EventEmitter, ViewChild, Input, Output } from '@angular/core';
import { DropDownElement } from '../shared/models/drop-down-element';


@Component({
    selector: 'drop-down',
    templateUrl: './drop-down.component.html',
    styleUrls: ['./drop-down.component.scss']
})
export class DropDownComponent<T> implements OnInit, OnChanges {

    @Input() group: FormGroup;
    @Input() control: FormControl;
    @Input() name: string;
    @Input() placeholder: string;
    @Input() disabled: boolean;
    @Input() highlightDirty: boolean;

    @Output() value: EventEmitter<T>;
    @Output() blur = new Subject<any>();

    public selectedElement: DropDownElement<T>;
    public empty: any;
    public _options: DropDownElement<T>[];

    @ViewChild('selectInput') selectInput: any;

    constructor() {
        this.value = new EventEmitter<T>();
    }

    setControl() {
        if (this.group && this.name) {
            this.control = <FormControl>this.group.controls[this.name];
        }
    }

    ngOnInit() {
        this.setControl();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['group'] || changes['name']) {
            this.setControl();
        }
    }

    @Input() set options(value: DropDownElement<T>[]) {
        this._options = [];
        for (let i = 0; i < value.length; i++) {
            this._options.push({
                id: i,
                displayLabel: value[i].displayLabel,
                value: value[i].value,
                default: value[i].default
            });
        }
        // If there is only 1, auto-select it
        if (this._options.find(d => d.default)) {
            if (this.control) {
                this.onSelectValue(this._options.find(d => d.default).value);
            } else {
                this.onSelect(this._options.find(d => d.default).id.toString());
            }
        } else if (this._options.length > 0) {
            if (this.control) {
                this.onSelectValue(this._options[0].value);
            } else {
                this.onSelect(this._options[0].id.toString());
            }
        } else if (this._options.length === 0) {
            delete this.selectedElement;
        }
    }

    @Input() set resetOnChange(_) {
        delete this.selectedElement;
    }

    @Input() set selectedValue(value: T) {
        if ((this.selectedElement.value !== value) && (value)) {
            this.onSelectValue(value);
        }
    }

    onSelect(id: string) {
        const element = this._options.find(e => e.id.toString() === id);
        this.selectedElement = element;
        this.value.emit(element.value);
    }

    onSelectValue(value: T) {
        const element = this._options.find(e => e.value === value);
        this.selectedElement = element;
        this.value.emit(element.value);
    }

    onBlur(event: any) {
        this.blur.next(event);
    }

    focus() {
        if (this.selectInput) {
            setTimeout(() => {
                this.selectInput.nativeElement.focus();
            });
        }
    }
}
