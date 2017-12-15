import { TblComponent, TableItem } from './../tbl.component';
import { Component, OnInit, Input, ElementRef, OnDestroy } from '@angular/core';
import { Subscription as RxSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'tbl-th',
  template: `
    <div class="sortable" (click)="onClick()" [activate-with-keys]>
      <ng-content class="sortable"></ng-content>
      <i class="fa chevron"
          [class.fa-chevron-up]="table.sortedColName === name && table.sortAscending"
          [class.fa-chevron-down]="table.sortedColName !== name || (table.sortedColName === name && !table.sortAscending)"></i>
    </div>`
})
export class TblThComponent implements OnInit, OnDestroy {

  @Input() name: string;

  public table: TblComponent;

  private _tableResetSub: RxSubscription;

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

  ngOnDestroy() {
    this._clearTableResetSub();
  }

  onClick() {
    // Wait one cycle to allow tabindex on focused element to get set to -1
    setTimeout(() => {
      this.sort();
    });
  }

  private _setupTableResetSub() {
    // Re-sort the table if necessary whenever its data is reloaded
    this._tableResetSub = this.table.contentReset.subscribe(() => {
      this.sort(true);
    });
  }

  private _clearTableResetSub() {
    if (this._tableResetSub) {
      this._tableResetSub.unsubscribe();
      this._tableResetSub = null;
    }
  }

  public setTable(table: TblComponent) {
    if (this.table === table) {
      return;
    } else {
      this._clearTableResetSub();

      if (table) {
        this.table = table;
        this._setupTableResetSub();
      }
    }
  }

  // When isReSort is true, it means that the table data has been reloaded (so it is no longer sorted).
  // If this is the column by which the table was sorted by prior to the reaload, we should perform a
  // sort and honor the current value of sortAscending
  sort(isReSort?: boolean) {

    if (isReSort && this.table.sortedColName !== this.name) {
      // The table was not sorted by this column prior to reload, so don't sort by this column.
      return;
    }

    const table = this.table;

    // Make a copy so that we don't sort the original list
    if (table.items === table.origItems) {
      table.items = [].concat(table.origItems);
    }

    if (table.sortedColName && table.sortedColName === this.name) {
      // If this is a re-sort, we don't toggle the order
      table.sortAscending = isReSort ? table.sortAscending : !table.sortAscending;
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
