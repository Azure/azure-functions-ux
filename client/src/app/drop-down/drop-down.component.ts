import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, OnChanges, SimpleChanges, EventEmitter, ViewChild, Input, Output } from '@angular/core';
import { DropDownElement, DropDownGroupElement } from '../shared/models/drop-down-element';

@Component({
  selector: 'drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.scss'],
})
export class DropDownComponent<T> implements OnInit, OnChanges {
  @Input()
  group: FormGroup;
  @Input()
  control: FormControl;
  @Input()
  name: string;
  @Input()
  placeholder: string;
  @Input()
  disabled: boolean;
  @Input()
  highlightDirty: boolean;
  @Input()
  size: null | 'small' | 'medium' | 'large' = 'medium';
  @Input()
  setDefault = true;
  @Input()
  ariaLabel = '';
  @Input()
  ariaErrorId = '';

  @Output()
  value: EventEmitter<T>;

  public hasFocus: boolean = false;
  public selectedElement: DropDownElement<T>;
  public empty: any;
  public _options: DropDownGroupElement<T>[] | DropDownElement<T>[];
  public optionsGrouped: boolean;

  @ViewChild('selectInput')
  selectInput: any;

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

  @Input()
  set options(value: DropDownGroupElement<T>[] | DropDownElement<T>[]) {
    this._options = [];

    if (!value || value.length === 0) {
      delete this.selectedElement;
      return;
    }

    // Check if the options are group or not
    this.optionsGrouped = (value[0] as DropDownGroupElement<T>).dropDownElements !== undefined;

    let controlMatchingOption: DropDownElement<T> = null;
    let defaultOption: DropDownElement<T> = null;
    let autoDefaultOption: DropDownElement<T> = null;

    let optionCount = 0;

    if (this.optionsGrouped) {
      const options: DropDownGroupElement<T>[] = [];
      const inputs: DropDownGroupElement<T>[] = value as DropDownGroupElement<T>[];
      inputs.forEach(optGroup => {
        const optionsGroup: DropDownGroupElement<T> = {
          displayLabel: optGroup.displayLabel,
          dropDownElements: [],
        };

        optGroup.dropDownElements.forEach(opt => {
          const option = {
            id: optionCount++,
            displayLabel: opt.displayLabel,
            value: opt.value,
            default: opt.default,
          };

          if (this.control && this.control.value === opt.value) {
            controlMatchingOption = option;
          }
          if (opt.default) {
            defaultOption = option;
          }
          if (optionCount === 1 && this.setDefault) {
            autoDefaultOption = option;
          }

          optionsGroup.dropDownElements.push(option);
        });
        options.push(optionsGroup);
      });
      this._options = options;
    } else {
      const options: DropDownElement<T>[] = [];
      const inputs: DropDownElement<T>[] = value as DropDownElement<T>[];
      inputs.forEach((opt, ind, arr) => {
        const option = {
          id: optionCount++,
          displayLabel: opt.displayLabel,
          value: opt.value,
          default: opt.default,
        };

        if (this.control && this.control.value === opt.value) {
          controlMatchingOption = option;
        }
        if (opt.default) {
          defaultOption = option;
        }
        if (optionCount === 1 && (this.setDefault || arr.length === 1)) {
          autoDefaultOption = option;
        }

        options.push(option);
      });
      this._options = options;
    }

    if (optionCount === 0) {
      // There are no options, so we can't have a selected option.
      delete this.selectedElement;
    } else if (!!this.control && this.control.value !== null) {
      // The drop-down is associated with a form control that has a non-null value.
      // Unless there is an option that matches the value of the from control, no option should be selected.
      if (!controlMatchingOption) {
        delete this.selectedElement;
      } else {
        this.onSelectValue(controlMatchingOption.value);
      }
    } else {
      // The drop-down is not associated with a form control, or the associated form control has null value.
      // If the default option (if present), or auto-select an option (if setDefault is set to true).
      // Otherwise, clear the selection.
      const defaultOpt = defaultOption || (this.setDefault && autoDefaultOption);
      if (!defaultOpt) {
        delete this.selectedElement;
      } else {
        if (!this.control) {
          this.onSelect(defaultOpt.id.toString());
        } else {
          this.control.setValue(defaultOpt.value);
          this.onSelectValue(defaultOpt.value);
        }
      }
    }
  }

  @Input()
  set resetOnChange(_) {
    delete this.selectedElement;
  }

  @Input()
  set selectedValue(value: T) {
    if (this.selectedElement.value !== value && value) {
      this.onSelectValue(value);
    }
  }

  onSelect(id: string) {
    let element: DropDownElement<T> = null;
    if (this.optionsGrouped) {
      (this._options as DropDownGroupElement<T>[]).forEach(g => {
        element = element || g.dropDownElements.find(e => e.id.toString() === id);
      });
    } else {
      element = (this._options as DropDownElement<T>[]).find(e => e.id.toString() === id);
    }
    this.selectedElement = element;
    this.value.emit(element.value);
  }

  onSelectValue(value: T) {
    let element: DropDownElement<T> = null;
    if (this.optionsGrouped) {
      (this._options as DropDownGroupElement<T>[]).forEach(g => {
        element = element || g.dropDownElements.find(e => e.value === value);
      });
    } else {
      element = (this._options as DropDownElement<T>[]).find(e => e.value === value);
    }
    this.selectedElement = element;
    this.value.emit(element.value);
  }

  focus() {
    if (this.selectInput) {
      this.selectInput.nativeElement.focus();
    }
  }
}
