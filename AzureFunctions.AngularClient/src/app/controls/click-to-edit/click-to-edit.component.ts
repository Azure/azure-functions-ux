import { DropDownComponent } from './../../drop-down/drop-down.component';
import { TextboxComponent } from './../textbox/textbox.component';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, OnDestroy, ContentChild } from '@angular/core';
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
export class ClickToEditComponent implements OnInit, OnDestroy {

  public showTextbox = false;
  @Input() group: FormGroup;
  @Input() name: string;
  @Input() placeholder: string;
  @Input() hiddenText: boolean;

  @ContentChild(TextboxComponent) textbox: TextboxComponent;
  @ContentChild(DropDownComponent) dropdown: DropDownComponent<any>;

  public control: CustomFormControl;
  private _sub: Subscription;

  constructor() { }

  ngOnInit() {
    this.control = <CustomFormControl>this.group.controls[this.name];

    const group = <CustomFormGroup>this.group;
    if (!group._msShowTextbox) {
      group._msShowTextbox = new Subject<boolean>();
    }

    this._sub = group._msShowTextbox.subscribe(showTextbox => {
      this.showTextbox = showTextbox;
    });

    if ((<CustomFormGroup>group)._msStartInEditMode) {
      this.showTextbox = true;
    }

    if (this.textbox) {
      this.textbox.blur.subscribe(() => this.onBlur());
    } else if (this.dropdown) {
      this.dropdown.blur.subscribe(() => this.onBlur());
    }
  }

  ngOnDestroy() {
    if (this._sub) {
      this._sub.unsubscribe();
      this._sub = null;
    }
  }

  onClick() {
    if (!this.showTextbox) {
      if (this.textbox) {
        this.textbox.focus();
      } else if (this.dropdown) {
        this.dropdown.focus();
      }
    }

    this._updateShowTextbox(true);
  }

  onBlur() {
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
      }, 100);
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
}
