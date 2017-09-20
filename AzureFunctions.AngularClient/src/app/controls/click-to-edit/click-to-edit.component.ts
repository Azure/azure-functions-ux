import { DropDownComponent } from './../../drop-down/drop-down.component';
import { TextboxComponent } from './../textbox/textbox.component';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, ElementRef, OnInit, Input, AfterViewInit, OnDestroy, ContentChild, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

// Used to communicate between click-to-edit components
export class CustomFormGroup extends FormGroup {

  // Tells other ClickToEdit components when we're in "edit" mode for the form group.
  public _msShowTextbox: Subject<boolean>;

  // Tells other ClickToEdit components which control currently has focus
  public _msFocusedControl: string;

  // Overrides the ClickToEdit default behavior to start in edit mode for new items
  public _msStartInEditMode: boolean;

  // Overrides the ClickToEdit default behavior to remain in edit mode
  public _msStayInEditMode: boolean;
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

  @ViewChild('target') target: ElementRef;

  @ContentChild(TextboxComponent) textbox: TextboxComponent;
  @ContentChild(DropDownComponent) dropdown: DropDownComponent<any>;

  public control: CustomFormControl;
  private _sub: Subscription;

  private _targetFocusState: 'focused' | 'blurring' | 'blurred';

  constructor() { }

  ngOnInit() {
    this._targetFocusState = 'blurred';

    this.control = this.group.controls[this.name] as CustomFormControl;

    const group = this.group /*as CustomFormGroup*/;
    if (!group._msShowTextbox) {
      group._msShowTextbox = new Subject<boolean>();
    }

    this._sub = group._msShowTextbox.subscribe(showTextbox => {
      this.showTextbox = showTextbox;
      if (this.showTextbox && (<CustomFormGroup>this.group)._msFocusedControl === this.name) {
        setTimeout(() => {
          this._focusChild();
        });
      }
    });

    if ((<CustomFormGroup>group)._msStartInEditMode) {
      this.showTextbox = true;
    }
  }

  ngAfterViewInit() {
    if (this.target && this.target.nativeElement) {
      this.target.nativeElement.addEventListener('focus', (e) => { this.targetFocusListener(e); }, true);
      this.target.nativeElement.addEventListener('blur', (e) => { this.targetBlurListener(e); }, true);
    }
  }

  ngOnDestroy() {
    if (this._sub) {
      this._sub.unsubscribe();
      this._sub = null;
    }
    if (this.target && this.target.nativeElement) {
      this.target.nativeElement.removeEventListener('focus', (e) => { this.targetFocusListener(e); }, true);
      this.target.nativeElement.removeEventListener('blur', (e) => { this.targetBlurListener(e); }, true);
    }
  }

  private _focusChild() {
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
    if (!this.showTextbox) {
      event.preventDefault();
      this._updateShowTextbox(true);
    }
  }

  onTargetFocus() {
    this._updateShowTextbox(true);
  }

  onTargetBlur() {
    this.control._msRunValidation = true;
    this.control.updateValueAndValidity();

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
    const group = <CustomFormGroup>this.group;

    if (show) {
      group._msFocusedControl = this.name;
    } else if (group._msFocusedControl === this.name) {
      group._msFocusedControl = '';
    }

    if (!group._msFocusedControl || group._msFocusedControl === this.name) {
      group._msShowTextbox.next(show);
    }
  }

  targetBlurListener(event: FocusEvent) {
    this._targetFocusState = 'blurring';
    setTimeout(() => {
      if (this._targetFocusState !== 'focused') {
        this._targetFocusState = 'blurred';
        this.onTargetBlur();
      }
    });
  }

  targetFocusListener(event: FocusEvent) {
    if (this._targetFocusState === 'blurred') {
      this.onTargetFocus();
    }
    this._targetFocusState = 'focused';
  }

}
