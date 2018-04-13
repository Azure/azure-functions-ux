import { Injectable} from '@angular/core';

import * as Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-scss';


@Injectable()
export class HighlightService {

    constructor() { }

    highlightString(s: string, l: 'typescript' | 'scss' | 'html'): string {
        if (l === 'typescript') {
            return Prism.highlight(s, Prism.languages.typescript);
        } else if (l === 'scss') {
            return Prism.highlight(s, Prism.languages.scss);
        } else {
            return Prism.highlight(s, Prism.languages.html);
        }
    }
}