import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionRunComponent} from './function-run.component';
import {FunctionDesignerComponent} from './function-designer.component';
import {LogStreamingComponent} from './log-streaming.component';
import {FunctionConfig} from '../models/function-config';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Rx';
import {FunctionSecrets} from '../models/function-secrets';

@Component({
    selector: 'function-edit',
    templateUrl: 'templates/function-edit.component.html',
    styleUrls: ['styles/function-edit.style.css'],
    inputs: ['selectedFunction'],
    outputs: ['deleteSelectedFunction'],
    directives: [AceEditorDirective, FunctionRunComponent, FunctionDesignerComponent, LogStreamingComponent]
})
export class FunctionEditComponent {
    public functionInfo: FunctionInfo;
    public deleteSelectedFunction: EventEmitter<boolean>;
    public scriptFile: VfsObject;
    public content: string;
    public scriptContent: string;
    public configContent: string;
    public webHookType: string;
    public secrets: FunctionSecrets;
    public isCode: boolean;
    public fileName: string;
    public isHttpFunction: boolean;
    private updatedContent: string;
    private functionSelectStream: Subject<FunctionInfo>;


    constructor(private _functionsService: FunctionsService) {
        this.isCode = true;
        this.deleteSelectedFunction = new EventEmitter<boolean>();
        this.functionSelectStream = new Subject<FunctionInfo>();
        this.functionSelectStream
            .distinctUntilChanged()
            .switchMap(fi =>
                Observable.zip(
                    this._functionsService.getFileContent(fi.script_href),
                    fi.clientOnly ? Observable.of({}) : this._functionsService.getSecrets(fi),
                    fi.clientOnly ? Observable.of(fi) : this._functionsService.getFunction(fi),
                    (c, s, f) => ({ content: c, secrets: s, functionInfo: f })
                )
            )
            .subscribe((res: any) => {
                this.functionInfo = res.functionInfo;
                var fileName = this.functionInfo.script_href.substring(this.functionInfo.script_href.lastIndexOf('/') + 1);
                this.fileName = fileName;
                this.scriptFile = { href: this.functionInfo.script_href, name: fileName };
                this.scriptContent = res.content;
                if (!this.functionInfo.clientOnly) {
                    this.configContent = JSON.stringify(this.functionInfo.config, undefined, 2);
                    this.content = this.isCode ? this.scriptContent : this.configContent;
                    var inputBinding = (this.functionInfo.config && this.functionInfo.config.bindings && this.functionInfo.config.bindings.input
                        ? this.functionInfo.config.bindings.input.find(e => !!e.webHookType)
                        : null);
                    if (inputBinding) {
                        this.webHookType = inputBinding.webHookType;
                    } else {
                        delete this.webHookType;
                    }
                    inputBinding = (this.functionInfo.config && this.functionInfo.config.bindings && this.functionInfo.config.bindings.input
                        ? this.functionInfo.config.bindings.input.find(e => e.type === 'httpTrigger')
                        : null);
                    if (inputBinding) {
                        this.isHttpFunction = true;
                    } else {
                        this.isHttpFunction = false;
                    }
                    this.createSecretIfNeeded(res.functionInfo, res.secrets);
                } else {
                    this.content = this.scriptContent;
                }
            });
    }

    private createSecretIfNeeded(fi: FunctionInfo, secrets: FunctionSecrets) {
        if (!secrets.key) {
            if (this.isHttpFunction) {
                //http://stackoverflow.com/a/8084248/3234163
                var secret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
                this._functionsService.setSecrets(fi, { key: secret })
                    .subscribe(r => this.secrets = r);
            } else {
                this.secrets = secrets;
            }
        } else {
            this.secrets = secrets;
        }
    }

    set selectedFunction(value: FunctionInfo) {
        this.functionSelectStream
            .next(value);
    }

    //TODO: change to field;
    get functionInvokeUrl(): string {
        var code = '';
        if (this.webHookType === 'genericJson' && this.secrets && this.secrets.key) {
            code = `?code=${this.secrets.key}`;
        } else if (this.isHttpFunction && this.secrets && this.secrets.key) {
            code = `?key=${this.secrets.key}`;
        } else if (this.isHttpFunction && this._functionsService.HostSecrets.functionKey) {
            code = `?key=${this._functionsService.HostSecrets.functionKey}`;
        }
        return this._functionsService.getFunctionInvokeUrl(this.functionInfo) + code;
    }

    get functionsCloneUrl(): string {
        var url = this._functionsService.getScmUrl();
        var siteName = url.substring(8, url.indexOf('.'));
        return `${url}/${siteName}.git`;
    }

    get logStreamingUrl(): string {
        return `${this._functionsService.getScmUrl()}/api/logstream/application`;
    }

    saveScript() {
        if (this.isCode) {
            this._functionsService.saveFile(this.scriptFile, this.updatedContent)
                .subscribe(r => {
                    if (typeof r !== 'string') {
                        r.isDirty = false;
                    }
                });
        } else {
            this._functionsService.saveFunction(this.functionInfo, JSON.parse(this.updatedContent))
                .subscribe(r => {
                    this.scriptFile.isDirty = false;
                    this.functionSelectStream.next(r);
                });
        }
    }

    contentChanged(content: string) {
        this.scriptFile.isDirty = true;
        this.updatedContent = content;
    }

    deleteFunction(functionInfo: FunctionInfo) {
        var result = confirm(`Are you sure you want to delete Function: ${functionInfo.name}?`);
        if (result)
            this._functionsService.deleteFunction(functionInfo)
                .subscribe(r => {
                    this.deleteSelectedFunction.emit(false);
                    this.deleteSelectedFunction.emit(true);
                });
    }

    //http://stackoverflow.com/q/8019534/3234163
    highlightText(event: Event) {
        var el: any = event.target;
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    changeEditor(type: string){
        if (type === 'code') {
            this.isCode = true;
            this.content = this.scriptContent;
            this.fileName = this.scriptFile.name;
        } else {
            this.isCode = false;
            this.content = this.configContent;
            this.fileName = 'function.js';
        }
    }

}