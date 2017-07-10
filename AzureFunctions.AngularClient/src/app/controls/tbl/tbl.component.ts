import { KeyCodes } from './../../shared/models/constants';
import { TblThComponent } from './tbl-th/tbl-th.component';
import { FormGroup } from '@angular/forms';
import { Input, OnChanges, SimpleChange, ElementRef, ViewChild, AfterViewInit, ViewChildren, ContentChild, ContentChildren, QueryList } from '@angular/core';
import { Component, OnInit, forwardRef } from '@angular/core';

export interface TblItem {
  data: any
}

interface Coordinates {
  rowIndex: number;
  cellIndex: number;
}

@Component({
  selector: 'tbl',
  template: `
  <table
    #tbl
    [class]='tblClass'
    tabindex='0'
    (focus)='onFocus($event)'
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
      const rows = this._getRows();
      if (rows.length > 0) {
        const row = rows[0];

        const cells = this._getCells(row);

        if (cells.length > 0) {
          cells[0].classList.add('focused');
        }

        this._focusedRowIndex = 0;
        this._focusedCellIndex = 0;
      }
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

    } else if (event.keyCode === KeyCodes.arrowUp) {

      const rows = this._getRows();
      this._clearFocusOnCell(rows, this._focusedRowIndex, this._focusedCellIndex);
      this._setFocusOnCell(rows, this._focusedRowIndex - 1, this._focusedCellIndex);

    }

    event.preventDefault();
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
    cellIndex: number){

    let srcRow: HTMLTableRowElement;
    const coordinates: Coordinates = {
      rowIndex: -1,
      cellIndex: -1
    };

    if (rowIndex >= 0 && rowIndex < rows.length) {
      srcRow = rows[rowIndex];
    }

    if (srcRow) {
      const srcCells = this._getCells(srcRow);

      if (cellIndex >= 0 && cellIndex < srcCells.length) {
        srcCells[cellIndex].classList.remove('focused');
      }
    }
  }

  private _setFocusOnCell(
    rows: NodeListOf<HTMLTableRowElement>,
    rowIndex: number,
    cellIndex: number
  ){
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
        destCell.classList.add('focused');
      }
    }

    this._focusedRowIndex = finalRowIndex;
    this._focusedCellIndex = finalCellIndex;
  }

  get origItems() {
    return this._origItems;
  }
}
