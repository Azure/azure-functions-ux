import { FormControl } from '@angular/forms';
import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent implements OnInit {

  @Input() control: FormControl;
  @Input() placeholder = '';
  @Input() highlightDirty: boolean;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() type: 'text' | 'password' = 'text';
  @Output() change: Subject<string>;
  @Output() value: Subject<string>;

  @ViewChild('textboxInput') textboxInput: any;

  public Obj = Object;

  constructor() {
    this.change = new Subject<string>();
    this.value = new Subject<string>();
  }

  ngOnInit() {
  }

  focus() {
    if (this.textboxInput) {
      this.textboxInput.nativeElement.focus();
    }
  }

  onChange(value: string) {
    this.change.next(value);
  }

  onKeyUp(value: string) {
    this.value.next(value);
  }
}
