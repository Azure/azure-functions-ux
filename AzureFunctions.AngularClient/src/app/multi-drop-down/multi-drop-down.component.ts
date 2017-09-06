import { Dom } from './../shared/Utilities/dom';
import { PortalResources } from './../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { KeyCodes } from './../shared/models/constants';
import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { MultiDropDownElement } from './../shared/models/drop-down-element';

@Component({
  selector: 'multi-drop-down',
  templateUrl: './multi-drop-down.component.html',
  styleUrls: ['./multi-drop-down.component.scss'],
  inputs: ['inputOptions'],
  outputs: ['selectedValues'],
  host: {
    '(document:mousedown)': 'onDocumentMouseDown($event)',
  }
})
export class MultiDropDownComponent<T> implements OnInit {

  @Input() displayText = '';
  @Input() ariaLabel = '';
  @Input() allItemsDisplay: string | null;
  @Input() numberItemsDisplay: string | null;
  @ViewChild('itemListContainer') itemListContainer: ElementRef;
  @ViewChild('displayToggle') displayToggle: ElementRef;
  public opened = false;
  public options: MultiDropDownElement<T>[];
  public selectedValues = new ReplaySubject<T[]>(1);
  private _selectAllOption: MultiDropDownElement<T>;
  private _focusedIndex = -1;
  private _initialized = false;

  constructor(private _eref: ElementRef, private _ts: TranslateService) {
    this._selectAllOption = {
      displayLabel: _ts.instant(PortalResources.selectAll),
      value: null,
      isSelected: false
    };
  }

  ngOnInit() {
  }

  set inputOptions(inputOptions: MultiDropDownElement<T>[]) {
    const options: MultiDropDownElement<T>[] = [];
    let defaultSelected = false;
    inputOptions.forEach(option => {
      if (option.isSelected) {
        defaultSelected = true;
      }

      options.push(option);
    });

    options.splice(0, 0, this._selectAllOption);
    this.options = options;

    if (!defaultSelected) {
      this._updateAllSelected(true);
    }

    this._notifyChangeSubscriptions();
  }

  // http://stackoverflow.com/questions/35712379/angular2-close-dropdown-on-click-outside-is-there-an-easiest-way
  onDocumentMouseDown(event: MouseEvent) {
    if (this.opened && !this._eref.nativeElement.contains(event.target)) {
      this._notifyChangeSubscriptions();
    }
  }

  onBlur() {
    this._notifyChangeSubscriptions();
  }

  globalKeyPress(event: KeyboardEvent) {
    if (this.opened) {
      if (event.keyCode === KeyCodes.escape) {
        this._notifyChangeSubscriptions();
        Dom.setFocus(this.displayToggle.nativeElement);
      }
      else if (event.keyCode === KeyCodes.tab) {
        this._notifyChangeSubscriptions();
      }
    }
  }

  toggleClick() {
    if (this.opened) {
      this._notifyChangeSubscriptions();
    }
    else {
      this.opened = true;
    }
  }

  toggleKeyPress(event: KeyboardEvent) {
    let preventDefault = true;

    if (event.keyCode === KeyCodes.arrowDown) {
      if(!this.opened) {
        this.opened = true;
      }
      else {
        this._moveFocusedItem(0);
      }
    }
    else {
      preventDefault = false;
    }

    // Prevents the entire page from scrolling on space/up/down/end/home/pageUp/pageDown key press
    if (preventDefault) {
      event.preventDefault();
    }
  }

  private _getListItems(): NodeList {
    if (this.itemListContainer && this.itemListContainer.nativeElement) {
      return (this.itemListContainer.nativeElement as HTMLElement).querySelectorAll('li');
    }
    else {
      return null;
    }
  }

  optionClick(optionIndex: number) {
    this._moveFocusedItem(optionIndex);
    this._toggleItemSelect(optionIndex);
  }

  optionKeyPress(event: KeyboardEvent) {
    let preventDefault = true;

    if (event.keyCode === KeyCodes.arrowDown) {
      this._moveFocusedItem(Math.min(this._focusedIndex + 1, this.options.length - 1));
    }
    else if (event.keyCode === KeyCodes.arrowUp) {
      this._moveFocusedItem(Math.max(this._focusedIndex - 1, 0));
    }
    else if (event.keyCode === KeyCodes.end) {
      this._moveFocusedItem(this.options.length - 1);
    }
    else if (event.keyCode === KeyCodes.home) {
      this._moveFocusedItem(0);
    }
    else if (event.keyCode === KeyCodes.space) {
      this._toggleItemSelect(this._focusedIndex);
    }
    else if (event.keyCode === KeyCodes.enter) {
      this._toggleItemSelect(this._focusedIndex);
      preventDefault = false;
    }
    else {
      preventDefault = false;
    }

    // Prevents the entire page from scrolling on space/up/down/end/home/pageUp/pageDown key press
    if (preventDefault) {
      event.preventDefault();
    }
  }

  private _moveFocusedItem(index: number) {
    if (index >= 0 && index < this.options.length) {
      let listItems = this._getListItems();
      if (index < listItems.length) {
        if (this._focusedIndex >= 0 && this._focusedIndex < this.options.length && this._focusedIndex < listItems.length) {
          this.options[this._focusedIndex].isFocused = false;
          Dom.clearFocus(listItems[this._focusedIndex] as HTMLElement);
        }
        this._focusedIndex = index;
        this.options[this._focusedIndex].isFocused = true;
        Dom.setFocus(listItems[this._focusedIndex] as HTMLElement);
      }
    }
    this._scrollIntoView();
  }

  private _toggleItemSelect(index: number) {
    if (index >= 0 && index < this.options.length) {
      const option = this.options[index];
      option.isSelected = !option.isSelected;
      if (option === this._selectAllOption) {
        if (option.isSelected) {
          this.options.forEach(o => o.isSelected = true);
        } else {
          this.options.forEach(o => o.isSelected = false);
        }
      }
      else {
        if (option.isSelected) {
          this._selectAllOption.isSelected = this.options.every(o => {
            return o === this._selectAllOption || o.isSelected;
          });
        } else {
          this._selectAllOption.isSelected = false;
        }
      }
    }
  }

  private _getViewContainer(): HTMLDivElement {
    return this.itemListContainer && this.itemListContainer.nativeElement;
  }

  private _scrollIntoView() {
    const view = this._getViewContainer();
    if (!view) {
      return;
    }

    const firstItem = view.querySelector('li');
    if (!firstItem) {
      return null;
    }

    const viewBottom = view.scrollTop + view.clientHeight;
    const itemHeight = firstItem.clientHeight;

    // If view needs to scroll down
    if ((this._focusedIndex + 1) * itemHeight > viewBottom) {

      // If view is scrolled way out of view, then scroll so that selected is top
      if (viewBottom + itemHeight < (this._focusedIndex + 1) * itemHeight) {
        view.scrollTop = this._focusedIndex * itemHeight;
      } else {
        // If view is incremented out of view, then scroll by a single item
        view.scrollTop += itemHeight;
      }
    } else if (this._focusedIndex * itemHeight <= view.scrollTop) {
      // If view needs to scroll up

      if (view.scrollTop - itemHeight > this._focusedIndex * itemHeight) {
        view.scrollTop = this._focusedIndex * itemHeight;
      } else {
        view.scrollTop -= itemHeight;
      }
    }
  }

  private _notifyChangeSubscriptions() {
    this.opened = false;
    this._focusedIndex = -1;

    let displayText = null;
    const selectedValues: T[] = [];

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
      });
    }

    if (this._selectAllOption.isSelected) {
      if (this.allItemsDisplay) {
        displayText = this.allItemsDisplay;
      } else {
        displayText = this._ts.instant(PortalResources.allItemsSelected);
      }
    } else if (selectedValues.length > 1) {
      if (this.numberItemsDisplay) {
        displayText = this.numberItemsDisplay.format(selectedValues.length);
      } else {
        displayText = this._ts.instant(PortalResources.numItemsSelected).format(selectedValues.length);
      }
    }

    this.displayText = displayText;
    this._compareAndUpdateIfDifferent(selectedValues);
  }

  private _updateAllSelected(allSelected: boolean) {
    this.options.forEach(option => {
      option.isSelected = allSelected;
    });
  }

  private _compareAndUpdateIfDifferent(newValues: T[]) {
    if (!this._initialized) {
      this.selectedValues.next(newValues);
      this._initialized = true;
    } else {
      this.selectedValues
        .first()
        .subscribe(currentValues => {
          if (currentValues.length === newValues.length) {

            for (let i = 0; i < currentValues.length; i++) {
              if (currentValues[i] !== newValues[i]) {
                this.selectedValues.next(newValues);
                break;
              }
            }
          } else {
            this.selectedValues.next(newValues);
          }
        });
    }
  }
}
