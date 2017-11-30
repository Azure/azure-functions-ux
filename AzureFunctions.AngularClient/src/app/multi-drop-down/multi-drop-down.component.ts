import { PortalResources } from './../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { KeyCodes } from './../shared/models/constants';
import { Guid } from './../shared/Utilities/Guid';
import { Component, ElementRef, Input, Output, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { MultiDropDownElement } from './../shared/models/drop-down-element';

@Component({
  selector: 'multi-drop-down',
  templateUrl: './multi-drop-down.component.html',
  styleUrls: ['./multi-drop-down.component.scss']
})
export class MultiDropDownComponent<T> {

  @Input() ariaLabel: string = null;
  @Input() displayText = '';
  @Input() allItemsDisplay: string | null;
  @Input() numberItemsDisplay: string | null;
  @Input() id: string;
  @Output() public selectedValues = new ReplaySubject<T[]>(1);

  @ViewChild('comboBox') comboBox: ElementRef;
  @ViewChild('displayInput') displayInput: ElementRef;
  @ViewChild('toggleArrow') toggleArrow: ElementRef;
  @ViewChild('listBox') listBox: ElementRef;

  public opened = false;
  public options: MultiDropDownElement<T>[];
  public hasFocus = false;
  public focusedIndex = -1;

  private _selectAllOption: MultiDropDownElement<T>;
  private _initialized = false;

  constructor(private _ts: TranslateService) {
    this.id = Guid.newGuid();
    this._selectAllOption = {
      displayLabel: _ts.instant(PortalResources.selectAll),
      value: null,
      isSelected: false
    };
  }

  @Input() set inputOptions(inputOptions: MultiDropDownElement<T>[]) {
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

  private _updateAllSelected(allSelected: boolean) {
    this.options.forEach(option => {
      option.isSelected = allSelected;
    });
  }

  private _notifyChangeSubscriptions() {
    this.opened = false;
    this.focusedIndex = -1;

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

  public onKeyDown(event: KeyboardEvent) {
    let preventDefault = false;

    if (event.keyCode === KeyCodes.arrowDown) {
      preventDefault = this._moveFocusedItemDown();
    } else if (event.keyCode === KeyCodes.end) {
      preventDefault = this._moveFocusedItemDown(true);
    } else if (event.keyCode === KeyCodes.arrowUp) {
      preventDefault = this._moveFocusedItemUp();
    } else if (event.keyCode === KeyCodes.home) {
      preventDefault = this._moveFocusedItemUp(true);
    } else if (this.opened) {
      if (event.keyCode === KeyCodes.enter) {
        this._toggleItemSelect(this.focusedIndex);
      } else if (event.keyCode === KeyCodes.space) {
        this._toggleItemSelect(this.focusedIndex);
        preventDefault = true;
      } else if (event.keyCode === KeyCodes.escape) {
        this._notifyChangeSubscriptions();
      } else if (event.keyCode === KeyCodes.tab) {
        this._notifyChangeSubscriptions();
      }
    }

    if (preventDefault) {
      // Prevents the entire page from scrolling on space/up/down/end/home/pageUp/pageDown key press
      event.preventDefault();
    }
  }

  public onMouseDown(event: MouseEvent) {
    if (event.target !== this.displayInput.nativeElement) {
      event.preventDefault();
      this.displayInput.nativeElement.focus();
    }
  }

  public onFocus() {
    this.hasFocus = true;
  }

  public onBlur() {
    this.hasFocus = false;
    if (this.opened) {
      this._notifyChangeSubscriptions();
    }
  }

  public onComboBoxClick(event: MouseEvent) {
    if (this.opened) {
      this._notifyChangeSubscriptions();
    } else {
      this.opened = true;
    }
  }

  public onOptionClick(optionIndex: number) {
    this.focusedIndex = optionIndex;
    this._toggleItemSelect(optionIndex);
  }

  private _toggleItemSelect(optionIndex: number) {
    if (optionIndex >= 0 && optionIndex < this.options.length) {
      const option = this.options[optionIndex];
      option.isSelected = !option.isSelected;
      if (option === this._selectAllOption) {
        if (option.isSelected) {
          this.options.forEach(o => o.isSelected = true);
        } else {
          this.options.forEach(o => o.isSelected = false);
        }
      } else {
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

  private _moveFocusedItemDown(moveToEnd?: boolean): boolean {
    let preventDefault = true;

    if ((!this.opened && moveToEnd) || !this.options || this.options.length === 0) {
      preventDefault = false;
    } else if (!this.opened) {
      this.opened = true;
      this.focusedIndex = 0;
    } else if (moveToEnd) {
      this.focusedIndex = this.options.length - 1;
    } else if (this.focusedIndex < this.options.length - 1) {
      this.focusedIndex++;
    } else {
      preventDefault = false;
    }

    if (preventDefault) {
      this._scrollIntoView();
    }

    return preventDefault;
  }

  private _moveFocusedItemUp(moveToTop?: boolean): boolean {
    let preventDefault = true;

    if (!this.opened || !this.options || this.options.length === 0) {
      preventDefault = false;
    } else if (moveToTop) {
      this.focusedIndex = 0;
    } else if (this.focusedIndex > 0) {
      this.focusedIndex--;
    } else {
      preventDefault = false;
    }

    if (preventDefault) {
      this._scrollIntoView();
    }

    return preventDefault;
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
    if ((this.focusedIndex + 1) * itemHeight > viewBottom) {

      // If view is scrolled way out of view, then scroll so that selected is top
      if (viewBottom + itemHeight < (this.focusedIndex + 1) * itemHeight) {
        view.scrollTop = this.focusedIndex * itemHeight;
      } else {
        // If view is incremented out of view, then scroll by a single item
        view.scrollTop += itemHeight;
      }
    } else if (this.focusedIndex * itemHeight <= view.scrollTop) {
      // If view needs to scroll up

      if (view.scrollTop - itemHeight > this.focusedIndex * itemHeight) {
        view.scrollTop = this.focusedIndex * itemHeight;
      } else {
        view.scrollTop -= itemHeight;
      }
    }
  }

  private _getViewContainer(): HTMLDivElement {
    return this.listBox && <HTMLDivElement>this.listBox.nativeElement;
  }
}
