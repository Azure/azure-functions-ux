import { Dom } from './../../shared/Utilities/dom';
import { KeyCodes } from './../../shared/models/constants';
import { TblThComponent } from './tbl-th/tbl-th.component';
import { FormGroup } from '@angular/forms';
import { Input, OnChanges, SimpleChange, ElementRef, ViewChild, AfterViewInit, ViewChildren, ContentChild, ContentChildren, QueryList, Inject } from '@angular/core';
import { Component, OnInit, forwardRef } from '@angular/core';

export interface TblItem {
  data: any
}

@Component({
  selector: 'tbl',
  template: `
  <table
    #tbl
    [class]='tblClass'
    tabindex='0'
    (focus)='onFocus($event)'
    (blur)='onBlur($event)'
    (keydown)="onKeyPress($event)">
      <ng-content></ng-content>
  </table>`,
  exportAs: 'tbl'
})
export class TblComponent implements OnInit, OnChanges {
  @Input() tblClass = 'tbl';
  @Input() items: TblItem[];
  @ContentChildren(forwardRef(() => TblThComponent)) headers: QueryList<TblThComponent>;

  @ViewChild('tbl') table: ElementRef;

  public sortedColName: string;
  public sortAscending: boolean;

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
    }
  }

  onFocus(event: FocusEvent) {
    if (this._focusedRowIndex === -1 && this._focusedCellIndex === -1) {
      this._focusedRowIndex = 0;
      this._focusedCellIndex = 0;
    }

    const rows = this._getRows();
    const cell = this._getCurrentCellOrReset(rows);
    if (cell) {
      Dom.setFocus(cell);
    }
  }

  onBlur(event: FocusEvent) {
    const rows = this._getRows();
    const curCell = this._getCurrentCellOrReset(rows);
    if (curCell) {
      Dom.clearFocus(curCell);
    }
  }

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

    } else if (event.keyCode === KeyCodes.arrowUp) {

      const rows = this._getRows();
      this._clearFocusOnCell(rows, this._focusedRowIndex, this._focusedCellIndex);
      this._setFocusOnCell(rows, this._focusedRowIndex - 1, this._focusedCellIndex);
      this._scrollIntoView(rows[this._focusedRowIndex]);

    } else if (event.keyCode === KeyCodes.enter) {

      const rows = this._getRows();
      const curCell = this._getCurrentCellOrReset(rows);
      if (curCell) {
        curCell.click();
      }
    }

    if (event.keyCode !== KeyCodes.tab) {
      event.preventDefault();
    }
  }

  private _getCurrentCellOrReset(rows: NodeListOf<HTMLTableRowElement>) {
    if (this._focusedRowIndex >= 0 && this._focusedRowIndex < rows.length) {
      const rowCells = this._getCells(rows[this._focusedRowIndex]);
      if (this._focusedCellIndex >= 0 && this._focusedCellIndex < rowCells.length) {
        return Dom.getTabbableControl(rowCells[this._focusedCellIndex]);
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
    let finalRowIndex = -1;
    let finalCellIndex = -1;

    if (rowIndex >= 0 && rowIndex < rows.length) {
      finalRowIndex = rowIndex;
      destRow = rows[finalRowIndex];
    } else if (rows.length > 0) {
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
        if (cellIndex === -1) {
          finalCellIndex = 0;
          destCell = destCells[0];
        } else {
          finalCellIndex = destCells.length - 1;
          destCell = destCells[finalCellIndex];
        }

      }

      if (destCell) {
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
}
