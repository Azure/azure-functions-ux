import { Component } from '@angular/core';
import { HighlightService } from '../highlight.service';

@Component({
  selector: 'button-example',
  styleUrls: ['./button-example.component.scss'],
  templateUrl: './button-example.component.html',
})
export class ButtonExampleComponent {
  constructor(highlightService: HighlightService) {
    this.htmlCode = highlightService.highlightString(this.htmlCode, 'html');
  }

  // tslint:disable-next-line:member-ordering
  public htmlCode = `
<!-- Standard button -->
<button class="custom-button">custom-button</button>

<!-- Inverted button -->
<button class="custom-button-invert">custom-button-invert</button>

<!-- Standard disabled button -->
<button class="custom-button" disabled>custom-button disabled</button>
    `;
}
