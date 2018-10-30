import { Component } from '@angular/core';
import { HighlightService } from '../highlight.service';

@Component({
  selector: 'svg-example',
  styleUrls: ['./svg-example.component.scss'],
  templateUrl: './svg-example.component.html',
})
export class SvgExampleComponent {
  constructor(highlightService: HighlightService) {
    this.htmlCode = highlightService.highlightString(this.htmlCode, 'html');
  }

  // tslint:disable-next-line:member-ordering
  public htmlCode = `
<label>Small</label>
<span load-image="image/delete.svg" class="icon-small"></span>

<label>Medium</label>
<span load-image="image/delete.svg" class="icon-medium"></span>

<Label>Large</Label>
<span load-image="image/delete.svg" class="icon-large"></span>
    `;
}
