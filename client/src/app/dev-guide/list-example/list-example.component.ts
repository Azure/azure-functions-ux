import { Component } from '@angular/core';
import { HighlightService } from '../highlight.service';

@Component({
    selector: 'list-example',
    styleUrls: ['./list-example.component.scss'],
    templateUrl: './list-example.component.html'
})
export class ListExampleComponent {
    constructor(highlightService: HighlightService){
        this.htmlCode = highlightService.highlightString(this.htmlCode, 'html');
    }

    // tslint:disable-next-line:member-ordering
    public htmlCode = `
<div class="list-item">Item 1</div>
<div class="list-item">Item 2</div>
<div class="list-item">Item 3</div>
<div class="list-item selected">Item 4 selected</div>
    `;
}
