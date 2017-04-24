import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs/Rx';
import { Input, OnChanges, SimpleChange, ElementRef, ViewChild, AfterViewInit, ViewChildren, ContentChild, ContentChildren, QueryList } from '@angular/core';
import { Component, OnInit, Directive, ComponentFactoryResolver } from '@angular/core';

export interface TblItem{
  data : any
}

@Component({
  selector: 'tbl',
  template: `<table [class]="tblClass"><ng-content></ng-content></table>`,
  exportAs: "tbl"
})
export class TblComponent implements OnInit, OnChanges {
  @Input() editable : boolean;
  @Input() tblClass = "tbl";

  public sortedColName : string;
  public sortAscending : boolean;

  @Input() items: TblItem[];
  private _origItems : any[];

  constructor(private _componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: {[key: string]: SimpleChange}) {
      let items = changes['items'];
      if (items) {
        this.items = items.currentValue;
        this._origItems = items.currentValue;
      }
  }

  get origItems(){
    return this._origItems;
  }
}
