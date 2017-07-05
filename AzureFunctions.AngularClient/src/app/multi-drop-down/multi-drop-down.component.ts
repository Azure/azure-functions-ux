import { PortalResources } from './../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { KeyCodes } from './../shared/models/constants';
import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DropDownElement, MultiDropDownElement } from './../shared/models/drop-down-element';

interface Dimensions {
  container: HTMLDivElement;  // The containing element
  viewScrollTop: number;      // Scrollbar position relative to top of client view
  viewHeight: number;         // Height of the view
  viewBottom: number;         // Bottom of the current client view
  itemHeight: number;         // Height of each item
}

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
  @ViewChild('itemListContainer') itemListContainer: ElementRef;
  public opened = false;
  public options: MultiDropDownElement<T>[];
  public selectedValues = new ReplaySubject<T[]>(1);
  private _selectAllOption: MultiDropDownElement<T>;
  private _focusedIndex = -1;

  constructor(private _eref: ElementRef, private _ts : TranslateService) {
    this._selectAllOption = {
      displayLabel: _ts.instant(PortalResources.selectAll),
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
    if (this.opened) {
      this._notifyChangeSubscriptions();
    }

    this.opened = !this.opened;
  }

  // http://stackoverflow.com/questions/35712379/angular2-close-dropdown-on-click-outside-is-there-an-easiest-way
  onDocumentClick(event) {

    if (this.opened && !this._eref.nativeElement.contains(event.target)) {
      this._notifyChangeSubscriptions();
    }
  }

  onBlur(event) {
    this._notifyChangeSubscriptions();
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

  onKeyPress(event: KeyboardEvent) {

    if (event.keyCode === KeyCodes.arrowDown) {
      this._moveFocusedItemDown();
    }
    else if (event.keyCode === KeyCodes.arrowUp) {
      this._moveFocusedItemUp();
    }
    else if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
      if (this._focusedIndex >= 0 && this._focusedIndex < this.options.length) {
        let option = this.options[this._focusedIndex];
        option.isSelected = !option.isSelected;

        if(option === this._selectAllOption){
          if(option.isSelected){
            this.options.forEach(o => o.isSelected = true);
          }
          else{
            this.options.forEach(o => o.isSelected = false);
          }
        }
      }
    }
    else if (event.keyCode === KeyCodes.escape) {
      this._notifyChangeSubscriptions();
    }
    else if (event.keyCode === KeyCodes.tab) {
      this._notifyChangeSubscriptions();
    }

    if (event.keyCode !== KeyCodes.tab) {

      // Prevents the entire page from scrolling on up/down key press
      event.preventDefault();
    }

  }

  private _moveFocusedItemDown() {
    if (!this.opened) {
      this.opened = true;
      return;
    }

    let dim = this._getDimensions();
    if (!dim) {
      return;
    }

    if (this._focusedIndex < this.options.length - 1) {
      if (this._focusedIndex > -1) {
        this.options[this._focusedIndex].isFocused = false;
      }

      this.options[++this._focusedIndex].isFocused = true;
    }

    this._scrollIntoView(dim);
  }

  private _moveFocusedItemUp() {
    let dim = this._getDimensions();
    if (!dim) {
      return;
    }

    if (this._focusedIndex > 0) {
      this.options[this._focusedIndex].isFocused = false;
      this.options[--this._focusedIndex].isFocused = true;
    }

    this._scrollIntoView(dim);
  }

  private _getDimensions(): Dimensions {
    let container = this.itemListContainer && <HTMLDivElement>this.itemListContainer.nativeElement;

    if (!container) {
      return null;
    }

    let firstItem = container.querySelector('li');
    if (!firstItem) {
      return null;
    }

    return {
      container: container,
      viewScrollTop: container.scrollTop,
      viewHeight: container.clientHeight,
      viewBottom: container.scrollTop + container.clientHeight,
      itemHeight: firstItem.scrollHeight
    }
  }

  private _scrollIntoView(dim: Dimensions) {
    // If view needs to scroll down
    if ((this._focusedIndex + 1) * dim.itemHeight > dim.viewBottom) {

      // If view is scrolled way out of view, then scroll so that selected is top
      if (dim.viewBottom + dim.itemHeight < (this._focusedIndex + 1) * dim.itemHeight) {
        dim.container.scrollTop = this._focusedIndex * dim.itemHeight;
      }
      else {
        // If view is incremented out of view, then scroll by a single item
        dim.container.scrollTop += dim.itemHeight;
      }
    }
    else if (this._focusedIndex * dim.itemHeight <= dim.viewScrollTop) {
      // If view needs to scroll up

      if (dim.viewScrollTop - dim.itemHeight > this._focusedIndex * dim.itemHeight) {
        dim.container.scrollTop = this._focusedIndex * dim.itemHeight;
      }
      else {
        dim.container.scrollTop -= dim.itemHeight;
      }
    }
  }

  private _notifyChangeSubscriptions() {
    this.opened = false;

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
        if (option !== this._selectAllOption) {
          selectedValues.push(option.value);
        }
      })
    }

    if (this._selectAllOption.isSelected) {
      displayText = this._ts.instant(PortalResources.allItemsSelected);
    }
    else if (selectedValues.length > 1) {
      displayText = this._ts.instant(PortalResources.numItemsSelected).format(selectedValues.length);
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
