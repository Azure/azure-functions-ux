import { TblComponent, TableItem } from './../tbl.component';
import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'tbl-th',
  template: `
    <div class="sortable" (click)="sort()">
      <ng-content class="sortable"></ng-content>
      <i class="fa chevron"
          [class.fa-chevron-up]="table.sortedColName === name && table.sortAscending"
          [class.fa-chevron-down]="table.sortedColName !== name || (table.sortedColName === name && !table.sortAscending)"></i>
    </div>`
})
export class TblThComponent implements OnInit {

  @Input() name: string;

  constructor(
    public table: TblComponent,
    private _el: ElementRef) {
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
    const element = <HTMLElement>this._el.nativeElement;
    if (element.parentElement
      && element.parentElement.parentElement
      && element.parentElement.parentElement.tagName === 'TR') {

      element.parentElement.parentElement.classList.add('header-row');
    }
  }

  sort() {
    const table = this.table;

    // Make a copy so that we don't sort the original list
    if (table.items === table.origItems) {
      table.items = [].concat(table.origItems);
    }

    if (table.sortedColName && table.sortedColName === this.name) {
      table.sortAscending = !table.sortAscending;
    } else {
      table.sortedColName = this.name;
      table.sortAscending = true;
    }

    if (table.groupedBy === 'none') {
      table.items = table.items.sort((a: TableItem, b: TableItem) => {
        let aCol: any;
        let bCol: any;

        aCol = Object.byString(a, this.name);
        bCol = Object.byString(b, this.name);

        aCol = typeof aCol === 'string' ? aCol : aCol.toString();
        bCol = typeof bCol === 'string' ? bCol : bCol.toString();

        if (table.sortAscending) {
          return aCol.localeCompare(bCol);
        } else {
          return bCol.localeCompare(aCol);
        }
      });
    } else {

      if (!table.groupColName) {
        throw new Error('Cannot sort within groups');
      }

      let finalItems = [];
      let tempItems = [];
      const groupItems = [];
      const rowItems = [];

      table.items.forEach(item => {
        if (item.type === 'group') {
          groupItems.push(item);
        } else if (item.type === 'row') {
          rowItems.push(item);
        }
      });

      groupItems.forEach(group => {
        finalItems.push(group);
        rowItems.forEach(row => {
          if (row[table.groupedBy] === group[this.table.groupColName]) {
            tempItems.push(row);
          }
        });

        tempItems.sort((a: TableItem, b: TableItem) => {
          if (table.sortAscending) {
            return a[this.name].localeCompare(b[this.name]);
          } else {
            return b[this.name].localeCompare(a[this.name]);
          }
        });

        finalItems = finalItems.concat(tempItems);
        tempItems = [];
      });

      table.items = finalItems;
    }
  }

  setFocused(isSet: boolean) {
    const element = <HTMLElement>this._el.nativeElement;
    if (element.parentElement) {
      const th = <HTMLTableHeaderCellElement>element.parentElement;
      if (isSet) {
        th.classList.add('focused');
      } else {
        th.classList.remove('focused');
      }
    }
  }
}
