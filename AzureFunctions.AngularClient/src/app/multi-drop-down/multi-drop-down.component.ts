import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { DropDownElement, MultiDropDownElement } from './../shared/models/drop-down-element';

@Component({
  selector: 'multi-drop-down',
  templateUrl: './multi-drop-down.component.html',
  styleUrls: ['./multi-drop-down.component.scss'],
  inputs: ['inputOptions'],
  outputs: ['selectedValues'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  }
})
export class MultiDropDownComponent<T> implements OnInit {

  @Input() displayText = "";
  public opened = false;
  public options: MultiDropDownElement<T>[];
  public selectedValues = new ReplaySubject<T[]>(1);
  private _selectAllOption: MultiDropDownElement<T>;

  constructor(private _eref: ElementRef) {
    this._selectAllOption = {
      displayLabel: "Select All",
      value: null,
      isSelected: false
    };
  }

  ngOnInit() {
  }

  set inputOptions(inputOptions: MultiDropDownElement<T>[]) {
    let options: MultiDropDownElement<T>[] = [];
    let defaultSelected = false;
    inputOptions.forEach(option => {
      if (option.isSelected) {
        defaultSelected = true;
      }

      options.push(option);
    })

    options.splice(0, 0, this._selectAllOption);
    this.options = options;

    if (!defaultSelected) {
      this._updateAllSelected(true);
    }

    this._notifyChangeSubscriptions();
  }

  click() {
    if(this.opened){
      this._notifyChangeSubscriptions();
    }

    this.opened = !this.opened;
  }

  // http://stackoverflow.com/questions/35712379/angular2-close-dropdown-on-click-outside-is-there-an-easiest-way
  onDocumentClick(event) {

    if (this.opened && !this._eref.nativeElement.contains(event.target)) {
      this.opened = false;
      this._notifyChangeSubscriptions();
    }
  }

  handleChecked(option: MultiDropDownElement<T>) {
    if (option !== this._selectAllOption) {
      this._selectAllOption.isSelected = false;
      option.isSelected = !option.isSelected;
    }
    else {
      this._updateAllSelected(!option.isSelected);
    }
  }

  private _notifyChangeSubscriptions() {
    let displayText = null;
    let selectedValues: T[] = [];

    if (this.options) {
      this.options.forEach(option => {
        if (option.isSelected && option !== this._selectAllOption) {
          displayText = option.displayLabel;
          selectedValues.push(option.value);
        }
      });
    }

    // Prevent user from selecting none.  It's an optimization specific
    // to subscriptions and may not make sense as a generic behavior.
    if (selectedValues.length === 0) {
      this.options.forEach(option => {
        option.isSelected = true;
        if(option !== this._selectAllOption){
          selectedValues.push(option.value);
        }
      })
    }

    if (this._selectAllOption.isSelected) {
      displayText = `All items selected`;
    }
    else if (selectedValues.length > 1) {
      displayText = `${selectedValues.length} items selected`;
    }

    this.displayText = displayText;
    this.selectedValues.next(selectedValues);
  }

  private _updateAllSelected(allSelected: boolean) {
    this.options.forEach(option => {
      option.isSelected = allSelected;
    })
  }
}
