import {Component, OnInit, EventEmitter, QueryList} from 'angular2/core';
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
    selector: 'function-dev',
    templateUrl: 'templates/function-dev.component.html',
    styleUrls: ['styles/function-dev.style.css'],
    inputs: ['selectedFunction'],
    directives: [
        AceEditorDirective,
        FunctionRunComponent,
        FunctionDesignerComponent,
        LogStreamingComponent
    ]
})
export class FunctionDevComponent {
    public functionInfo: FunctionInfo;
    public scriptFile: VfsObject;
    public content: string;
    public fileName: string;
    public inIFrame: boolean;

    public scriptContent: string;
    public configContent: string;
    public webHookType: string;
    public secrets: FunctionSecrets;
    public isCode: boolean;
    public isHttpFunction: boolean;

    private updatedContent: string;
    private functionSelectStream: Subject<FunctionInfo>;

    constructor(private _functionsService: FunctionsService) {
        this.functionSelectStream = new Subject<FunctionInfo>();
        this.functionSelectStream
            .distinctUntilChanged()
            .switchMap(fi =>
                Observable.zip(
                    this._functionsService.getFileContent(fi.script_href),
                    fi.clientOnly ? Observable.of({}) : this._functionsService.getSecrets(fi),
                    this._functionsService.getFunction(fi),
                    (c, s, f) => ({ content: c, secrets: s, functionInfo: f }))
            )
            .subscribe((res: any) => {
                this.functionInfo = res.functionInfo;
                var fileName = this.functionInfo.script_href.substring(this.functionInfo.script_href.lastIndexOf('/') + 1);
                this.fileName = fileName;
                this.scriptFile = { href: this.functionInfo.script_href, name: fileName };
                this.content = res.content;

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

    saveScript() {
        // Only save if the file is dirty
        if (!this.scriptFile.isDirty) return;

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
