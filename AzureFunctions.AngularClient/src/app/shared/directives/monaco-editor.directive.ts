import {Directive, EventEmitter, ElementRef} from '@angular/core';
import {MonacoModel} from '../models/monaco-model';
import {GlobalStateService} from '../services/global-state.service';
import {FunctionApp} from '../function-app';
import {Observable, Subject} from 'rxjs/Rx';

declare var monaco;
declare var require;

@Directive({
    selector: '[monacoEditor]',
    inputs: ['content', 'fileName', 'disabled', 'functionAppInput'],
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
    private _silent: boolean = false;
    private _fileName: string;
    private _functionAppStream : Subject<FunctionApp>;
    private _functionApp : FunctionApp;

    constructor(public elementRef: ElementRef,
        private _globalStateService: GlobalStateService
        ) {

        this.onContentChanged = new EventEmitter<string>();
        this.onSave = new EventEmitter<string>();

        this._functionAppStream = new Subject<FunctionApp>();
        this._functionAppStream
            .distinctUntilChanged()
            .subscribe(functionApp =>{
                this._functionApp = functionApp;
                this.init();
            });
    }

    set functionAppInput(functionApp : FunctionApp){
        this._functionAppStream.next(functionApp);
    }

    set content(str: string) {
        if (!str) {
            str = "";
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

    set disabled(value: boolean) {
        if (value !== this._disabled) {
            this._disabled = value;
            if (this._editor) {
                this._editor.updateOptions({
                    readOnly: this._disabled
                })
            }
        }
    }

    set fileName(filename: string) {
        var extension = filename.split('.').pop().toLocaleLowerCase();
        this._fileName = filename;

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
                break;
            case "ts":
                this._language = "typescript";
                break;
            // Monaco does not have sh, php
            case "sh":
            case "php":
            default:
                this._language = undefined;
                break;
        }

        if (this._editor) {
            this.init();
            // This does not work for JSON
            //monaco.editor.setModelLanguage(this._editor.getModel(), this._language);
        }
    }



    public setLayout(width?: number, height?: number) {
        if (this._editor) {
            var layout = this._editor.getLayoutInfo();
            this._editor.layout({
                width: width ? width : layout.width,
                height: height ? height : layout.height,
            });
        }
    }


    private init() {
         //https://gist.github.com/chrisber/ef567098216319784c0596c5dac8e3aa
        //require.config({ paths: { 'vs': 'assets/monaco-editor/min/vs' } });
        this._globalStateService.setBusyState();

        var onGotAmdLoader = () => {
            // Load monaco
            if (window.location.hostname === "localhost") {
                (<any>window).require.config({ paths: { 'vs': '/ng2app/assets/monaco/min/vs' } });
            } else {
                (<any>window).require.config({ paths: { 'vs': '/assets/monaco/min/vs' } });
            }
            (<any>window).require(['vs/editor/editor.main'], () => {
                var that = this;

                //setTimeout(() => {
                //    require(['vs/editor/editor.main'], function (input: any) {

                        if (that._editor) {
                            that._editor.dispose();
                        }

                        if (that._fileName && that._fileName.toLowerCase() === "project.json") {
                            that._functionApp.getJson("/schemas/" + that._fileName.toLowerCase()).subscribe((schema) => {
                                monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                            schemas: [{
                                fileMatch: ["*"],
                                schema: schema
                            }]
                        });
                    });
                } else {
                    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                        schemas: []
                    });
                }

                that._editor = monaco.editor.create(that.elementRef.nativeElement, {
                    value: that._content,
                    language: that._language,
                    readOnly: that._disabled,
                    lineHeight: 17
                });

                that._editor.onDidChangeModelContent(() => {
                    if (!that._silent) {
                        that.onContentChanged.emit(that._editor.getValue());
                    }
                });

                // TODO: test with MAC
                that._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
                    that.onSave.emit(that._editor.getValue());
                });
                that._globalStateService.clearBusyState();

            });
                //}, 0);
                
            //});
        };

        // Load AMD loader if necessary
        if (!(<any>window).require) {
            var loaderScript = document.createElement('script');
            loaderScript.type = 'text/javascript';
            loaderScript.src = 'assets/monaco/vs/loader.js';
            loaderScript.addEventListener('load', onGotAmdLoader);
            document.body.appendChild(loaderScript);
        } else {
            onGotAmdLoader();
        }
    }
}