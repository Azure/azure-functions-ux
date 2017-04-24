import { TextboxComponent } from './../textbox/textbox.component';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";

export class CustomFormGroup extends FormGroup{
  public _msShowTextbox : Subject<boolean>;
  public _msFocusedControl : string;
  public _msStartInEditMode : boolean;
}

export class CustomFormControl extends FormControl{
  public _msRunValidation : boolean;
}

@Component({
  selector: 'click-to-edit-textbox',
  templateUrl: './click-to-edit-textbox.component.html',
  styleUrls: ['./click-to-edit-textbox.component.scss']
})
export class ClickToEditTextboxComponent implements OnInit, OnDestroy {

  public showTextbox = false;
  @Input() group : FormGroup;
  @Input() name : string;
  @Input() placeholder : string;
  @Input() hiddenText : boolean;

  @ViewChild(TextboxComponent) textbox : TextboxComponent; 

  public control : CustomFormControl;
  private _sub : Subscription;

  constructor() { }

  ngOnInit() {
    this.control = <CustomFormControl>this.group.controls[this.name];

    let group = <CustomFormGroup>this.group;
    if(!group._msShowTextbox){
      group._msShowTextbox = new Subject<boolean>();
    }

    this._sub = group._msShowTextbox.subscribe(showTextbox =>{
      this.showTextbox = showTextbox;
    })

    if((<CustomFormGroup>group)._msStartInEditMode){
      this.showTextbox = true;
    }
  }

  ngOnDestroy(){
    if(this._sub){
      this._sub.unsubscribe();
      this._sub = null;
    }
  }

  onClick(event : any){
    if(!this.showTextbox){
      this.textbox.focus();
    }

    this._updateShowTextbox(true);
  }

  onBlur(event : any){
    this.control._msRunValidation = true;
    this.control.updateValueAndValidity();

    if(this.group.valid){

      // Blur happens before click.  So if you're switching between
      // click-to-edit-textbox components in the same form group,
      // you want to make sure the click event on the target component
      // is able to change _azFocusedControl before you update showTextbox
      // on the source component.  Otherwise when you switch components
      // blur will remove the textbox and the click will never happen/
      setTimeout(() =>{
        this._updateShowTextbox(false);
      }, 100)
    }
  }

  private _updateShowTextbox(show : boolean){
    let group = <CustomFormGroup>this.group;
    
    if(show){
      group._msFocusedControl = this.name;
    }
    else if(group._msFocusedControl === this.name){
      group._msFocusedControl = "";
    }
    
    if(!group._msFocusedControl || group._msFocusedControl === this.name){
      group._msShowTextbox.next(show);
    }
  }
}
