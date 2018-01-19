import { KeyCodes } from './../../shared/models/constants';
import { Component, Input, ContentChildren, QueryList, ViewChild, ElementRef, forwardRef, OnChanges, SimpleChanges, AfterContentInit } from '@angular/core';
import { TableRowComponent } from './../table-row/table-row.component';

export interface TableItem {
    type: 'row' | 'group';
}

@Component({
    selector: 'table-root',
    styles: [`
        .tbl-focus-transfer{
            position: relative;
            height: 0px;
            width: 0px;
        }
    `],
    template: `
        <div #xfrBefore tabindex="0" class="tbl-focus-transfer" (focus)="onFocusXfr($event)"></div>
            <table
                #table
                [class]='tblClass'
                [tabindex]='!!activeRow ? -1 : 0'
                (keydown)='onKeyDown($event)'
                role="grid"
                [attr.aria-label]="name">
                <ng-content></ng-content>
            </table>
        <div #xfrAfter tabindex="0" class="tbl-focus-transfer" (focus)="onFocusXfr($event)"></div>
    `
})
export class TableRootComponent implements OnChanges, AfterContentInit {
    @Input() name: string | null;
    @Input() tblClass = 'tbl';
    @Input() items: TableItem[];

    @ViewChild('table') tableRef: ElementRef;
    @ViewChild('xfrBefore') xfrBeforeRef: ElementRef;
    @ViewChild('xfrAfter') xfrAfterRef: ElementRef;

    private _focusTransferForced: boolean = false;

    @ContentChildren(forwardRef(() => TableRowComponent)) rows: QueryList<TableRowComponent>;
    public activeRow: TableRowComponent = null;

    public editMode: boolean = false;

    constructor(private _eref: ElementRef) {
    }

    // --------------------------- DYNAMIC "INPUT STREAMS" ---------------------------

    public setActiveRow(activeRow: TableRowComponent) {
        if (this.activeRow !== activeRow) {
            if (this.activeRow) {
                this.activeRow.setActive(false);
            }
            this.activeRow = activeRow;
            this.editMode = false;
        }
    }

    public setEditMode(editMode: boolean) {
        this.editMode = editMode;
    }

    // --------------------------------------------------------------------------------

    ngOnChanges(changes: SimpleChanges) {
        if (changes['items']) {
            this.items = changes['items'].currentValue;

            // Whenever we update the table, we'll reset edit mode and set the first cell as active
            this.setEditMode(false);
            this._resetFocus(false);
        }
    }

    ngAfterContentInit() {
        this._resetFocus(false);

        if (this.rows) {
            this._setRowPositions();

            this.rows.changes.subscribe((rows: QueryList<TableRowComponent>) => {
                this._setRowPositions();
                setTimeout(() => {
                    const nativeElement = this._eref.nativeElement as HTMLElement
                    const hasFocus = nativeElement === document.activeElement || nativeElement.contains(document.activeElement);
                    this._resetFocus(hasFocus);
                })
            })
            this.rows.notifyOnChanges();
        }
    }

    private _resetFocus(activate: boolean = true) {
        if (this.activeRow) {
            this.activeRow.setActive(false);
        }

        this.activeRow = null;
        if (this.rows && this.rows.length > 0) {
            if (this.rows.first.cells && this.rows.first.cells.length > 0) {
                this.activeRow = this.rows.first;
                this.activeRow.setFocusOnCell(0, activate);
            }
        }

        if (!this.activeRow) {
            this._eref.nativeElement.focus();
            this.positionFocusTransferElements(this._eref.nativeElement);
        }
    }

    private _setRowPositions() {
        if (this.rows) {
            let i = 0;
            this.rows.forEach(row => {
                row.setIndex(i);
                i++;
            })
        }
    }

    // Positions the xfrBefore and xfrAfter elements to match the location of focusedElement
    public positionFocusTransferElements(focusedElement: HTMLElement) {
        const tableRect: ClientRect = this.tableRef.nativeElement ? this.tableRef.nativeElement.getBoundingClientRect() : null;
        const elementRect: ClientRect = focusedElement ? focusedElement.getBoundingClientRect() : null;
        const top = elementRect ? Math.round(elementRect.top - tableRect.top) : 0;
        const bottom = elementRect ? Math.round(elementRect.top - tableRect.bottom) : 0;
        const left = elementRect ? Math.round(elementRect.left - tableRect.left) : 0;

        this.xfrBeforeRef.nativeElement.style.top = top.toString() + "px";
        this.xfrBeforeRef.nativeElement.style.left = left.toString() + "px";

        this.xfrAfterRef.nativeElement.style.top = bottom.toString() + "px";
        this.xfrAfterRef.nativeElement.style.left = left.toString() + "px";
    }

    public onFocusXfr(event: FocusEvent) {
        if (this._focusTransferForced) {
            this._focusTransferForced = false;
        } else {
            if (this.activeRow) {
                this.activeRow.setFocusOnCell(null);
            } else {
                this._resetFocus();
            }
        }
    }

    public onKeyDown(event: KeyboardEvent) {
        if (this.editMode) {
            return;
        }

        if (this._handleTab(event)) {
            return;
        } else if (this._handleNavigation(event)) {
            return;
        }
    }

    private _handleTab(event: KeyboardEvent): boolean {
        if (event.keyCode !== KeyCodes.tab) {
            return false;
        }

        // Shift focus to tableIn or tableOut element before default tabbing behavior occurs.
        // The default tabbing behavior will then occur from the newly-focused cell, which will
        // move the focus outside of the component.
        this._focusTransferForced = true;
        if (event.shiftKey) {
            this.xfrBeforeRef.nativeElement.focus();
        } else {
            this.xfrAfterRef.nativeElement.focus();
        }
        return true;
    }

    private _handleNavigation(event: KeyboardEvent): boolean {
        let targetRow = null;
        let targetCellIndex = null;

        if (event.keyCode === KeyCodes.arrowUp) {
            if (this.activeRow !== this.rows.first) {
                targetRow = this.rows.toArray()[this.activeRow.index - 1];
                targetCellIndex = this.activeRow.activeCell.index;
            }
        } else if (event.keyCode === KeyCodes.arrowDown) {
            if (this.activeRow !== this.rows.last) {
                targetRow = this.rows.toArray()[this.activeRow.index + 1];
                targetCellIndex = this.activeRow.activeCell.index;
            }
        } else if (event.keyCode === KeyCodes.home && event.ctrlKey) {
            targetRow = this.rows.first;
            targetCellIndex = 0;
        } else if (event.keyCode === KeyCodes.end && event.ctrlKey) {
            targetRow = this.rows.last;
            targetCellIndex = -1;
        } else {
            return false;
        }

        event.preventDefault();

        if (targetRow) {
            if (targetRow != this.activeRow) {
                this.activeRow.setActive(false);
                this.activeRow = targetRow;
            }
            this.activeRow.setFocusOnCell(targetCellIndex);
        }

        return true;
    }
}