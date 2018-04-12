import { Dom } from './../../shared/Utilities/dom';
import { KeyCodes } from './../../shared/models/constants';
import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { TableRowComponent } from './../table-row/table-row.component';
import { PortalResources } from './../../shared/models/portal-resources';

export enum TableCellContentType {
    Text,
    Html,
    TabableHtml,
    TabableCmdOrCtrl,
    EditableInput,
    ClickToEdit
}

export interface TableCellNotification {
    src: TableCellComponent,
    editMode: boolean
}

@Component({
    selector: '[table-cell]',
    templateUrl: './table-cell.component.html',
    styleUrls: ['./table-cell.component.scss'],
    host: {
        '[tabindex]': '(parentRow.parentTable.editMode) ? -1 : 0',
        '(click)': 'onClick($event)',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class TableCellComponent {
    public Resources = PortalResources;

    @Input() editable: boolean;

    @ViewChild('boundaryLeft') boundaryLeft: ElementRef;
    @ViewChild('boundaryRight') boundaryRight: ElementRef;

    public isFirstCell: boolean = false;
    public isLastCell: boolean = false;
    public index: number;

    constructor(
        private _eref: ElementRef,
        public parentRow: TableRowComponent
    ) { }

    // --------------------------- DYNAMIC "INPUT STREAMS" ---------------------------

    public setPosition(index: number, isFirstCell?: boolean, isLastCell?: boolean) {
        this.index = index;
        this.isFirstCell = isFirstCell;
        this.isLastCell = isLastCell;
    }

    // --------------------------------------------------------------------------------

    public get nativeElement(): HTMLTableCellElement {
        return this._eref ? this._eref.nativeElement : null;
    }

    private _scrollIntoView(elem: HTMLElement) {
        Dom.scrollIntoView(elem, window.document.body);
    }


    public onClick(event: MouseEvent) {
        this.parentRow.setActiveCell(this);
    }

    public onKeyDown(event: KeyboardEvent) {
        if (this.parentRow.parentTable.editMode) {
            this._handleEditModeKeyDown(event);
        } else {
            this._handleStaticModeKeyDown(event);
        }
    }

    private _handleEditModeKeyDown(event: KeyboardEvent) {

        if (event.keyCode === KeyCodes.escape) {
            // Turn off edit mode
            this.parentRow.setEditMode(false, this);

            // If a control within a cell is currently selected, move to the containing cell instead.
            if (this._eref.nativeElement !== document.activeElement) {
                this._eref.nativeElement.focus();
            }
        }
    }

    private _handleStaticModeKeyDown(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.enter) {
            if (event.target === this._eref.nativeElement) {
                // The cell is currently selected, so "click" on the first tab-able element in the cell.
                // Then set the focus on the first tab-able element in the cell.
                const target = Dom.getTabbableControl(this._eref.nativeElement);
                target.click();

                setTimeout(() => {
                    const target = Dom.getTabbableControl(this._eref.nativeElement, ['boundary-left', 'boundary-right']);
                    target.focus();
                    if (this.editable) {
                        this.parentRow.setEditMode(true);
                    }
                });
            } else {
                // An element inside the cell is currently selected, so "click" on the that element.
                (event.target as HTMLElement).click();
                if (this.editable) {
                    this.parentRow.setEditMode(true);
                }
            }
        } else if (event.keyCode === KeyCodes.f2) {
            if (this.editable && event.target === this._eref.nativeElement) {
                // The cell is currently selected and is "editable"
                this.parentRow.setEditMode(true);
                setTimeout(() => {
                    const target = Dom.getTabbableControl(this._eref.nativeElement, ['boundary-left', 'boundary-right']);
                    target.focus();
                });
            }
        } else if (event.keyCode === KeyCodes.escape) {
            // If a control within a cell is currently selected, switch to the containing cell instead.
            if (this._eref.nativeElement !== document.activeElement) {
                this._eref.nativeElement.focus();
            }
        }
    }

    public setFocus(scrollIntoView?: boolean): HTMLElement {
        let target = null;

        if (this.parentRow.parentTable.editMode) {

            if (this.boundaryLeft && this.boundaryRight) {
                target = this.boundaryLeft.nativeElement === document.activeElement ? this.boundaryRight.nativeElement : this.boundaryLeft.nativeElement;
            } else if (this.isFirstCell && this.boundaryLeft) {
                target = this.boundaryLeft.nativeElement;
            } else if (this.isLastCell && this.boundaryRight) {
                target = this.boundaryRight.nativeElement;
            }
        } else {
            target = this._eref.nativeElement;

            if (!this.editable) {
                target = Dom.getTabbableControl(this._eref.nativeElement);
            }
        }

        if (target) {
            target.focus();

            if (scrollIntoView) {
                this._scrollIntoView(target);
            }
        }

        return target;
    }
}