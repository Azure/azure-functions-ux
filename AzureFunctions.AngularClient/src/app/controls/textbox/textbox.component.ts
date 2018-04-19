import { FormControl } from '@angular/forms';
import { Component, OnInit, Input, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent implements OnInit {

  @Input() control: FormControl;
  @Input() placeholder: string;

  @Output() blur = new Subject<any>();

  @ViewChild('textboxInput') textboxInput: any;

  public Obj = Object;

  constructor() {
  }

  ngOnInit() {
  }

  onBlur(event: any) {
    this.blur.next(event);
  }

  focus() {
    if (this.textboxInput) {
      setTimeout(() => {
        this.textboxInput.nativeElement.focus();
      })
    }
  }
}
