import { KeyCodes } from './../../shared/models/constants';
import { Component, Input, AfterContentInit, ContentChildren, QueryList, ElementRef, forwardRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CustomFormGroup } from './../click-to-edit/click-to-edit.component';
import { TableRootComponent } from './../table-root/table-root.component';
import { TableCellComponent } from './../table-cell/table-cell.component';

@Component({
    selector: '[table-row]',
    template: `<ng-content></ng-content>`,
    host: {
        '(keydown)': 'onKeyDown($event)'
    }
})
export class TableRowComponent implements AfterContentInit, OnDestroy {
    public group: CustomFormGroup;
    @Input('group') set origGroup(group: FormGroup) {
        this.group = group as CustomFormGroup;
    }

    private _targetFocusState: 'focused' | 'blurring' | 'blurred' = 'blurred';
    private _focusTrackingListenersAdded = false;

    public active = false;
    public index: number;

    @ContentChildren(forwardRef(() => TableCellComponent)) cells: QueryList<TableCellComponent>;
    public activeCell: TableCellComponent = null;

    constructor(private _eref: ElementRef, public parentTable: TableRootComponent) {
    }

    // --------------------------- DYNAMIC "INPUT STREAMS" ---------------------------

    public setActive(active: boolean) {
        if (this.active !== active) {
            this.active = active;

            if (this.active) {
                if (this.parentTable.editMode) {
                    this._addFocusTrackingListeners();
                }
            } else {
                this._removeFocusTrackingListeners();
            }
        }
    }

    public setIndex(index: number) {
        this.index = index;
    }

    public setActiveCell(activeCell: TableCellComponent) {
        this.activeCell = activeCell;
        this.setActive(true);
        this.parentTable.setActiveRow(this);

        if (this.activeCell) {
            this.parentTable.positionFocusTransferElements(this.activeCell.nativeElement);

            if (this.activeCell.editable) {
                this.setEditMode(true);
            }
        }
    }

    public setEditMode(editMode: boolean, activeCell?: TableCellComponent) {
        if (editMode != this.parentTable.editMode) {
            this.parentTable.setEditMode(editMode);
            this._handleEditModeChange();
        }

        if (activeCell) {
            this.activeCell = activeCell;
        }
    }

    // --------------------------------------------------------------------------------

    private _handleEditModeChange() {
        if (this.parentTable.editMode) {
            // just entered editMode
            this._addFocusTrackingListeners();
        } else {
            // just left editMode
            this._removeFocusTrackingListeners();
        }


        if (this.group) {
            this.group.msStayInEditMode = this.parentTable.editMode;
        }
    }

    public setFocusOnCell(cellIndex: number, activate: boolean = true) {
        if (cellIndex === null) {
            cellIndex = (this.activeCell && this.activeCell.index) ? this.activeCell.index : 0;
        }

        if (cellIndex === -1 || cellIndex >= this.cells.length) {
            cellIndex = this.cells.length - 1;
        }

        this.activeCell = this.cells.toArray()[cellIndex];

        if (activate) {
            this.setActive(true);

            const focusedElement = this.activeCell.setFocus(true);

            // Position the focus-transfer elements of _table to match the location of the selected element
            this.parentTable.positionFocusTransferElements(focusedElement);
        }
    }

    public ngAfterContentInit() {
        if (this.cells) {
            this._setCellPositions();

            this.cells.changes.subscribe((cells: QueryList<TableCellComponent>) => {
                this._setCellPositions();
            })
            this.cells.notifyOnChanges();
        }
    }

    public ngOnDestroy() {
        this._removeFocusTrackingListeners();
    }

    private _setCellPositions() {
        if (this.cells) {
            let i = 0;
            this.cells.forEach(cell => {
                cell.setPosition(i, i === 0, i === this.cells.length - 1);
                i++;
            })
        }
    }


    public onKeyDown(event: KeyboardEvent) {
        if (this.parentTable.editMode) {
            this._handleEditModeKeyDown(event);
        } else {
            this._handleStaticModeKeyDown(event);
        }
    }

    private _handleEditModeKeyDown(event: KeyboardEvent) {
        let preventDefault = true;

        if (event.keyCode === KeyCodes.tab) {
            const source = event.target as HTMLElement;
            if (source.classList.contains('boundary-left') && event.shiftKey) {
                this.setFocusOnCell(-1);
            } else if (source.classList.contains('boundary-right') && !event.shiftKey) {
                this.setFocusOnCell(0);
            } else {
                preventDefault = false;
            }
        } else {
            preventDefault = false;
        }

        if (preventDefault) {
            event.preventDefault();
        }
    }

    private _handleStaticModeKeyDown(event: KeyboardEvent) {
        let activeCell = null;

        let preventDefault = true;

        if (event.keyCode === KeyCodes.arrowLeft) {
            activeCell = this.cells.toArray()[Math.max(0, this.activeCell.index - 1)];
        } else if (event.keyCode === KeyCodes.arrowRight) {
            activeCell = this.cells.toArray()[Math.min(this.cells.length - 1, this.activeCell.index + 1)];
        } else if (event.keyCode === KeyCodes.home && !event.ctrlKey) {
            activeCell = this.cells.first;
        } else if (event.keyCode === KeyCodes.end && !event.ctrlKey) {
            activeCell = this.cells.last;
        } else {
            preventDefault = false;
        }

        if (preventDefault) {
            event.preventDefault();
        }

        if (activeCell && activeCell !== this.activeCell) {
            this.activeCell = activeCell;
            this.activeCell.setFocus(true);
        }
    }



    // -------------------------------- FOCUS TRACKING --------------------------------

    private _addFocusTrackingListeners() {
        if (this._eref && this._eref.nativeElement && !this._focusTrackingListenersAdded) {
            this._eref.nativeElement.addEventListener('focus', (e) => { this.targetFocusListener(e); }, true);
            this._eref.nativeElement.addEventListener('blur', (e) => { this.targetBlurListener(e); }, true);
            this._focusTrackingListenersAdded = true;
        }
    }

    private _removeFocusTrackingListeners() {
        if (this._eref && this._eref.nativeElement && this._focusTrackingListenersAdded) {
            this._eref.nativeElement.removeEventListener('focus', (e) => { this.targetFocusListener(e); }, true);
            this._eref.nativeElement.removeEventListener('blur', (e) => { this.targetBlurListener(e); }, true);
            this._focusTrackingListenersAdded = false;
            this._targetFocusState = 'blurred';
        }
    }

    public targetBlurListener(event: FocusEvent) {
        this._targetFocusState = 'blurring';
        setTimeout(() => {
            if (this._targetFocusState !== 'focused') {
                this._targetFocusState = 'blurred';
                this.onTargetBlur(event.target as HTMLElement);
            }
        });
    }

    public targetFocusListener(event: FocusEvent) {
        if (this._targetFocusState === 'blurred') {
            this.onTargetFocus();
        }
        this._targetFocusState = 'focused';
    }

    public onTargetBlur(element: HTMLElement) {
        let resetFocus = (element === document.activeElement);
        let activeCell = this._findContainingChild(element);

        if (activeCell === null) {
            resetFocus = false;
            activeCell = this.cells && this.cells.length > 0 ? this.cells.first : null;
        }

        this.setEditMode(false, activeCell);

        if (this.activeCell) {
            this.parentTable.positionFocusTransferElements(this.activeCell.nativeElement);
        }

        if (resetFocus) {
            setTimeout(() => {
                this.activeCell.nativeElement.focus();
            });
        }
    }

    public onTargetFocus() {

    }

    private _findContainingChild(element: HTMLElement): TableCellComponent {
        if (this.cells) {
            for (let i = 0; i < this.cells.length; i++) {
                const cell = this.cells.toArray()[i];
                if (cell.nativeElement === element || (cell.nativeElement as HTMLElement).contains(element)) {
                    return cell;
                }
            }

        }
        return null;
    }
    // --------------------------------------------------------------------------------
}