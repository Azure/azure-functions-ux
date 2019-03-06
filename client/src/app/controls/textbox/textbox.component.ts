import { FormControl } from '@angular/forms';
import { Component, Input, OnInit, Output, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent implements OnInit, OnChanges {
  @Input()
  control: FormControl;
  @Input()
  ariaLabel = '';
  @Input()
  ariaErrorId = '';
  @Input()
  placeholder = '';
  @Input()
  highlightDirty: boolean;
  @Input()
  readonly: boolean;
  @Input()
  disabled: boolean;
  @Input()
  type: 'text' | 'password' = 'text';
  @Input()
  disablePopOverError: boolean;
  @Output()
  change: Subject<string>;
  @Output()
  value: Subject<string>;

  @ViewChild('textboxInput')
  textboxInput: any;

  public Obj = Object;

  private _originalValue = null;

  constructor() {
    this.change = new Subject<string>();
    this.value = new Subject<string>();
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['control']) {
      if (!this.control) {
        this._originalValue = null;
      } else if (this.control.value === undefined || this.control.value === null) {
        this._originalValue = this.control.value;
      } else {
        this._originalValue = String(this.control.value);
      }
    }
  }

  focus() {
    if (this.textboxInput) {
      this.textboxInput.nativeElement.focus();
    }
  }

  onChange(value: string) {
    this.change.next(value);
    this._setControlState();
  }

  onKeyUp(value: string) {
    this.value.next(value);
    this._setControlState();
  }

  private _setControlState() {
    if (this.control) {
      const isPristine =
        this.control.value === this._originalValue ||
        (this.control.value === null && this._originalValue === null) ||
        (this.control.value === undefined && this._originalValue === undefined);

      if (isPristine) {
        this.control.markAsPristine();
      } else {
        this.control.markAsDirty();
      }
    }
  }
}
