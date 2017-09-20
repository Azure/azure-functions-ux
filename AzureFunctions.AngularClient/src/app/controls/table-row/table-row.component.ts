import { Component, Input, AfterContentInit, ContentChildren, QueryList, ElementRef } from '@angular/core';
import { TableRootComponent } from './../table-root/table-root.component';
import { TableCellNotification, TableCellComponent } from './../table-cell/table-cell.component';
import { Subject } from 'rxjs/Subject';

export interface TableRowNotification {
    src: TableRowComponent,
    activeCellIndex: number,
    editMode: boolean,
    focused: boolean
}

@Component({
    selector: '[table-row]',
    template: `<ng-content></ng-content>`
})
export class TableRowComponent implements AfterContentInit {
    // -------------------------------- FOCUS TRACKING --------------------------------

    private _targetFocusState: 'focused' | 'blurring' | 'blurred' = 'blurred';

    // --------------------------------------------------------------------------------


    // --------------------------- DYNAMIC "INPUT BINDINGS" ---------------------------

    public isFocusedRow: boolean = false;
    @Input() set focusedRow(focusedRow: TableRowComponent) {
        const isFocusedRow = this === focusedRow;

        if (this.isFocusedRow !== isFocusedRow) {
            this.isFocusedRow = isFocusedRow;

            if (this.isFocusedRow) {
                // just gained focus
                this._addFocusTrackingListeners(); //Do this here?
            } else {
                // just lost focus
                this._removeFocusTrackingListeners(); //Do this here?
            }
        }
    }

    private _index: number;
    @Input() set index(index: number) {
        this._index = index;
    }

    private _editMode: boolean = false;
    @Input() set editMode(editMode: boolean) {
        this._editMode = editMode;
    }

    // --------------------------------------------------------------------------------

    //@Input() broadcaster: Subject;

    @ContentChildren(TableCellComponent) cells: QueryList<TableCellComponent>;

    //TO TABLE
    //src: TableRowComponent
    //editMode: boolean
    //focused: boolean
    //cellIndex: number


    //FROM CELLS
    //src: TableCellComponent
    //editMode: boolean

    public cellNotificationsStream: Subject<TableCellNotification>;

    private _activeCell: TableCellComponent = null;

    constructor(
        private _eref: ElementRef,
        private _table: TableRootComponent
    ) {
        this.cellNotificationsStream = new Subject<TableCellNotification>();
        this.cellNotificationsStream.subscribe(notification => {
            // Check if row has entered/left editMode
            if (this.editMode !== notification.editMode) {
                this.editMode = notification.editMode;
                this._handleEditModeChange();
            }

            // Check if activeCell has changed
            if (this._activeCell !== notification.src) {
                const previousActiveCell = this._activeCell;

                this._activeCell = notification.src;
                this._handleActiveCellChange(previousActiveCell);
            }

            // Push editMode to all cells
            if (this.cells) {
                this.cells.forEach(cell => {
                    cell.editMode = notification.editMode;
                });
            }

            // Push notification to table
            this._table.RowNotificationsStream.next({
                src: this,
                activeCellIndex: notification.src.index,
                editMode: notification.editMode,
                focused: true
            });
        });
    }

    private _handleEditModeChange() {
        if (this.editMode) {
            // just entered editMode
            this._addFocusTrackingListeners(); //Do this here?
        }
        else {
            // just left editMode
            this._removeFocusTrackingListeners(); //Do this here?
        }
    }

    private _handleActiveCellChange(previous: TableCellComponent) {
        // DO SOMETHING
    }


    public setFocusOnCell(cellIndex: number, activate: boolean = true) {




        let focusedElement: HTMLElement = null;

        // Position the focus-transfer elements of _table to match the location of the selected element        
        this._table.positionFocusTransferElements(focusedElement);
    }

    public ngAfterContentInit() {
        if (this.cells) {
            this._setCellPositions(/*this.cells*/);

            this.cells.changes.subscribe((cells: QueryList<TableCellComponent>) => {
                //console.log('change: ' + this.cells.length + ', ' + cells.length);
                this._setCellPositions(/*this.cells*/);
            })
            //this.cells.notifyOnChanges();
        }
    }

    private _setCellPositions(/*cells: QueryList<TableCellComponent>*/) {
        let i = 0
        this.cells.forEach(cell => {
            cell.index = i++;
            cell.position = null;
        });

        this.cells.first.position = 'first';
        this.cells.last.position = 'last';
    }


    // -------------------------------- FOCUS TRACKING --------------------------------

    private _addFocusTrackingListeners() {
        if (this._eref && this._eref.nativeElement) {
            this._eref.nativeElement.addEventListener('focus', (e) => { this.targetFocusListener(e); }, true);
            this._eref.nativeElement.addEventListener('blur', (e) => { this.targetBlurListener(e); }, true);
        }
    }

    private _removeFocusTrackingListeners() {
        if (this._eref && this._eref.nativeElement) {
            this._eref.nativeElement.removeEventListener('focus', (e) => { this.targetFocusListener(e); }, true);
            this._eref.nativeElement.removeEventListener('blur', (e) => { this.targetBlurListener(e); }, true);
        }
    }

    public targetBlurListener(event: FocusEvent) {
        this._targetFocusState = 'blurring';
        setTimeout(() => {
            if (this._targetFocusState !== 'focused') {
                this._targetFocusState = 'blurred';
                this.onTargetBlur();
            }
        });
    }

    public targetFocusListener(event: FocusEvent) {
        if (this._targetFocusState === 'blurred') {
            this.onTargetFocus();
        }
        this._targetFocusState = 'focused';
    }

    public onTargetBlur() {

    }

    public onTargetFocus() {

    }

    // --------------------------------------------------------------------------------
}