import { KeyCodes } from './../shared/models/constants';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  AfterViewInit,
  SimpleChanges,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../shared/models/select-option';
import { Guid } from '../shared/Utilities/Guid';

@Component({
  selector: 'radio-selector',
  templateUrl: './radio-selector.component.html',
  styleUrls: ['./radio-selector.component.scss'],
})
export class RadioSelectorComponent<T> implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('radioGroup')
  radioGroup: ElementRef;
  selectedValue: T = null;
  @Input()
  control: FormControl;
  @Input()
  group: FormGroup;
  @Input()
  name: string;
  @Input()
  options: SelectOption<T>[];
  @Input()
  disabled: boolean;
  @Input()
  highlightDirty: boolean;
  @Input()
  size: null | 'small' | 'medium' = 'medium';
  @Input()
  defaultValue: T;
  @Input()
  focusOnLoad: boolean;
  @Input()
  id: string;
  @Input()
  ariaLabel = '';
  @Output()
  value: Subject<T>;

  public activeDescendantId: string;

  private _initialized: boolean = false;
  private _originalValue: T = null;

  constructor() {
    this.value = new EventEmitter<T>();
    this.id = Guid.newGuid();
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

  ngAfterViewInit() {
    if (this.focusOnLoad) {
      this.radioGroup.nativeElement.focus();
    }
  }

  ngOnInit() {
    this._initialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    // If control and defaultValue are modified at the same time, the value of defaultValue will be used.
    // If only one input is modifed, the value of that input will be used.

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

    if (changes['options'] && !!this.options) {
      for (let i = 0; i < this.options.length; i++) {
        this.options[i].id = i;
      }
    }

    if (valueChanged || changes['options']) {
      const activeOptionIndex = this._getActiveOptionIndex();
      this.activeDescendantId = activeOptionIndex === null || activeOptionIndex === undefined ? null : `${this.id}-${activeOptionIndex}`;
    }
  }

  private _getActiveOptionIndex(): number {
    if (this.selectedValue === undefined || !this.options) {
      return null;
    }

    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].value === this.selectedValue) {
        return i;
      }
    }

    return null;
  }

  private _selectAdjacent(direction: 'forward' | 'reverse') {
    if (!this.options || this.options.length === 0) {
      return;
    }

    let newIndex = 0;

    const activeOptionIndex = this._getActiveOptionIndex();
    if (activeOptionIndex !== null && activeOptionIndex >= 0) {
      if (direction === 'forward') {
        newIndex = activeOptionIndex === this.options.length - 1 ? 0 : activeOptionIndex + 1;
      } else {
        newIndex = activeOptionIndex === 0 ? this.options.length - 1 : activeOptionIndex - 1;
      }
    } else {
      newIndex = direction === 'forward' ? 0 : this.options.length - 1;
    }

    this.select(this.options[newIndex]);
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.control ? !this.control.disabled : !this.disabled) {
      if (event.keyCode === KeyCodes.arrowLeft || event.keyCode === KeyCodes.arrowUp) {
        this._selectAdjacent('reverse');
        event.preventDefault();
      } else if (event.keyCode === KeyCodes.arrowRight || event.keyCode === KeyCodes.arrowDown) {
        this._selectAdjacent('forward');
        event.preventDefault();
      }
    }
  }

  select(option: SelectOption<T>) {
    if ((this.control ? !this.control.disabled : !this.disabled) && !option.disabled) {
      this._setControlValue(option.value);
      this.selectedValue = option.value;
      this.value.next(option.value);
      this.activeDescendantId = `${this.id}-${option.id}`;
    }
  }
}
