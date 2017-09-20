import { Component, Input, ContentChildren, QueryList, ViewChild, ElementRef } from '@angular/core';
import { TableRowNotification, TableRowComponent } from './../table-row/table-row.component';
import { Subject } from 'rxjs/Subject';

export interface TableItem {
    type: 'row' | 'group';
}

@Component({
    selector: '[table-root]',
    styles: [`
        .tbl-focus-transfer{
            position: relative;
            height: 0px;
            width: 0px;
        }
    `],
    template:`
        <div #xfrBefore tabindex="0" class="tbl-focus-transfer" (focus)="handleFocusTransfer($event)"></div>
            <table
                #table
                [class]='tblClass'
                (click)='onClick($event)'
                (keydown)='onKeyPress($event)'
                role="grid"
                [attr.aria-label]="name">
                <ng-content></ng-content>
            </table>
        <div #xfrAfter tabindex="0" class="tbl-focus-transfer" (focus)="handleFocusTransfer($event)"></div>
    `,
})
export class TableRootComponent {
    @Input() name: string | null;
    @Input() tblClass = 'tbl';
    @Input() items: TableItem[];

    @ViewChild('table') tableRef: ElementRef;

    @ViewChild('xfrBefore') xfrBeforeRef: ElementRef;
    @ViewChild('xfrAfter') xfrAfterRef: ElementRef;
    private _focusTransferForced: boolean = false;

    @ContentChildren(TableRowComponent) rows: QueryList<TableRowComponent>;

    public RowNotificationsStream: Subject<TableRowNotification>;

    private _focusedRow: TableRowComponent = null;
    private _activeCellIndex: number = -1;
    private _editMode: boolean = false;
    private _focused: boolean = false;

    constructor(private _eref: ElementRef) {
        console.log(this._editMode);
        console.log(this._focused);
        console.log(this._eref === null);
    }

    public handleFocusTransfer(event: FocusEvent) {
        if (this._focusTransferForced) {
            this._focusTransferForced = false;
        }
        else {
            if (this._focusedRow && this._activeCellIndex) {
                this._focusedRow.setFocusOnCell(this._activeCellIndex);
            }
            else {
                this._resetFocus();
            }
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

    private _resetFocus() {

    }

    public onClick($event) {

    }

    public onKeyPress($event) {

    }
}