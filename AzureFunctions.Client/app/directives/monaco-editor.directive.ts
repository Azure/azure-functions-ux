import {Directive, EventEmitter, ElementRef} from '@angular/core';
import {MonacoModel} from '../models/monaco-model';

declare var monaco;
declare var require;

@Directive({
    selector: '[monacoEditor]',
    inputs: ['content', 'fileName', 'disabled'],
    outputs: ['onContentChanged', 'onSave']
})
export class MonacoEditorDirective {
    public onContentChanged: EventEmitter<string>;
    public onSave: EventEmitter<string>;

    private _language: string;
    private _content: string;
    private _disabled: boolean;
    private _editor: any;
    private _containerName: string;
    private _el: any;
    private _silent: boolean = false;

    constructor(private elementRef: ElementRef) {
        this.onContentChanged = new EventEmitter<string>();
        this.onSave = new EventEmitter<string>();

        this._el = elementRef.nativeElement;

        require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });

        var that = this;

        setTimeout(() => {
            require(['vs/editor/editor.main'], function (input: any) {

                that._editor = monaco.editor.create(that._el, {
                    value: that._content,
                    language: that._language,
                    readOnly: that._disabled
                });

                that._editor.onDidChangeModelContent(() => {
                    if (!that._silent) {
                        that.onContentChanged.emit(that._editor.getValue());
                    }
                });

                // This code does not work by some reason
                that._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
                    that.onSave.emit(that._editor.getValue());
                });

            });
        }, 0);
    }

    set content(str: string) {
        if (str) {
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
    }

    set disabled(value: boolean) {
        this._disabled = value;
    }

    set fileName(filename: string) {
        var extension = filename.split('.').pop().toLocaleLowerCase();

        switch (extension) {

            case "bat":
                this._language = "bat";
                break;
            case "csx":
                this._language = "csharp";
                break;
            case "fsx":
                this._language = "fsharp";
                break;
            case "js":
                this._language = "javascript";
                break;
            case "json":
                this._language = "json";
                break;
            case "ps1":
                this._language = "powershell";
                break;
            case "py":
                this._language = "python";
            // Monaco does not have sh, php
            case "sh":
            case "php":
                break;
        }

        if (this._editor) {
            monaco.editor.setModelLanguage(this._editor.getModel(), this._language);
        }
    }
}