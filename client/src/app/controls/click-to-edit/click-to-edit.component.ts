import { DropDownComponent } from './../../drop-down/drop-down.component';
import { TextboxComponent } from './../textbox/textbox.component';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, ElementRef, OnInit, Input, AfterViewInit, OnDestroy, ContentChild, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

// Used to communicate between click-to-edit components
export class CustomFormGroup extends FormGroup {

  // Tells other ClickToEdit components when we're in "edit" mode for the form group.
  public msShowTextbox: Subject<boolean>;

  // Tells other ClickToEdit components which control currently has focus
  public msFocusedControl: string;

  // Overrides the ClickToEdit default behavior to start in edit mode for new items
  public msStartInEditMode: boolean;

  public msExistenceState: 'original' | 'new' | 'deleted' = 'original';

  // Overrides the ClickToEdit default behavior to remain in edit mode
  public msStayInEditMode: boolean;
}

export class CustomFormControl extends FormControl {
  // Forces the required validation control to run on next evaluation
  public _msRunValidation: boolean;
}

@Component({
  selector: 'click-to-edit',
  templateUrl: './click-to-edit.component.html',
  styleUrls: ['./click-to-edit.component.scss'],
})
export class ClickToEditComponent implements OnInit, AfterViewInit, OnDestroy {

  public showTextbox = false;
  public group: CustomFormGroup;
  @Input('group') set origGroup(group: FormGroup) {
    this.group = group as CustomFormGroup;
  }
  @Input() name: string;
  @Input() placeholder: string;
  @Input() hiddenText: boolean;

  // This allows for a given control to affect the state of other controls in the group while not actually being "click-to-edit-able" itself.
  // (i.e. The control's own editable/non-editable state is not affected by the extended fields in the CustomFormGroup its associated with.)
  @Input() alwaysShow: boolean;

  @ViewChild('container') container: ElementRef;

  @ViewChild('target') target: ElementRef;

  @ContentChild(TextboxComponent) textbox: TextboxComponent;
  @ContentChild(DropDownComponent) dropdown: DropDownComponent<any>;

  public control: CustomFormControl;
  private _sub: Subscription;

  private _targetFocusState: 'focused' | 'blurring' | 'blurred';
  private _focusFunc = (e: FocusEvent) => { this._targetFocusListener(e); };
  private _blurFunc = (e: FocusEvent) => { this._targetBlurListener(e); };

  constructor() { }

  ngOnInit() {
    this._targetFocusState = 'blurred';

    this.control = this.group.controls[this.name] as CustomFormControl;

    const group = this.group as CustomFormGroup;

    if (!group.msShowTextbox) {
      group.msShowTextbox = new Subject<boolean>();
    }

    this._sub = group.msShowTextbox.subscribe(showTextbox => {
      this.showTextbox = showTextbox || this.alwaysShow || (group.msStartInEditMode && group.pristine);
      if (this.showTextbox && (this.group as CustomFormGroup).msFocusedControl === this.name) {
        setTimeout(() => {
          this._focusChild();
        });
      }
    });

    if (group.msStartInEditMode || this.alwaysShow) {
      this.showTextbox = true;
    }
  }

  ngAfterViewInit() {
    if (this.target && this.target.nativeElement) {
      this.target.nativeElement.addEventListener('focus', this._focusFunc, true);
      this.target.nativeElement.addEventListener('blur', this._blurFunc, true);
    }
  }

  ngOnDestroy() {
    if (this._sub) {
      this._sub.unsubscribe();
      this._sub = null;
    }
    if (this.target && this.target.nativeElement) {
      this.target.nativeElement.removeEventListener('focus', this._focusFunc, true);
      this.target.nativeElement.removeEventListener('blur', this._blurFunc, true);
    }
  }

  private _focusChild() {
    if (!this.target) {
      return;
    }

    if ((this.target.nativeElement as HTMLElement).contains(document.activeElement)) {
      return;
    }

    if (this.textbox) {
      this.textbox.focus();
    } else if (this.dropdown) {
      this.dropdown.focus();
    } else {
      return;
    }

    this._targetFocusState = 'focused';
  }

  onMouseDown(event: MouseEvent) {
    if (!this.showTextbox && !!this.control && !this.control.disabled) {
      event.preventDefault();
      event.stopPropagation();
      this._updateShowTextbox(true);

      // Simulate 'mousedown', 'mouseup', click' event sequence on the outer-most element.
      // We do this because the actual clicked element will be removed from the DOM before 'mouseup' and 'click' can occur.
      this._simulateMouseEvents(this.container.nativeElement, ['mousedown', 'mouseup', 'click']);
    }
  }

  private _onTargetFocus() {
    this._updateShowTextbox(true);
  }

  private _onTargetBlur() {
    if (!this.group.pristine) {
      for (let name in this.group.controls) {
        const control = this.group.controls[name] as CustomFormControl;
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    }

    if (this.group.valid) {

      // Blur happens before click.  So if you're switching between
      // click-to-edit-textbox components in the same form group,
      // you want to make sure the click event on the target component
      // is able to change _azFocusedControl before you update showTextbox
      // on the source component.  Otherwise when you switch components
      // blur will remove the textbox and the click will never happen/
      setTimeout(() => {
        this._updateShowTextbox(false);
      }, 0);
    }
  }

  protected _updateShowTextbox(show: boolean) {
    // When an instance with alwaysShow === true gains focus:
    //   1. Do not make the controls in the group become visible if they
    //      are not currently visible.
    //   2. If the conrols are already visible because the focus came from
    //      another control in the group, make sure they stay visible.

    const alwaysShowSuffix = '#ALWAYSSHOW';
    const group = this.group as CustomFormGroup;
    const name = this.name + (this.alwaysShow ? alwaysShowSuffix : '');

    if (show) { //gained focus
      group.msFocusedControl = name;
    } else if (group.msFocusedControl === name) { //lost focus
      group.msFocusedControl = '';
    }

    if (!group.msFocusedControl || (group.msFocusedControl === name && !this.alwaysShow)) {
      group.msShowTextbox.next(show);
    }
  }

  private _targetBlurListener(event: FocusEvent) {
    this._targetFocusState = 'blurring';
    setTimeout(() => {
      if (this._targetFocusState !== 'focused') {
        this._targetFocusState = 'blurred';
        this._onTargetBlur();
      }
    });
  }

  private _targetFocusListener(event: FocusEvent) {
    if (this._targetFocusState === 'blurred') {
      this._onTargetFocus();
    }
    this._targetFocusState = 'focused';
  }

  private _simulateMouseEvents(target: HTMLElement, eventTypes: string[]) {
    if (!eventTypes || eventTypes.length === 0) {
      return;
    }

    let newEvent: MouseEvent;
    if (typeof (Event) === 'function') {
      // This isn't IE, so we can use MouseEvent()
      newEvent = new MouseEvent(eventTypes[0], { bubbles: true, cancelable: true });
    } else {
      // This is IE, so we have to use document.createEvent() and .initEvent()
      newEvent = document.createEvent('MouseEvents');
      newEvent.initEvent(eventTypes[0], true, true);
    }

    target.dispatchEvent(newEvent);

    setTimeout(() => {
      eventTypes.splice(0, 1);
      this._simulateMouseEvents(target, eventTypes);
    });
  }

}
