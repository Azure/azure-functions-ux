import { Component, EventEmitter, Input, Output, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../shared/models/select-option';

@Component({
  selector: 'radio-selector',
  templateUrl: './radio-selector.component.html',
  styleUrls: ['./radio-selector.component.scss'],
})
export class RadioSelectorComponent<T> implements /*OnInit,*/ OnChanges{
    private _isFirstChange: boolean = true;
    @Input() control : FormControl;
    @Input() group : FormGroup;
    @Input() name : string;
    @Input() options: SelectOption<T>[];
    @Input() disabled: boolean;
    @Input() highlightDirty: boolean;
    @Input() public defaultValue: T;
    @Output() public value: Subject<T>;


    constructor() {
        this.value = new EventEmitter<T>();
    }


    private _setControl() {
        if(this.group && this.name) {
            this.control = <FormControl>this.group.controls[this.name];
        }
    }

    private _setControlValue(value : T, markDirtyIfChanged?: boolean) {
        if(this.control) {
            if(markDirtyIfChanged && this.control.value !== value) {
                this.control.markAsDirty();
            }
            this.control.setValue(value);
        }
    }

    private _setControlDisabled(disabled : boolean) {
        if(this.control) {
            if(disabled) {
                this.control.disable();
            }
            else {
                this.control.enable();
            }
        }
    }

    /*
    private _syncForm(controlUpdated: boolean, groupInfoUpdated: boolean, defaultValueUpdated: boolean, disabedUpdated: boolean) {
        if(!controlUpdated && groupInfoUpdated) {
            this._setControl();
            controlUpdated = true;
        }

        let emitValue = false;
        if(defaultValueUpdated) {
            this._setControlValue(this.defaultValue);
            emitValue = true;
        }
        else if(controlUpdated) {
            this.defaultValue = this.control ? this.control.value : null;
            emitValue = true;
        }
        
        if(emitValue === true) {
            if(this.defaultValue === undefined || this.defaultValue === null) {
                this.value.next();
            }
            else {
                this.value.next(this.defaultValue);
            }
        }

        if(disabedUpdated) {
            this._setControlDisabled(this.disabled);
        }
        else if(controlUpdated) {
            this.disabled = this.control ? this.control.disabled : false;
        }

        //ctrl && defaultValue => ctrl.setValue(defaultValue) //DON'T MARK DIRTY?

        //(ctrl) && (defaultValue) => ctrl.setValue(defaultValue) //DON'T MARK DIRTY?
        //[ctrl] && (defaultValue) => ctrl.setValue(defaultValue) //MARK DIRTY?
        //(ctrl) && [defaultValue] => defaultValue = ctrl.value
    }
    */

    /*
    ngOnInit() {
        this._syncForm(
            !!this.control,
            !!this.group && !!this.name,
            !(this.defaultValue === undefined),
            !(this.disabled === undefined)
        );
    }
    */

    /*
    ngOnInit() {    
        let controlPresent = !!this.control;
        if(!controlPresent && (this.group && this.name)) {
            this._setControl();
            controlPresent = true;
        }

        if(this.defaultValue) {
            this._setControlValue(this.defaultValue);
        }
        else if(controlPresent) {
            this.defaultValue = this.control.value;
        }
    }
    */

    /*
    ngOnChanges(changes: SimpleChanges) {
        this._syncForm(
            !!changes['control'],
            !!changes['group'] || !!changes['name'],
            !!changes['defaultValue'],
            !!changes['disabled']
        );
    }
    */

    ngOnChanges(changes: SimpleChanges) {
        let formControlChanged = !!changes['control'];
        if(!formControlChanged || !this.control) {
            if(!!changes['group'] || !!changes['name']) {
                this._setControl();
                formControlChanged = true;
            }
        }

        let emitValue = false;
        if(changes['defaultValue'] && formControlChanged) {
            let defaultValueHasValue = this.defaultValue !== undefined && this.defaultValue !== null;
            let formControlHasValue = this.control && this.control.value !== undefined && this.control.value !== null;
            if(defaultValueHasValue) {
                this._setControlValue(this.defaultValue);
            }
            else if(formControlHasValue) {
                this.defaultValue = this.control.value;
            }
            emitValue = true;
        }
        else if(changes['defaultValue']) {
            this._setControlValue(this.defaultValue);
            emitValue = true;
        }
        else if(formControlChanged) {
            this.defaultValue = this.control ? this.control.value : this.defaultValue;
            emitValue = true;
        }

        if(emitValue && !this._isFirstChange) {
            this._setControlValue(this.defaultValue);
        }


        if(changes['disabled'] && formControlChanged) {
            if(this.disabled !== undefined || this.disabled === null) {
                this._setControlDisabled(this.disabled);
            }
            else {
                this.disabled = this.control ? this.control.disabled : this.disabled;
            }
        }
        else if(changes['disabled']) {
            this._setControlDisabled(this.disabled);
        }
        else if(formControlChanged) {
            this.disabled = this.control ? this.control.disabled : this.disabled;
        }

        this._isFirstChange = false;
    }

/*
    ngOnChanges(changes: SimpleChanges) {
        let controlChanged = !!changes['control'];
        if (!controlChanged && (changes['group'] || changes['name'])) {
            this._setControl();
            controlChanged = true;
        }

        if(changes['defaultValue']) {
            this._setControlValue(this.defaultValue);
        }
        else if(controlChanged){
            this.defaultValue = this.control.value;
        }

        if(changes['disabled']){

        }
    }
*/

    select(option: SelectOption<T>) {
        if (!this.disabled) {
            this._setControlValue(option.value, true);
            this.defaultValue = option.value;
            this.value.next(option.value);
        }
    }
}
