import { Component, Output, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'search-box',
    templateUrl: './search-box.component.html',
    styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent {
    @Input() placeholder: string;
    @Input() value = '';
    @Input() warning = false;
    @Input() ariaLabel: string | null;
    @Output() onInputChange = new Subject<string>();
    @Output() onClear = new Subject<void>();

    @ViewChild('searchTextBox') searchTextBox;


    constructor() { }

    onKeyUp(event: any) {
        if (event.keyCode === 27) { // ESC
            this.onClearClick(event);
        } else {
            this.onInputChange.next(this.value);
        }
    }

    onClearClick(event: any) {
        this.value = "";
        this.onClear.next(null);
    }

    focus() {
        this.searchTextBox.nativeElement.focus();
    }

}
