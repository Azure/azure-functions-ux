import { TextboxComponent } from './../textbox/textbox.component';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";

class CustomFormGroup extends FormGroup{
  public _azShowTextbox : Subject<boolean>;
  public _azFocusedControl : string
}

@Component({
  selector: 'click-to-edit-textbox',
  templateUrl: './click-to-edit-textbox.component.html',
  styleUrls: ['./click-to-edit-textbox.component.scss']
})
export class ClickToEditTextboxComponent implements OnInit, OnDestroy {

  public showTextbox = false;
  // @Input() control : FormControl;
  @Input() group : FormGroup;
  @Input() name : string;
  @Input() placeholder : string;
  @ViewChild(TextboxComponent) textbox : TextboxComponent; 

  public control : FormControl;
  private _sub : Subscription;

  constructor() { }

  ngOnInit() {
    this.control = <FormControl>this.group.controls[this.name];

    let group = <CustomFormGroup>this.group;
    if(!group._azShowTextbox){
      group._azShowTextbox = new Subject<boolean>();
    }

    this._sub = group._azShowTextbox.subscribe(showTextbox =>{
      this.showTextbox = showTextbox;
    })
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
    let group = <any>this.group;
    
    if(show){
      group._azFocusedControl = this.name;
    }
    else if(group._azFocusedControl === this.name){
      group._azFocusedControl = "";
    }
    
    if(!group._azFocusedControl || group._azFocusedControl === this.name){
      group._azShowTextbox.next(show);
    }
  }
}
