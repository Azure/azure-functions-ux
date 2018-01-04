import { UserService } from './../services/user.service';
import { Directive, EventEmitter, ElementRef, Input, Output, HostBinding } from '@angular/core';
import 'rxjs/add/operator/distinctUntilChanged';

import { GlobalStateService } from '../services/global-state.service';
import { CacheService } from 'app/shared/services/cache.service';

declare var monaco;

@Directive({
    selector: '[monacoEditor]',
})
export class MonacoEditorDirective {
    @Output() public onContentChanged: EventEmitter<string>;
    @Output() public onSave: EventEmitter<string>;
    @Output() public onRun: EventEmitter<void>;
    @HostBinding('style.opacity') opacity: string = '1';

    private _language: string;
    private _content: string;
    private _disabled: boolean;
    private _editor: any;
    private _silent: boolean = false;
    private _fileName: string;
    private _theme: string;

    constructor(
        public elementRef: ElementRef,
        private _globalStateService: GlobalStateService,
        private _cacheService: CacheService,
        private _userService: UserService) {

        this.onContentChanged = new EventEmitter<string>();
        this.onSave = new EventEmitter<string>();
        this.onRun = new EventEmitter<void>();

        this._userService.getStartupInfo()
            .first()
            .subscribe(info => {
                this._theme = info.theme;
            });

        this.init();
    }

    @Input('content') set content(str: string) {
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

    @Input('disabled') set disabled(value: boolean) {
        if (value !== this._disabled) {
            this._disabled = value;
            if (this._editor) {
                this._editor.updateOptions({
                    readOnly: this._disabled
                });
                this.opacity = this._disabled ? '0.5' : '1';
            }
        }
    }

    @Input('fileName') set fileName(filename: string) {
        let extension = filename.split('.').pop().toLocaleLowerCase();
        this._fileName = filename;

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
            this.init();
            // This does not work for JSON
            // monaco.editor.setModelLanguage(this._editor.getModel(), this._language);
        }
    }



    public setLayout(width?: number, height?: number) {
        if (this._editor) {
            let layout = this._editor.getLayoutInfo();
            this._editor.layout({
                width: width ? width : layout.width,
                height: height ? height : layout.height,
            });
        }
    }


    private init() {
        this._globalStateService.setBusyState();

        let onGotAmdLoader = () => {
            (<any>window).require.config({ paths: { 'vs': 'assets/monaco/min/vs' } });
            (<any>window).require(['vs/editor/editor.main'], () => {
                let that = this;
                if (that._editor) {
                    that._editor.dispose();
                }

                const projectJson = 'project.json';
                const functionJson = 'function.json';
                const hostJson = 'host.json';
                let fileName = that._fileName || '';
                fileName = fileName.toLocaleLowerCase();
                if (fileName === projectJson || fileName === functionJson || fileName === hostJson) {
                    that.setMonacoSchema(fileName);
                } else {
                    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                        validate: true,
                        schemas: []
                    });
                }

                // compiler options
                monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.ES2015,
                });

                that._editor = monaco.editor.create(that.elementRef.nativeElement, {
                    value: that._content,
                    language: that._language,
                    readOnly: that._disabled,
                    lineHeight: 17,
                    theme: this._theme === 'dark' ? 'vs-dark' : 'vs'
                });
                this.opacity = this._disabled ? '0.5' : '1';

                that._editor.onDidChangeModelContent(() => {
                    if (!that._silent) {
                        that.onContentChanged.emit(that._editor.getValue());
                    }
                });

                // TODO: test with MAC
                that._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
                    that.onSave.emit(that._editor.getValue());
                });

                that._editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                    that.onRun.emit();
                });

                that._globalStateService.clearBusyState();

                // TODO: that._editor.addcommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_T, () => {
                // open existing function in new tab
                // if dirty ask to save? or save for them?
                // change view to to open in new tab
                // });

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

    setMonacoSchema(schemaName: string) {
        this._cacheService.get('assets/schemas/' + schemaName)
            .subscribe((schema) => {
                schema.additionalProperties = false;
                monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                    validate: true,
                    schemas: [{
                        fileMatch: ['*'],
                        schema: schema
                    }]
                });
            });
    }
}
