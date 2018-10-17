import { Component } from '@angular/core';
import { HighlightService } from '../highlight.service';

@Component({
  selector: 'color-example',
  styleUrls: ['./color-example.component.scss'],
  templateUrl: './color-example.component.html',
})
export class ColorExampleComponent {
  constructor(highlightService: HighlightService) {
    this.globalCss = highlightService.highlightString(this.globalCss, 'scss');
  }

  // tslint:disable-next-line:member-ordering
  public globalCss = `
// Normal style
.myclass{
    color: $default-text-color;
}

// Dark theme version
#app-root[theme=dark]{
    .myclass{
        color: $default-text-color-dark;
    }
}
    `;
}
