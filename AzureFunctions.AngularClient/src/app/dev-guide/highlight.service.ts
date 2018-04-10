import { Injectable} from '@angular/core';

import 'prismjs';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-scss';

declare var Prism: any;

@Injectable()
export class HighlightService {

    constructor() { }

    highlightString(s: string, l: 'typescript' | 'scss' | 'html'): string {
        if (l === 'typescript') {
            return Prism.highlight(s, Prism.languages.typescript, l);
        } else if (l === 'scss') {
            return Prism.highlight(s, Prism.languages.scss, l);
        } else {
            return Prism.highlight(s, Prism.languages.html, l);
        }
    }
}