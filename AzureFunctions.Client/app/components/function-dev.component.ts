import {Component, OnInit, EventEmitter, QueryList, OnChanges, Input, SimpleChange} from '@angular/core';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionDesignerComponent} from './function-designer.component';
import {LogStreamingComponent} from './log-streaming.component';
import {FunctionConfig} from '../models/function-config';
import {Observable, Subject, Subscription} from 'rxjs/Rx';
import {FunctionSecrets} from '../models/function-secrets';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {PortalService} from '../services/portal.service';
import {BindingType} from '../models/binding';
import {CopyPreComponent} from './copy-pre.component';
import {RunFunctionResult} from '../models/run-function-result';

@Component({
    selector: 'function-dev',
    templateUrl: 'templates/function-dev.component.html',
    styleUrls: ['styles/function-dev.style.css'],
    directives: [
        AceEditorDirective,
        FunctionDesignerComponent,
        LogStreamingComponent,
        CopyPreComponent
    ]
})
export class FunctionDevComponent implements OnChanges {
    @Input() selectedFunction: FunctionInfo;
    public disabled: boolean;
    public functionInfo: FunctionInfo;
    public functionUpdate: Subscription;
    public scriptFile: VfsObject;
    public content: string;
    public fileName: string;
    public inIFrame: boolean;

    public scriptContent: string;
    public configContent: string;
    public webHookType: string;
    public authLevel: string;
    public secrets: FunctionSecrets;
    public isCode: boolean;
    public isHttpFunction: boolean;

    public runResult: RunFunctionResult;
    public running: Subscription;
    public showFunctionInvokeUrl: boolean = false;

    private updatedContent: string;
    private updatedTestContent: string;
    private functionSelectStream: Subject<FunctionInfo>;

    constructor(private _functionsService: FunctionsService,
                private _broadcastService: BroadcastService,
                private _portalService: PortalService) {

        this.isCode = true;
        this.functionSelectStream = new Subject<FunctionInfo>();
        this.functionSelectStream
            .distinctUntilChanged()
            .switchMap(fi => {
                this.disabled = _broadcastService.getDirtyState("function_disabled");
                this._broadcastService.setBusyState();
                return Observable.zip(
                    this._functionsService.getFileContent(fi.script_href),
                    fi.clientOnly ? Observable.of({}) : this._functionsService.getSecrets(fi),
                    this._functionsService.getFunction(fi),
                    (c, s, f) => ({ content: c, secrets: s, functionInfo: f }))
            })
            .subscribe((res: any) => {
                this._broadcastService.clearBusyState();
                this.functionInfo = res.functionInfo;
                this.setInvokeUrlVisibility();
                var fileName = this.functionInfo.script_href.substring(this.functionInfo.script_href.lastIndexOf('/') + 1);
                this.fileName = fileName;
                this.scriptFile = { href: this.functionInfo.script_href, name: fileName };
                this.content = res.content;

                this.configContent = JSON.stringify(this.functionInfo.config, undefined, 2);
                var inputBinding = (this.functionInfo.config && this.functionInfo.config.bindings
                    ? this.functionInfo.config.bindings.find(e => !!e.webHookType)
                    : null);
                if (inputBinding) {
                    this.webHookType = inputBinding.webHookType;
                } else {
                    delete this.webHookType;
                }

                inputBinding = (this.functionInfo.config && this.functionInfo.config.bindings
                    ? this.functionInfo.config.bindings.find(e => !!e.authLevel)
                    : null);
                if (inputBinding) {
                    this.authLevel = inputBinding.authLevel;
                } else {
                    delete this.authLevel;
                }

                inputBinding = (this.functionInfo.config && this.functionInfo.config.bindings
                    ? this.functionInfo.config.bindings.find(e => e.type === 'httpTrigger')
                    : null);
                if (inputBinding) {
                    this.isHttpFunction = true;
                } else {
                    this.isHttpFunction = false;
                }
                this.createSecretIfNeeded(res.functionInfo, res.secrets);
            });

        this.functionUpdate = _broadcastService.subscribe(BroadcastEvent.FunctionUpdated, (newFunctionInfo: FunctionInfo) => {
            this.functionInfo.config = newFunctionInfo.config;
            this.setInvokeUrlVisibility();
         });

    }

    ngOnDestroy() {
        this.functionUpdate.unsubscribe();
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

    private setInvokeUrlVisibility()
    {
        var b = this.functionInfo.config.bindings.find((b) => {
            return b.type === BindingType.httpTrigger.toString();
        });
        this.showFunctionInvokeUrl = b ? true : false;
    }

    ngOnChanges(changes: {[key: string]: SimpleChange}) {
        if (changes['selectedFunction']) {
            delete this.updatedTestContent;
            delete this.runResult;
            this.functionSelectStream.next(changes['selectedFunction'].currentValue);
        }
    }

    //TODO: change to field;
    get functionInvokeUrl(): string {
        var code = '';
        if (this.webHookType === 'github' || this.authLevel === 'anonymous') {
            code = '';
        } else if (this.isHttpFunction && this.secrets && this.secrets.key) {
            code = `?code=${this.secrets.key}`;
        } else if (this.isHttpFunction && this._functionsService.HostSecrets.functionKey) {
            code = `?code=${this._functionsService.HostSecrets.functionKey}`;
        }
        return this._functionsService.getFunctionInvokeUrl(this.functionInfo) + code;
    }

    saveScript(dontClearBusy?: boolean) {
        // Only save if the file is dirty
        if (!this.scriptFile.isDirty) return;
        this._broadcastService.setBusyState();
        return this._functionsService.saveFile(this.scriptFile, this.updatedContent)
            .subscribe(r => {
                if (!dontClearBusy)
                    this._broadcastService.clearBusyState();
                if (typeof r !== 'string' && r.isDirty) {
                    r.isDirty = false;
                    this._broadcastService.clearDirtyState('function');
                    this._portalService.setDirtyState(false);
                }
            });
    }

    contentChanged(content: string) {
        if (!this.scriptFile.isDirty) {
            this.scriptFile.isDirty = true;
            this._broadcastService.setDirtyState('function');
            this._portalService.setDirtyState(true);
        }
        this.updatedContent = content;
    }

    testContentChanged(content: string) {
        this.updatedTestContent = content;
    }

    saveTestData() {
        if (typeof this.updatedTestContent !== 'undefined' && this.updatedTestContent !== this.functionInfo.test_data) {
            this.functionInfo.test_data = this.updatedTestContent;
            this._functionsService.updateFunction(this.functionInfo)
                .subscribe(r => Object.assign(this.functionInfo, r));
        }
    }

    runFunction() {
        this.saveTestData();
        if (this.scriptFile.isDirty) {
            this.saveScript(true).add(() => setTimeout(() => this.runFunction(), 200));
        } else {
            this._broadcastService.setBusyState();
            var testData = typeof this.updatedTestContent !== 'undefined' ? this.updatedTestContent : this.functionInfo.test_data;
            this.running = this._functionsService.runFunction(this.functionInfo, testData)
                .subscribe(r => { this.runResult = r; this._broadcastService.clearBusyState(); delete this.running; });
        }
    }

    cancelCurrentRun() {
        this._broadcastService.clearBusyState();
        if (this.running) {
            this.running.unsubscribe();
            delete this.running;
        }
    }
}
