import { Subject } from 'rxjs/Rx';
import { FormControl } from '@angular/forms';
import { Component, OnInit, Input, ElementRef, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent implements OnInit {

  @Input() control : FormControl;
  @Input() placeholder : string;
  @Output() blur = new Subject<any>();
  @ViewChild('textboxInput') textboxInput : any;

  public Obj = Object;

  constructor() {
  }

  ngOnInit() {
  }

  onBlur(event : any){
    this.blur.next(event);
  }

  focus(){
    if(this.textboxInput){
      setTimeout(() =>{
        this.textboxInput.nativeElement.focus();
      })
    }
  }
}
