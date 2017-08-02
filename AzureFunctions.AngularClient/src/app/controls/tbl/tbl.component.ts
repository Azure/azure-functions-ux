import { AppNode } from './../../tree-view/app-node';
import { Dom } from './../../shared/Utilities/dom';
import { KeyCodes } from './../../shared/models/constants';
import { TblThComponent } from './tbl-th/tbl-th.component';
import { FormGroup } from '@angular/forms';
import { Input, OnChanges, SimpleChange, ElementRef, ViewChild, AfterViewInit, ViewChildren, ContentChild, ContentChildren, QueryList, Inject } from '@angular/core';
import { Component, OnInit, forwardRef } from '@angular/core';

export interface TableItem {
  type: 'row' | 'group';
}

@Component({
  selector: 'tbl',
  template: `
  <table
    #tbl
    [class]='tblClass'
    (focus)='onFocus($event)'
    (click)='onClick($event)'
    (keydown)="onKeyPress($event)"
    role="grid"
    [attr.aria-label]="name">
      <ng-content></ng-content>
  </table>`,
  exportAs: 'tbl'
})
export class TblComponent implements OnInit, OnChanges {
  @Input() name: string | null;
  @Input() tblClass = 'tbl';
  @Input() items: TableItem[];
  // groupColName will be what col items are sorted by within individual groups
  // if no grouping is done in the table it is null
  @Input() groupColName: string | null;
  @ContentChildren(forwardRef(() => TblThComponent)) headers: QueryList<TblThComponent>;

  @ViewChild('tbl') table: ElementRef;

  public sortedColName: string;
  public sortAscending: boolean;
  // groupedBy is the name of the tbl-th component which is currently being used to group elements
  public groupedBy = 'none';

  private _origItems: any[];
  private _focusedRowIndex = -1;
  private _focusedCellIndex = -1;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    const items = changes['items'];
    if (items) {
      this.items = items.currentValue;
      this._origItems = items.currentValue;

      (<HTMLTableElement>this.table.nativeElement).tabIndex = 0;
    }
  }

  // A table should only get focus on the first time someone has tabbed over
  // to the table, or if the table has updated by receiving a new "items" property.
  // After that, each individual cell will get its own focus, but the parent
  // tbl component will continue to get the keypress and mouse click events thrown.
  onFocus(event: FocusEvent) {

    (<HTMLTableElement>this.table.nativeElement).tabIndex = -1;
    this._focusedRowIndex = 0;
    this._focusedCellIndex = 0;

    const rows = this._getRows();
    const cell = this._getCurrentCellOrReset(rows);
    if (cell) {
      Dom.setFocus(cell);
    }
  }

  onClick(e: MouseEvent) {

    // If someone clicks on a cell directly, then we'll have to figure out
    // which cell and row that click event belonged to and update our
    // knowledge of it.
    const cell = this._findParentCell(<HTMLElement>e.srcElement);
    const row = this._findParentRow(<HTMLElement>e.srcElement);

    if (row && cell) {
      const rows = this._getRows();
      const rowIndex = this._findElemIndex(rows, row);
      const cells = this._getCells(row);
      const cellIndex = this._findElemIndex(cells, cell);

      if (rowIndex && cellIndex) {
        this._clearFocusOnCell(rows, this._focusedRowIndex, this._focusedCellIndex);
        this._setFocusOnCell(rows, rowIndex, cellIndex);
      }
    }
  }

  // Gets called for any keypresses that occur whenever the focus is currently
  // on the table.  Most of the handling here should be for keyboard navigation
  // like up/down/left/right and enter keys.
  onKeyPress(event: KeyboardEvent) {
    if (event.keyCode === KeyCodes.arrowRight) {

      const rows = this._getRows();
      this._clearFocusOnCell(rows, this._focusedRowIndex, this._focusedCellIndex);
      this._setFocusOnCell(rows, this._focusedRowIndex, this._focusedCellIndex + 1);

    } else if (event.keyCode === KeyCodes.arrowLeft) {

      const rows = this._getRows();
      this._clearFocusOnCell(rows, this._focusedRowIndex, this._focusedCellIndex);
      this._setFocusOnCell(rows, this._focusedRowIndex, this._focusedCellIndex - 1);

    } else if (event.keyCode === KeyCodes.arrowDown) {

      const rows = this._getRows();
      this._clearFocusOnCell(rows, this._focusedRowIndex, this._focusedCellIndex);
      this._setFocusOnCell(rows, this._focusedRowIndex + 1, this._focusedCellIndex);
      this._scrollIntoView(rows[this._focusedRowIndex]);
      event.preventDefault(); // Don't allow to bubble outside of table

    } else if (event.keyCode === KeyCodes.arrowUp) {

      const rows = this._getRows();
      this._clearFocusOnCell(rows, this._focusedRowIndex, this._focusedCellIndex);
      this._setFocusOnCell(rows, this._focusedRowIndex - 1, this._focusedCellIndex);
      this._scrollIntoView(rows[this._focusedRowIndex]);
      event.preventDefault(); // Don't allow to bubble outside of table

    } else if (event.keyCode === KeyCodes.enter) {

      // On "enter", we'll "click" on the current cell
      const rows = this._getRows();
      const curCell = this._getCurrentCellOrReset(rows);
      if (curCell) {
        curCell.click();

        setTimeout(() => {
          this._setFocusOnCell(rows, this._focusedRowIndex, this._focusedCellIndex);
        }, 0);
      }

    } else if (event.keyCode === KeyCodes.escape) {

      // If a control within a cell is currently selected, hitting escape will cause the 
      // focus to switch to the containing cell instead.
      const rows = this._getRows();
      const curCell = this._getCurrentCellOrReset(rows, true /* force set focus on cell */);
      if (curCell) {
        this._clearFocusOnCell(rows, this._focusedRowIndex, this._focusedCellIndex);
        Dom.setFocus(curCell);
      }
    }
  }

  // elems is not exactly an array, and Angular doesn't give us the proper
  // types for some reason, so you can't use methods like "find" or "findIndex".
  // I'm not sure what the proper type is so I'm just treating it like an array
  // without "findIndex"
  private _findElemIndex(elems: NodeList, elem: HTMLElement) {

    for (let i = 0; i < elems.length; i++) {
      if (elems[i] === elem) {
        return i;
      }
    }

    return -1;
  }

  private _findParentCell(elem: HTMLElement): HTMLTableCellElement {
    while (elem) {
      if (elem.tagName === 'TH' || elem.tagName === 'TD') {
        return <HTMLTableCellElement>elem;
      }

      elem = elem.parentElement;
    }

    return null;
  }

  private _findParentRow(elem: HTMLElement): HTMLTableRowElement {
    while (elem) {
      if (elem.tagName === 'TR') {
        return <HTMLTableRowElement>elem;
      }

      elem = elem.parentElement;
    }

    return null;
  }

  // Get the current selected cell from list of rows.  If the table has
  // changed for some reason and the cell doesn't exist, then just reset the selection.
  private _getCurrentCellOrReset(rows: NodeListOf<HTMLTableRowElement>, forceCellSelection?: boolean) {
    if (this._focusedRowIndex >= 0 && this._focusedRowIndex < rows.length) {
      const rowCells = this._getCells(rows[this._focusedRowIndex]);
      if (this._focusedCellIndex >= 0 && this._focusedCellIndex < rowCells.length) {
        if (forceCellSelection) {
          return rowCells[this._focusedCellIndex];
        } else {
          return Dom.getTabbableControl(rowCells[this._focusedCellIndex]);
        }

      } else {
        this._focusedRowIndex = -1;
        this._focusedCellIndex = -1;
      }
    } else {
      this._focusedRowIndex = -1;
      this._focusedCellIndex = -1;
    }

    return null;
  }

  private _scrollIntoView(elem: HTMLElement) {
    Dom.scrollIntoView(elem, window.document.body);
  }

  private _getRows() {
    return (<HTMLTableElement>this.table.nativeElement).querySelectorAll('tr');
  }

  // Grab either TH or TD cells
  private _getCells(row: HTMLTableRowElement) {
    const cells = row.querySelectorAll('th');
    return cells.length > 0 ? cells : row.querySelectorAll('td');
  }

  private _clearFocusOnCell(
    rows: NodeListOf<HTMLTableRowElement>,
    rowIndex: number,
    cellIndex: number) {

    let srcRow: HTMLTableRowElement;
    if (rowIndex >= 0 && rowIndex < rows.length) {
      srcRow = rows[rowIndex];
    }

    if (srcRow) {
      const srcCells = this._getCells(srcRow);

      if (cellIndex >= 0 && cellIndex < srcCells.length) {
        const control = Dom.getTabbableControl(srcCells[cellIndex]);
        Dom.clearFocus(control);
      }
    }
  }

  private _setFocusOnCell(
    rows: NodeListOf<HTMLTableRowElement>,
    rowIndex: number,
    cellIndex: number
  ) {
    let destRow: HTMLTableRowElement;

    // We have to recompute the "final" row and cell indices because it's
    // possible that the table has changed since the last time we set
    // rowIndex/cellIndex.
    let finalRowIndex = -1;
    let finalCellIndex = -1;

    if (rowIndex >= 0 && rowIndex < rows.length) {
      finalRowIndex = rowIndex;
      destRow = rows[finalRowIndex];
    } else if (rows.length > 0) {
      // The # of rows in table has changed and rowIndex no longer exists.

      if (rowIndex === -1) {
        finalRowIndex = 0;
        destRow = rows[0];
      } else {
        finalRowIndex = rows.length - 1;
        destRow = rows[finalRowIndex];
      }
    }

    if (destRow) {
      const destCells = this._getCells(destRow);
      let destCell: HTMLTableCellElement;

      if (cellIndex >= 0 && cellIndex < destCells.length) {
        finalCellIndex = cellIndex;
        destCell = destCells[finalCellIndex];
      } else if (destCells.length > 0) {
        // The # of cells in the current row has either changed, or we've
        // navigated up/down to a row with a different # of cells.

        if (cellIndex === -1) {
          finalCellIndex = 0;
          destCell = destCells[0];
        } else {
          finalCellIndex = destCells.length - 1;
          destCell = destCells[finalCellIndex];
        }

      }

      if (destCell) {
        // A cell can contain a "tab-able" control within it.  So search within
        // the cell and set focus on it instead of the cell if one is found.
        const control = Dom.getTabbableControl(destCell);
        Dom.setFocus(control);
      }
    }

    this._focusedRowIndex = finalRowIndex;
    this._focusedCellIndex = finalCellIndex;
  }

  get origItems() {
    return this._origItems;
  }

  groupItems(name: string) {

    if (!this.groupColName) {
      throw ('Cannot sort within groups');
    }

    this.groupedBy = name;

    if (name === 'none') {
      this.items = this.items.filter(item => item.type !== 'group');
    } else {
      // sort the row items by groupColName
      const newItems = this.items.filter(item => item.type !== 'group')
        .sort((a: TableItem, b: TableItem) => {

          let aCol: any;
          let bCol: any;

          aCol = Object.byString(a, this.groupColName);
          bCol = Object.byString(b, this.groupColName);

          aCol = typeof aCol === 'string' ? aCol : aCol.toString();
          bCol = typeof bCol === 'string' ? bCol : bCol.toString();

          return bCol.localeCompare(aCol);
        });

      // determine uniqueGroup values
      const uniqueDictGroups = {};
      newItems.forEach(item => {
        uniqueDictGroups[item[name]] = item[name];
      });

      const uniqueGroups = [];
      for (const group in uniqueDictGroups) {
        if (uniqueDictGroups.hasOwnProperty(group)) {
          uniqueGroups.push(group);
        }
      }

      // push group items onto newItems
      uniqueGroups.forEach(groupName => {
        const newGroup = <TableItem>{ type: 'group' };
        newGroup[this.groupColName] = groupName;
        newItems.push(newGroup);
      });

      // reverse newItems to be all groups, sorted, followed by all rows, sorted then push onto items in correct order
      this.items = [];
      newItems.reverse();
      uniqueGroups.sort().forEach(group => {
        newItems.forEach(item => {
          if (item.type === 'group' && item[this.groupColName] === group) {
            this.items.push(item);
          } else if (item.type === 'row' && item[name] === group) {
            this.items.push(item);
          }
        });
      });

      this.sortAscending = true;
      this.sortedColName = this.groupColName;

    }

  }

}
