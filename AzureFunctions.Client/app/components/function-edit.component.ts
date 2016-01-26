import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionRunComponent} from './function-run.component';
import {FunctionDesignerComponent} from './function-designer.component';
import {FunctionConfig} from '../models/function-config';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Rx';
import {FunctionSecrets} from '../models/function-secrets';

@Component({
    selector: 'function-edit',
    templateUrl: 'templates/function-edit.html',
    inputs: ['selectedFunction'],
    outputs: ['deleteSelectedFunction'],
    directives: [AceEditorDirective, FunctionRunComponent, FunctionDesignerComponent]
})
export class FunctionEditComponent {
    public functionInfo: FunctionInfo;
    public deleteSelectedFunction: EventEmitter<boolean>;
    public scriptFile: VfsObject;
    public content: string;
    public secrets: FunctionSecrets;
    private updatedContent: string;
    private functionSelectStream: Subject<FunctionInfo>;


    constructor(private _functionsService: FunctionsService) {
        this.deleteSelectedFunction = new EventEmitter<boolean>();
        this.functionSelectStream = new Subject<FunctionInfo>();
        this.functionSelectStream
            .distinctUntilChanged()
            .switchMap(fi =>
                Observable.zip(
                    this._functionsService.getFileContent(fi.script_href),
                    this._functionsService.getSecrets(fi),
                    (c, s) => ({ content: c, secrets: s, functionInfo: fi })
                )
            )
            .subscribe((res: any) => {
                this.functionInfo = res.functionInfo;
                var fileName = this.functionInfo.script_href.substring(this.functionInfo.script_href.lastIndexOf('/') + 1);
                this.scriptFile = { href: this.functionInfo.script_href, name: fileName };
                this.content = res.content;
                this.createSecretIfNeeded(res.functionInfo, res.secrets);
            });
    }

    private createSecretIfNeeded(fi: FunctionInfo, secrets: FunctionSecrets) {
        if (!secrets.webHookReceiverKey) {
            if (fi.config.bindings.input.some(e => !!e.webHookReceiver)) {
                //http://stackoverflow.com/a/8084248/3234163
                var secret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
                this._functionsService.setSecrets(fi, { webHookReceiverKey: secret })
                .subscribe(r => this.secrets = r);
            }
        } else {
            this.secrets = secrets;
        }
    }

    set selectedFunction(value: FunctionInfo) {
        this.functionSelectStream
            .next(value);
    }

    get functionInvokeUrl(): string {
        return this._functionsService.getFunctionInvokeUrl(this.functionInfo);
    }

    saveScript() {
        this._functionsService.saveFile(this.scriptFile, this.updatedContent)
            .subscribe(r => {
                if (typeof r !== 'string') {
                    r.isDirty = false;
                }
            });
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
                    this.deleteSelectedFunction.next(false);
                    this.deleteSelectedFunction.next(true);
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
}