import { Injectable, Inject } from '@angular/core';

import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import 'prismjs';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-scss';

declare var Prism: any;

@Injectable()
export class HighlightService {

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    highlightAll() {
        if (isPlatformBrowser(this.platformId)) {
            Prism.highlightAll();
        }
    }

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