import { Subject } from 'rxjs/Subject';
import { AfterContentInit, Component, ViewChild, Input, Output } from '@angular/core';

declare var monaco;

@Component({
    selector: 'text-editor',
    templateUrl: './text-editor.component.html',
    styleUrls: ['./text-editor.component.scss']
})
export class TextEditorComponent implements AfterContentInit {
    @ViewChild('textEditorContainer') container;

    @Output() public onContentChanged = new Subject<string>();


    private _editor: any;
    private _language: string;
    private _content = '{}';
    private _disabled = false;
    private _theme = 'vs';
    private _silent = false;  // When true, editor doesn't emit events on content change

    public opacity = '1';

    constructor() {
    }

    ngAfterContentInit() {
        this._init();
    }

    private _init() {

        let onGotAmdLoader = () => {
            (<any>window).require.config({ paths: { 'vs': 'assets/monaco/min/vs' } });
            (<any>window).require(['vs/editor/editor.main'], () => {
                let that = this;
                if (that._editor) {
                    that._editor.dispose();
                }

                // const projectJson = 'project.json';
                // const functionJson = 'function.json';
                // const hostJson = 'host.json';
                // let fileName = that._fileName || '';
                // fileName = fileName.toLocaleLowerCase();
                // if (fileName === projectJson || fileName === functionJson || fileName === hostJson) {
                //     that.setMonacoSchema(fileName, that._functionApp);
                // } else {
                //     monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                //         validate: true,
                //         schemas: []
                //     });
                // }

                // compiler options
                monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.ES2015,
                });

                that._editor = monaco.editor.create(that.container.nativeElement, {
                    value: that._content,
                    language: that._language,
                    readOnly: that._disabled,
                    lineHeight: 17,
                    theme: this._theme === 'dark' ? 'vs-dark' : 'vs',
                    minimap: {
                        enabled: false
                    }
                });
                this.opacity = this._disabled ? '0.5' : '1';

                that._editor.onDidChangeModelContent(() => {
                    if (!that._silent) {
                        that.onContentChanged.next(that._editor.getValue());
                    }
                });

                // // TODO: test with MAC
                // that._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
                //     that.onSave.emit(that._editor.getValue());
                // });

                // that._editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                //     that.onRun.emit();
                // });

                // that._globalStateService.clearBusyState();

                // TODO: that._editor.addcommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_T, () => {
                // open existing function in new tab
                // if dirty ask to save? or save for them?
                // change view to to open in new tab
                // });

                that.resize();

            });
        };

        // Load AMD loader if necessary
        if (!(<any>window).require) {
            let loaderScript = document.createElement('script');
            loaderScript.type = 'text/javascript';
            loaderScript.src = 'assets/monaco/vs/loader.js';
            loaderScript.addEventListener('load', onGotAmdLoader);
            document.body.appendChild(loaderScript);
        } else {
            onGotAmdLoader();
        }
    }

    @Input() set content(str: string) {
        if (!str) {
            str = '';
        }

        if (this._editor && this._editor.getValue() === str) {
            return;
        }

        this._content = str;

        if (this._editor) {
            this._silent = true;
            this._editor.setValue(this._content);
            this._silent = false;
        }
    }

    @Input('fileName') set fileName(filename: string) {
        const extension = filename.split('.').pop().toLocaleLowerCase();

        switch (extension) {

            case 'bat':
                this._language = 'bat';
                break;
            case 'csx':
                this._language = 'csharp';
                break;
            case 'fsx':
                this._language = 'fsharp';
                break;
            case 'js':
                this._language = 'javascript';
                break;
            case 'json':
                this._language = 'json';
                break;
            case 'ps1':
                this._language = 'powershell';
                break;
            case 'py':
                this._language = 'python';
                break;
            case 'ts':
                this._language = 'typescript';
                break;
            // Monaco does not have sh, php
            default:
                this._language = undefined;
                break;
        }

        if (this._editor) {
            this._init();
            // This does not work for JSON
            // monaco.editor.setModelLanguage(this._editor.getModel(), this._language);
        }
    }

    private _setLayout(width?: number, height?: number) {
        if (this._editor) {
            let layout = this._editor.getLayoutInfo();
            this._editor.layout({
                width: width ? width : layout.width,
                height: height ? height : layout.height,
            });
        }
    }

    public resize() {
        this._setLayout(100, 100);

        setTimeout(() =>{
            const width = this.container.nativeElement.clientWidth;
            const height = this.container.nativeElement.clientHeight;
            this._setLayout(width - 4, height - 4);
        });
        
    }
}
