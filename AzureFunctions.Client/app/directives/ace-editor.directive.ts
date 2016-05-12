import {Directive, EventEmitter, ElementRef} from '@angular/core';
import {AceEditor} from '../models/ace-editor';

declare var ace: any;

@Directive({
    selector: '[aceEditor]',
    inputs: ['content', 'fileName', 'height', 'readOnly'],
    outputs: ['onContentChanged', 'onSave']
})
export class AceEditorDirective {
    private editor: AceEditor;
    public onContentChanged: EventEmitter<string>;
    public onSave: EventEmitter<string>;
    private initialHeight: number;
    private silent: boolean;

    constructor(private elementRef: ElementRef) {
        this.silent = false;
        this.onContentChanged = new EventEmitter<string>();
        this.onSave = new EventEmitter<string>();
        this.initialHeight = window.innerHeight;

        let el = elementRef.nativeElement;
        el.classList.add('editor');
        el.style.width = '100%';
        ace.config.set('themePath', '/ace/themes');
        ace.require('ace/ext/language_tools');

        // https://github.com/sevin7676/Ace.Tern
        ace.config.loadModule('ace/ext/tern', () => {
            this.editor.setOptions({
                /**
                 * Either `true` or `false` or to enable with custom options pass object that
                 * has options for tern server: http://ternjs.net/doc/manual.html#server_api
                 * If `true`, then default options will be used
                 */
                enableTern: {
                    /* http://ternjs.net/doc/manual.html#option_defs */
                    defs: ['browser', 'ecma5'],
                    /* http://ternjs.net/doc/manual.html#plugins */
                    plugins: {
                        doc_comment: {
                            fullDocs: true
                        }
                    },
                },
                /**
                 * when using tern, it takes over Ace's built in snippets support.
                 * this setting affects all modes when using tern, not just javascript.
                 */
                enableSnippets: true,
                /**
                 * when using tern, Ace's basic text auto completion is enabled still by deafult.
                 * This settings affects all modes when using tern, not just javascript.
                 * For javascript mode the basic auto completion will be added to completion results if tern fails to find completions or if you double tab the hotkey for get completion (default is ctrl+space, so hit ctrl+space twice rapidly to include basic text completions in the result)
                 */
                enableBasicAutocompletion: true,
            });
        });

        this.editor = ace.edit(el);
        this.editor.setTheme('ace/theme/visualstudio');
        this.editor.getSession().setTabSize(4);
        this.editor.getSession().setUseSoftTabs(true);
        this.editor.$blockScrolling = Infinity;
        this.editor.setOptions({
            'showPrintMargin': false,
            'fontSize': 14,
            'enableBasicAutocompletion': true
        });

        this.editor.on('change', (e) => {
            // (Attempt to) separate user change from programatical
            // https://github.com/ajaxorg/ace/issues/1547
            if (!this.silent) {
                this.onContentChanged.emit(this.editor.getValue());
            }
        });



        this.editor.commands.addCommand({
            name: 'saveItem',
            bindKey: {
                win: 'Ctrl-S',
                mac: 'Command-S',
                sender: 'editor|cli'
            },
            exec: () => this.onSave.emit(this.editor.getValue())
        });

        this.resizeAce();
        this.editor.focus();
        // Attach event handler to set new Ace height on browser resize
        window.onresize = () => this.resizeAce();
    }

    set height(h: number) {
        this.initialHeight = h;
        this.resizeAce();
    }

    set content(str: string) {
        str = str || '';
        if (str === this.editor.getValue()) return;
        this.silent = true;
        this.editor.session.setValue(str);
        this.silent = false;
        this.editor.clearSelection();
        this.editor.moveCursorTo(0, 0);
        this.editor.focus();
    }

    set fileName(fileName: string) {
        this.editor.session.setMode(this.getMode(fileName));
    }

    set readOnly(value: boolean) {
        this.editor.setReadOnly(value);
    }

    getMode(filename: string): string {
        var _config = (/^(web|app).config$/i);
        var _csproj = (/.(cs|vb)proj$/i);
        var _xdt = (/.xdt$/i);
        var _aspnet = (/.(cshtml|asp|aspx|csx)$/i);
        var syntax_mode = 'ace/mode/text';
        var modelist = ace.require('ace/ext/modelist');
        syntax_mode = modelist.getModeForPath(filename).mode;
        if (syntax_mode === 'ace/mode/text') {
            if (
                filename.match(_config) ||
                filename.match(_csproj) ||
                filename.match(_xdt)
            ) {
                syntax_mode = 'ace/mode/xml';
            }
            if (filename.match(_aspnet)) {
                syntax_mode = 'ace/mode/csharp';
            }
        }
        return syntax_mode;
    }

    resizeAce() {
        // http://stackoverflow.com/questions/11584061/
        var new_height = (this.initialHeight - 270) + 'px';
        this.elementRef.nativeElement.style.height = new_height;
        this.editor.resize();
    }
}