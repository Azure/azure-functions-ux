import { TblComponent, TableItem } from './../tbl.component';
import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'tbl-th',
  template: `
    <div class="sortable" (click)="onClick()" [activate-with-keys]>
      <ng-content class="sortable"></ng-content>
      <i class="fa chevron"
          [class.fa-chevron-up]="table?.sortedColName === name && table?.sortAscending"
          [class.fa-chevron-down]="table?.sortedColName !== name || (table?.sortedColName === name && !table?.sortAscending)"></i>
    </div>`
})
export class TblThComponent implements OnInit {

  @Input() name: string;

  public table: TblComponent;

  constructor(
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

  onClick() {
    // Wait one cycle to allow tabindex on focused element to get set to -1
    setTimeout(() => {
      this.sort();
    });
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
      table.items.sort((a: TableItem, b: TableItem) => this._evaluateOrder(a[this.name], b[this.name], table.sortAscending));
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

        tempItems.sort((a: TableItem, b: TableItem) => this._evaluateOrder(a[this.name], b[this.name], table.sortAscending));

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

  private _evaluateOrder(aCol: any, bCol: any, sortAscending: boolean): number {
    const typeOfA = typeof aCol;
    const typeOfB = typeof bCol;

    if (typeOfA !== typeOfB) {
      throw new Error(`tbl-th: type of aCol ${typeOfA} does not match type of bCol ${typeOfB}`);
    }

    if (typeOfA === 'number') {
      return sortAscending
        ? aCol - bCol
        : bCol - aCol;
    } else {
      return sortAscending
        ? aCol.toString().localeCompare(bCol.toString())
        : bCol.toString().localeCompare(aCol.toString());
    }
  }
}
