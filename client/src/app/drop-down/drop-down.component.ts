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

    let defaultOptionFound: boolean = false;
    let selectedOptionId: number = null;
    let selectedOptionValue: T = null;

    let optionCount = 0;

    if (this.optionsGrouped) {
      let options: DropDownGroupElement<T>[] = [];
      let inputs: DropDownGroupElement<T>[] = value as DropDownGroupElement<T>[];
      inputs.forEach(optGroup => {
        const optionsGroup: DropDownGroupElement<T> = {
          displayLabel: optGroup.displayLabel,
          dropDownElements: [],
        };

        optGroup.dropDownElements.forEach(opt => {
          optionsGroup.dropDownElements.push({
            id: optionCount++,
            displayLabel: opt.displayLabel,
            value: opt.value,
            default: opt.default,
          });

          if ((optionCount === 1 && this.setDefault) || opt.default) {
            selectedOptionId = optionCount - 1;
            selectedOptionValue = opt.value;
            defaultOptionFound = defaultOptionFound || opt.default;
          }
        });

        options.push(optionsGroup);
      });
      this._options = options;
    } else {
      let options: DropDownElement<T>[] = [];
      let inputs: DropDownElement<T>[] = value as DropDownElement<T>[];
      inputs.forEach((opt, ind, arr) => {
        options.push({
          id: optionCount++,
          displayLabel: opt.displayLabel,
          value: opt.value,
          default: opt.default,
        });

        if ((optionCount === 1 && (this.setDefault || arr.length === 1)) || opt.default) {
          selectedOptionId = optionCount - 1;
          selectedOptionValue = opt.value;
          defaultOptionFound = defaultOptionFound || opt.default || arr.length === 1;
        }
      });
      this._options = options;
    }

    if (optionCount === 0) {
      delete this.selectedElement;
      return;
    }

    if (defaultOptionFound || this.setDefault) {
      if (!this.control) {
        this.onSelect(selectedOptionId.toString());
      } else {
        this.onSelectValue(selectedOptionValue);
      }
    } else {
      if (this.selectedElement) {
        delete this.selectedElement;
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
