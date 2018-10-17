import { Component } from '@angular/core';
import { HighlightService } from '../highlight.service';

@Component({
  selector: 'typography-example',
  styleUrls: ['./typography-example.component.scss'],
  templateUrl: './typography-example.component.html',
})
export class TypographyExampleComponent {
  constructor(highlightService: HighlightService) {
    this.htmlCode = highlightService.highlightString(this.htmlCode, 'html');
  }
  // tslint:disable-next-line:member-ordering
  public htmlCode = `
<div class="header">
    <label>EXAMPLE</label>
    <h1>Heading 1</h1>
    <h2>Heading 2</h2>
    <h3>Heading 3</h3>
    <h4>Heading 4</h4>
    <label>Label</label>
    <a>Link</a>
    Regular text
</div>
`;
}
