import { Dom } from './../../shared/Utilities/dom';
import { Component, Input, ElementRef } from '@angular/core';
import { TableRowComponent } from './../table-row/table-row.component';

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
    styleUrls: ['./table-cell.component.scss']
})
export class TableCellComponent {

    // -------------------------------- INPUT BINDINGS --------------------------------

    //@Input() tabable: boolean;
    //@Input() editable: boolean;
    @Input() contentType: null | TableCellContentType = null;

    // --------------------------------------------------------------------------------


    // --------------------------- DYNAMIC "INPUT BINDINGS" ---------------------------

    public isFirstCell: boolean = false;
    public isLastCell: boolean = false;
    @Input() set position(position: null | 'first' | 'last') {
        this.isFirstCell = position === 'first';
        this.isLastCell = position === 'last';
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

    public get nativeElement(): HTMLTableCellElement {
        return this._eref ? this._eref.nativeElement : null;
    }

    constructor(
        private _eref: ElementRef,
        private _tableRow: TableRowComponent
    ) {
        let x = this._tableRow.editMode;
        x = !x;

        this._scrollIntoView(this._eref.nativeElement);
    }




    private _scrollIntoView(elem: HTMLElement) {
        Dom.scrollIntoView(elem, window.document.body);
    }
}




    //text
    // -gridNav
    // --reached by arrow: set focus on cell
    // --reached by click: set focus on cell
    //
    // --no way to transition to edit mode
    // --no way to move focus to cell content
    //
    // --row gets into editMode: set tabindex="-1" on cell
    //                           set tabindex="0" on content wrapper (?)


    //html
    // -gridNav
    // --reached by arrow: set focus on cell
    // --reached by click: set focus on cell
    //
    // --no way to transition to edit mode
    // --no way to move focus to cell content
    //
    // --row gets into editMode: set tabindex="-1" on cell
    //                           set tabindex="0" on content wrapper (?)


    //tabableHtml
    // -gridNavMode
    // --reached by arrow: set focus on first tabbable element
    // --reached by click on cell: set focus on cell
    // --reached by click on content: if clicked content element isn't tabable, set focus on first tabable element
    //
    // --no way to transition to edit mode
    //
    // --ENTER moves focus to first tabable element
    // --ESCAPE moves focus to cell level
    //
    // --row gets into editMode: set tabindex="-1" on cell
    //                           shouldn't need to set tabindex="0" on content


    //control
    // -gridNavMode
    // --reached by arrow: set focus on first tabbable element
    // --reached by click on cell: set focus on cell
    // --reached by click on content: if clicked content element isn't tabable, set focus on control / first tabable element
    //
    // --no way to transition to edit mode
    //
    // --ENTER clicks and moves focus to control / first tabable element
    // --ESCAPE moves focus to cell level
    // --SPACE has no effect a cell level, may have affect at control level
    //
    // --row gets into editMode: set tabindex="-1" on cell
    //                           shouldn't need to set tabindex="0" on content


    //editable
    // -gridNavMode
    // --reached by arrow: set focus on cell
    // --reached by click on cell: set focus on cell
    // --reached by click on editable content: focus goes on editable content
    //                                         row/cell go into editMode
    //
    // --F2/ENTER moves focus to editable content, transitions row into editMode
    //
    //
    // --row gets into editMode: set tabindex="-1" on cell
    //                           shouldn't need to set tabindex="0" on content


    //clickToEdit
    // -gridNavMode
    // --row becomes focused: switch from text to textbox/dropdown
    //
    // --reached by arrow: set focus on cell
    // --reached by click on cell: set focus on cell
    // --reached by click on editable content: focus goes on editable content
    //                                         row/cell go into editMode
    //
    // --F2/ENTER moves focus to editable content, transitions row into editMode
    // 
    //
    // --row gets into editMode: set tabindex="-1" on cell
    //                           shouldn't need to set tabindex="0" on content




    //ROW
    // "focused" + "active" + "docHasFocus"