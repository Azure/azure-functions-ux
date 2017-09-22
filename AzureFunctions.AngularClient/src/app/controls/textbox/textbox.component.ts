import { FormControl } from '@angular/forms';
import { Component, OnInit, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent implements OnInit {

  @Input() control: FormControl;
  @Input() placeholder: string;
  @Input() highlightDirty: boolean;

  @ViewChild('textboxInput') textboxInput: any;

  public Obj = Object;

  constructor() {
  }

  ngOnInit() {
  }

  focus() {
    if (this.textboxInput) {
      //setTimeout(() => {
        this.textboxInput.nativeElement.focus();
      //})
    }
  }
}
