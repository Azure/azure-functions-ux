import { TblComponent } from './../tbl.component';
import { Component, OnInit, Directive, HostListener, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'tbl-th',
  template: `
    <div class="sortable" (click)="sort()">
      <ng-content class="sortable"></ng-content>
      <i class="fa"
          [class.fa-chevron-up]="table.sortedColName === name && table.sortAscending"
          [class.fa-chevron-down]="(table.sortedColName === name && !table.sortAscending) || !table.sortedColName"></i>
    </div>`
})
export class TblThComponent implements OnInit {

  @Input() name : string;

  constructor(
    public table : TblComponent,
    private _el: ElementRef) {
  }

  ngOnInit() {
  }

  sort() {
    let table = this.table;

    // Make a copy so that we don't sort the original list
    if(table.items === table.origItems){
      table.items = [].concat(table.origItems);
    }

    if(table.sortedColName && table.sortedColName === this.name){
      table.sortAscending = !table.sortAscending;
    }
    else{
      table.sortedColName = this.name;
      table.sortAscending = true;
    }

    table.items = table.items.sort((a : any, b : any) => {
      let aCol : any = a[this.name];
      let bCol : any = b[this.name];
      
      aCol = typeof aCol === "string" ? aCol : aCol.toString();
      bCol = typeof bCol === "string" ? bCol : bCol.toString();

      if(table.sortAscending){
        return aCol.localeCompare(bCol);
      }
      else{
        return bCol.localeCompare(aCol);
      }
    })
  }
}
