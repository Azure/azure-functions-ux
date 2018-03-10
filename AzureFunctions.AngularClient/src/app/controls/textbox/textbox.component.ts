import { FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

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

  @Output() change: EventEmitter<string>;
  @Output() value: EventEmitter<string>;

  @ViewChild('textboxInput') textboxInput: any;

  public Obj = Object;

  constructor() {
    this.change = new EventEmitter<string>();
    this.value = new EventEmitter<string>();
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
