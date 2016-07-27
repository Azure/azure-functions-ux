import {Component, OnInit, EventEmitter, QueryList, OnChanges, Input, SimpleChange, ViewChild, ViewChildren} from '@angular/core';
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
import {FileExplorerComponent} from './file-explorer.component';
import {GlobalStateService} from '../services/global-state.service';
import {BusyStateComponent} from './busy-state.component';
import {ErrorEvent} from '../models/error-event';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';

@Component({
    selector: 'function-dev',
    templateUrl: 'templates/function-dev.component.html',
    styleUrls: ['styles/function-dev.style.css'],
    directives: [
        AceEditorDirective,
        FunctionDesignerComponent,
        LogStreamingComponent,
        CopyPreComponent,
        FileExplorerComponent,
        BusyStateComponent
    ],
    pipes: [TranslatePipe]
})
export class FunctionDevComponent implements OnChanges {
    @ViewChild(FileExplorerComponent) fileExplorer: FileExplorerComponent;
    @ViewChildren(BusyStateComponent) BusyStates: QueryList<BusyStateComponent>;
    @Input() selectedFunction: FunctionInfo;
    public disabled: boolean;
    public functionInfo: FunctionInfo;
    public functionUpdate: Subscription;
    public scriptFile: VfsObject;
    public content: string;
    public fileName: string;
    public inIFrame: boolean;

    public configContent: string;
    public webHookType: string;
    public authLevel: string;
    public secrets: FunctionSecrets;
    public isHttpFunction: boolean;

    public runResult: RunFunctionResult;
    public running: Subscription;
    public showFunctionInvokeUrl: boolean = false;

    public showFileExplorer: boolean;

    private updatedContent: string;
    private updatedTestContent: string;
    private functionSelectStream: Subject<FunctionInfo>;
    private selectedFileStream: Subject<VfsObject>;

    constructor(private _functionsService: FunctionsService,
                private _broadcastService: BroadcastService,
                private _portalService: PortalService,
                private _globalStateService: GlobalStateService,
                private _translateService: TranslateService) {

        this.selectedFileStream = new Subject<VfsObject>();
        this.selectedFileStream
            .distinctUntilChanged((x, y) => x.href === y.href)
            .switchMap(file => {
                if (this.fileExplorer)
                    this.fileExplorer.setBusyState();
                return Observable.zip(this._functionsService.getFileContent(file), Observable.of(file), (c, f) => ({content: c, file: f}));
            })
            .subscribe((res: {content: string, file: VfsObject}) => {
                this.content = res.content;
                this.scriptFile = res.file;
                this.fileName = res.file.name;
                if (this.fileExplorer)
                    this.fileExplorer.clearBusyState();
            }, e => this._globalStateService.clearBusyState());

        this.functionSelectStream = new Subject<FunctionInfo>();
        this.functionSelectStream
            .distinctUntilChanged()
            .switchMap(fi => {
                this.disabled = _broadcastService.getDirtyState("function_disabled");
                this._globalStateService.setBusyState();
                return Observable.zip(
                    fi.clientOnly ? Observable.of({}) : this._functionsService.getSecrets(fi),
                    this._functionsService.getFunction(fi),
                    this._functionsService.getFunctionErrors(fi),
                    (s, f, e) => ({ secrets: s, functionInfo: f, errors: e}))
            })
            .subscribe((res: {secrets: any, functionInfo: FunctionInfo, errors: string[]}) => {
                if (res.errors) {
                    res.errors.forEach(e => this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.functionDev_functionErrorMessage, { name: res.functionInfo.name, error: e }),
                        details: this._translateService.instant(PortalResources.functionDev_functionErrorDetails, { error: e })
                    }));
                } else {
                    this._functionsService.getHostErrors()
                        .subscribe(errors => errors.forEach(e => this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: this._translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e }),
                            details: this._translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e })
                        })));
                }

                this._globalStateService.clearBusyState();
                this.functionInfo = res.functionInfo;
                this.setInvokeUrlVisibility();
                this.fileName = this.functionInfo.script_href.substring(this.functionInfo.script_href.lastIndexOf('/') + 1);
                this.scriptFile = {name: this.fileName, href: this.functionInfo.script_href, mime: 'file'}
                this.selectedFileStream.next(this.scriptFile);

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
        this.selectedFileStream.unsubscribe();
        this.functionSelectStream.unsubscribe();
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
        this._globalStateService.setBusyState();
        return this._functionsService.saveFile(this.scriptFile, this.updatedContent, this.functionInfo)
            .subscribe(r => {
                if (!dontClearBusy)
                    this._globalStateService.clearBusyState();
                if (typeof r !== 'string' && r.isDirty) {
                    r.isDirty = false;
                    this._broadcastService.clearDirtyState('function');
                    this._portalService.setDirtyState(false);
                }
                this.content = this.updatedContent;
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
            this.saveScript().add(() => setTimeout(() => this.runFunction(), 200));
        } else {
            var busyComponent = this.BusyStates.toArray().find(e => e.name === 'run-busy');
            busyComponent.setBusyState();
            var testData = typeof this.updatedTestContent !== 'undefined' ? this.updatedTestContent : this.functionInfo.test_data;
            this.running = this._functionsService.runFunction(this.functionInfo, testData)
                .subscribe(r => { this.runResult = r; busyComponent.clearBusyState(); delete this.running; });
        }
    }

    cancelCurrentRun() {
        this.BusyStates.toArray().find(e => e.name === 'run-busy').clearBusyState();
        if (this.running) {
            this.running.unsubscribe();
            delete this.running;
        }
    }

    toggleShowHideFileExplorer() {
        this.showFileExplorer = !this.showFileExplorer;
    }
}
