import { FileUtilities } from './../shared/Utilities/file';
import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
import { ConfigService } from './../shared/services/config.service';
import { Component, QueryList, OnChanges, Input, SimpleChange, ViewChild, ViewChildren, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';

import { FunctionInfo } from '../shared/models/function-info';
import { VfsObject } from '../shared/models/vfs-object';
// import {FunctionDesignerComponent} from '../function-designer/function-designer.component';
import { LogStreamingComponent } from '../log-streaming/log-streaming.component';
import { FunctionSecrets } from '../shared/models/function-secrets';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { FunctionApp } from '../shared/function-app'
import { PortalService } from '../shared/services/portal.service';
import { BindingType } from '../shared/models/binding';
import { RunFunctionResult } from '../shared/models/run-function-result';
import { FileExplorerComponent } from '../file-explorer/file-explorer.component';
import { GlobalStateService } from '../shared/services/global-state.service';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import { PortalResources } from '../shared/models/portal-resources';
import { TutorialEvent, TutorialStep } from '../shared/models/tutorial';
import { MonacoEditorDirective } from '../shared/directives/monaco-editor.directive';
import { BindingManager } from '../shared/models/binding-manager';
import { RunHttpComponent } from '../run-http/run-http.component';
import { ErrorIds } from '../shared/models/error-ids';
import { HttpRunModel } from '../shared/models/http-run';
import { FunctionKeys } from '../shared/models/function-key';
import { MonacoHelper } from '../shared/Utilities/monaco.helper';
import { AccessibilityHelper } from '../shared/Utilities/accessibility-helper';

@Component({
    selector: 'function-dev',
    templateUrl: './function-dev.component.html',
    styleUrls: ['./function-dev.component.scss']
})
export class FunctionDevComponent implements OnChanges, OnDestroy {
    @ViewChild(FileExplorerComponent) fileExplorer: FileExplorerComponent;
    @ViewChild(RunHttpComponent) runHttp: RunHttpComponent;
    @ViewChildren(BusyStateComponent) BusyStates: QueryList<BusyStateComponent>;
    @ViewChildren(MonacoEditorDirective) monacoEditors: QueryList<MonacoEditorDirective>;
    @ViewChildren(LogStreamingComponent) logStreamings: QueryList<LogStreamingComponent>;

    @ViewChild('functionContainer') functionContainer: ElementRef;
    @ViewChild('editorContainer') editorContainer: ElementRef;
    @ViewChild('rightContainer') rightContainer: ElementRef;
    @ViewChild('bottomContainer') bottomContainer: ElementRef;

    @Input() selectedFunction: FunctionInfo;
    public functionInfo: FunctionInfo;
    public functionUpdate: Subscription;
    public scriptFile: VfsObject;
    public content: string;
    public testContent: string;
    public fileName: string;
    public inIFrame: boolean;
    public runValid = false;

    public configContent: string;
    public webHookType: string;
    public authLevel: string;
    public secrets: FunctionSecrets;
    public isHttpFunction: boolean;
    public isEventGridFunction: boolean;

    public runResult: RunFunctionResult;
    public running: Subscription;
    public showFunctionInvokeUrl = false;
    public showFunctionKey = false;
    public showFunctionInvokeUrlModal = false;
    public showFunctionKeyModal = false;

    public rightTab: string = FunctionDevComponent.rightTab;
    public bottomTab: string = FunctionDevComponent.bottomTab;
    public static rightTab: string;
    public static bottomTab: string;
    public functionInvokeUrl: string;
    public expandLogs = false;
    public functionApp: FunctionApp;
    public functionKeys: FunctionKeys;
    public hostKeys: FunctionKeys;
    public masterKey: string;
    public isStandalone: boolean;
    public inTab: boolean;
    public disabled: Observable<boolean>;
    public eventGridSubscribeUrl: string;

    private updatedContent: string;
    private updatedTestContent: string;
    private functionSelectStream: Subject<FunctionInfo>;
    public selectedFileStream: Subject<VfsObject>;
    public functionKey: string;

    private _isClientCertEnabled = false;
    private _disableTestDataAfterViewInit = false;
    constructor(private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        configService: ConfigService,
        cd: ChangeDetectorRef) {

        this.functionInvokeUrl = this._translateService.instant(PortalResources.functionDev_loading);
        this.isStandalone = configService.isStandalone();
        this.inTab = PortalService.inTab();

        this.selectedFileStream = new Subject<VfsObject>();
        this.selectedFileStream
            .switchMap(file => {
                if (this.fileExplorer) {
                    this.fileExplorer.setBusyState();
                }
                return Observable.zip(this.selectedFunction.functionApp.getFileContent(file), Observable.of(file), (c, f) => ({ content: c, file: f }));
            })
            .subscribe((res: { content: string, file: VfsObject }) => {
                this.content = res.content;
                this.updatedContent = res.content;
                res.file.isDirty = false;
                this.scriptFile = res.file;
                this.fileName = res.file.name;
                if (this.fileExplorer) {
                    this.fileExplorer.clearBusyState();
                }
            }, () => this._globalStateService.clearBusyState());

        this.functionSelectStream = new Subject<FunctionInfo>();
        this.functionSelectStream
            .switchMap(fi => {
                this.functionApp = fi.functionApp;
                this.disabled = this.functionApp.getFunctionAppEditMode().map(EditModeHelper.isReadOnly);
                this._globalStateService.setBusyState();

                this.functionApp.getEventGridKey().subscribe(eventGridKey => {
                    this.eventGridSubscribeUrl = `${this.functionApp.getMainSiteUrl().toLowerCase()}/admin/extensions/EventGridExtensionConfig?functionName=${fi.name}&code=${eventGridKey}`;;
                });

                return Observable.zip(
                    fi.clientOnly || this.functionApp.isMultiKeySupported ? Observable.of({}) : this.functionApp.getSecrets(fi),
                    Observable.of(fi),
                    this.functionApp.getAuthSettings(),
                    this.functionApp.checkFunctionStatus(fi),
                    (s, f, e, _) => ({ secrets: s, functionInfo: f, authSettings: e }));
            })
            .subscribe(res => {
                this._isClientCertEnabled = res.authSettings.clientCertEnabled;
                this.content = '';
                this.testContent = res.functionInfo.test_data;
                try {
                    const httpModel = JSON.parse(res.functionInfo.test_data);
                    // Check if it's valid model
                    if (Array.isArray(httpModel.headers)) {
                        this.testContent = httpModel.body;
                    }
                } catch (e) {
                    // it's not run http model
                }

                this._globalStateService.clearBusyState();
                this.fileName = res.functionInfo.script_href.substring(res.functionInfo.script_href.lastIndexOf('/') + 1);
                let href = res.functionInfo.script_href;

                if (FileUtilities.isBinary(this.fileName)) {
                    this.fileName = res.functionInfo.config_href.substring(res.functionInfo.config_href.lastIndexOf('/') + 1);
                    href = res.functionInfo.config_href;
                }

                this.scriptFile = this.scriptFile && this.functionInfo && this.functionInfo.href === res.functionInfo.href
                    ? this.scriptFile
                    : { name: this.fileName, href: href, mime: 'file' };
                this.selectedFileStream.next(this.scriptFile);
                this.functionInfo = res.functionInfo;
                this.setInvokeUrlVisibility();

                this.configContent = JSON.stringify(this.functionInfo.config, undefined, 2);

                let inputBinding = (this.functionInfo.config && this.functionInfo.config.bindings
                    ? this.functionInfo.config.bindings.find(e => !!e.webHookType)
                    : null);
                if (inputBinding) {
                    this.webHookType = inputBinding.webHookType;
                } else {
                    delete this.webHookType;
                }

                this.showFunctionKey = this.webHookType === 'github';

                inputBinding = (this.functionInfo.config && this.functionInfo.config.bindings
                    ? this.functionInfo.config.bindings.find(e => !!e.authLevel)
                    : null);
                if (inputBinding) {
                    this.authLevel = inputBinding.authLevel;
                } else {
                    delete this.authLevel;
                }
                this.updateKeys();

                this.isHttpFunction = BindingManager.isHttpFunction(this.functionInfo);
                this.isEventGridFunction = BindingManager.isEventGridFunction(this.functionInfo);

                setTimeout(() => {
                    this.onResize();
                    // Remove "code" param fix
                    this.saveTestData();
                }, 0);

                if (!this.functionApp.isMultiKeySupported) {
                    this.setFunctionInvokeUrl();
                    this.setFunctionKey(this.functionInfo);
                } else if (this._isClientCertEnabled) {
                    this.setFunctionInvokeUrl();
                }

                // This subscribe method changes a lot of UI elements. Normally that's fine if the data leading
                // to the subscribe isn't ready and need to be fetched from the server.
                // if the data is cached on the client, this causes few rapid changes in the DOM and we need to inform the change detector of these changes.
                // Otherwise we'll get ExpressionChangedAfterItHasBeenCheckedError
                cd.detectChanges();

            });

        this.functionUpdate = _broadcastService.subscribe(BroadcastEvent.FunctionUpdated, (newFunctionInfo: FunctionInfo) => {
            this.functionInfo.config = newFunctionInfo.config;
            this.setInvokeUrlVisibility();
        });
    }

    expandLogsClicked(isExpand: boolean) {
        this.expandLogs = isExpand;
        this.onResize();
    }

    onResize() {
        MonacoHelper.onResizeFunction(
            this.functionContainer,
            this.editorContainer,
            this.rightContainer,
            this.bottomContainer,
            this.rightTab,
            this.bottomTab,
            this.expandLogs,
            this.isHttpFunction,
            this.testDataEditor,
            this.codeEditor);
    }

    clickRightTab(tab: string) {
        if (tab === 'logs') {
            if (this.bottomTab === tab) {
                this.bottomTab = '';
                this.expandLogs = false;
                if (this.runLogs) {
                    this.runLogs.compress();
                }
            } else {
                this.bottomTab = tab;
            }
        } else {
            this.rightTab = (this.rightTab === tab) ? '' : tab;
        }

        // double resize to fix pre height
        this.onResize();
        setTimeout(() => {
            this.onResize();
        }, 0);
    }

    ngOnDestroy() {
        this.functionUpdate.unsubscribe();
        this.selectedFileStream.unsubscribe();
        this.functionSelectStream.unsubscribe();
        if (this.logStreamings) {
            this.logStreamings.toArray().forEach((ls) => {
                ls.ngOnDestroy();
            });
        }
        FunctionDevComponent.rightTab = this.rightTab;
        FunctionDevComponent.bottomTab = this.bottomTab;
    }

    ngAfterContentInit() {
        this._broadcastService.broadcast<TutorialEvent>(
            BroadcastEvent.TutorialStep,
            {
                functionInfo: null,
                step: TutorialStep.Develop
            });
    }

    ngAfterViewInit() {
        this.onDisableTestData(this._disableTestDataAfterViewInit);
    }

    private setInvokeUrlVisibility() {
        if (this.functionInfo.config.bindings) {
            const b = this.functionInfo.config.bindings.find((b) => {
                return b.type === BindingType.httpTrigger.toString();
            });
            this.showFunctionInvokeUrl = b ? true : false;
        }
    }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (changes['selectedFunction']) {
            delete this.updatedTestContent;
            delete this.runResult;
            const selectedFunction = changes['selectedFunction'].currentValue;
            if (selectedFunction) {
                this.functionSelectStream.next(changes['selectedFunction'].currentValue);
            }
        }
    }

    private setFunctionKey(functionInfo) {
        if (functionInfo) {
            this.functionApp.getFunctionKeys(functionInfo)
                .subscribe(keys => {
                    if (keys && keys.keys && keys.keys.length > 0) {
                        this.functionKey = keys.keys.find(k => k.name === 'default').value || keys.keys[0].value;
                    }
                });
        }
    }
    private setFunctionInvokeUrl(key?: string) {
        if (this.isHttpFunction) {

            // No webhook https://xxx.azurewebsites.net/api/HttpTriggerCSharp1?code=[keyvalue]
            // WebhookType = "Generic JSON"  https://xxx.azurewebsites.net/api/HttpTriggerCSharp1?code=[keyvalue]&clientId=[keyname]
            // WebhookType = "GitHub" or "Slack" https://xxx.azurewebsites.net/api/HttpTriggerCSharp1?clientId=[keyname]
            let code = '';
            let clientId = '';
            let queryParams = '';
            if (key) {
                code = key;
            } else if (this.isHttpFunction && this.secrets && this.secrets.key) {
                code = this.secrets.key;
            } else if (this.isHttpFunction && this.functionApp.HostSecrets && !this._isClientCertEnabled) {
                code = this.functionApp.HostSecrets;
            }

            if (this.webHookType && key) {
                const allKeys = this.functionKeys.keys.concat(this.hostKeys.keys);
                const keyWithValue = allKeys.find(k => k.value === key);
                if (keyWithValue) {
                    clientId = keyWithValue.name;
                }

                if (this.webHookType.toLowerCase() !== 'genericjson') {
                    code = '';
                }
            }
            if (this.authLevel && this.authLevel.toLowerCase() === 'anonymous') {
                code = null;
            }
            if (code) {
                queryParams = `?code=${code}`;
            }
            if (clientId) {
                queryParams = queryParams ? `${queryParams}&clientId=${clientId}` : `?clientId=${clientId}`;
            }

            this.functionApp.getHostJson().subscribe((jsonObj) => {
                let result = (jsonObj && jsonObj.http && jsonObj.http.routePrefix !== undefined && jsonObj.http.routePrefix !== null) ? jsonObj.http.routePrefix : 'api';
                const httpTrigger = this.functionInfo.config.bindings.find((b) => {
                    return b.type === BindingType.httpTrigger.toString();
                });
                if (httpTrigger && httpTrigger.route) {
                    result = result + '/' + httpTrigger.route;
                } else {
                    result = result + '/' + this.functionInfo.name;
                }

                // Remove doubled slashes
                let path = '/' + result;
                const find = '//';
                const re = new RegExp(find, 'g');
                path = path.replace(re, '/');
                path = path.replace('/?', '?') + queryParams;

                this.functionInvokeUrl = this.functionApp.getMainSiteUrl() + path;
                this.runValid = true;


            });
        } else {
            this.runValid = true;
        }
    }

    saveScript(dontClearBusy?: boolean): Subscription | null {
        // Only save if the file is dirty
        if (!this.scriptFile.isDirty) {
            return null;
        }
        let syncTriggers = false;
        if (this.scriptFile.href.toLocaleLowerCase() === this.functionInfo.config_href.toLocaleLowerCase()) {
            try {
                JSON.parse(this.updatedContent);
                this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.errorParsingConfig);
                syncTriggers = true;
            } catch (e) {
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }),
                    errorId: ErrorIds.errorParsingConfig,
                    errorType: ErrorType.UserError,
                    resourceId: this.functionApp.site.id
                });
                return null;
            }
        }

        this._globalStateService.setBusyState();

        if (this.scriptFile.name.toLowerCase() === 'function.json') {
            this.functionInfo.config = JSON.parse(this.updatedContent);
        }

        return this.functionApp.saveFile(this.scriptFile, this.updatedContent, this.functionInfo)
            .subscribe(r => {
                if (!dontClearBusy) {
                    this._globalStateService.clearBusyState();
                }
                if (typeof r !== 'string' && r.isDirty) {
                    r.isDirty = false;
                    this._broadcastService.clearDirtyState('function');
                    this._portalService.setDirtyState(false);
                }
                if (syncTriggers) {
                    this.functionApp.fireSyncTrigger();
                }
                this.content = this.updatedContent;
            },
            () => {
                this._globalStateService.clearBusyState();
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
        const test_data = this.getTestData();
        if (this.functionInfo.test_data !== test_data) {
            this.functionInfo.test_data = test_data;
            this.functionApp.updateFunction(this.functionInfo)
                .subscribe(r => {
                    Object.assign(this.functionInfo, r);
                    if (this.updatedTestContent) {
                        this.testContent = this.updatedTestContent;
                    }
                });
        }
    }

    runFunction() {
        if (!this.runValid) {
            return;
        }

        let resizeNeeded = false;
        if (this.bottomTab !== 'logs') {
            this.bottomTab = 'logs';
            resizeNeeded = true;
        }

        if (this.rightTab !== 'run') {
            this.rightTab = 'run';
            resizeNeeded = true;
        }

        if (resizeNeeded) {
            setTimeout(() => {
                this.onResize();
            });
        }

        this._globalStateService.setBusyState();
        this.saveTestData();

        if (this.runHttp) {
            if (!this.runHttp.valid) {
                this._globalStateService.clearBusyState();
                this.runValid = false;
                return;
            }

            if (this.httpRunLogs) {
                this.httpRunLogs.clearLogs();
            }
            this.runFunctionInternal();

        } else {
            this.runFunctionInternal();
        }

    }

    cancelCurrentRun() {
        this._globalStateService.clearBusyState();
        if (this.running) {
            this.running.unsubscribe();
            delete this.running;
        }
    }

    get codeEditor(): MonacoEditorDirective {
        return MonacoHelper.getMonacoDirective('code', this.monacoEditors);
    }

    get testDataEditor(): MonacoEditorDirective {
        return MonacoHelper.getMonacoDirective('test_data', this.monacoEditors);
    }

    get runLogs(): LogStreamingComponent {
        if (!this.logStreamings) {
            return null;
        }

        return this.logStreamings.toArray().find((l) => {
            return l.isHttpLogs !== true;
        });
    }

    get httpRunLogs(): LogStreamingComponent {
        if (!this.logStreamings) {
            return null;
        }

        return this.logStreamings.toArray().find((l) => {
            return l.isHttpLogs === true;
        });
    }

    onRunValid(runValid: any) {
        this.runValid = runValid && this.functionInvokeUrl !== this._translateService.instant(PortalResources.functionDev_loading);
    }

    setShowFunctionInvokeUrlModal(value: boolean) {
        const allKeys = this.functionKeys.keys.concat(this.hostKeys.keys);
        if (allKeys.length > 0) {
            this.onChangeKey(allKeys[0].value);
        }
        this.showFunctionInvokeUrlModal = value;

    }

    setShowFunctionKeyModal(value: boolean) {
        this.showFunctionKeyModal = value;
    }

    hideModal() {
        this.showFunctionKeyModal = false;
        this.showFunctionInvokeUrlModal = false;
    }

    onDisableTestData(disableTestData: boolean) {
        if (this.testDataEditor) {
            this.testDataEditor.disabled = disableTestData;
        } else {
            this._disableTestDataAfterViewInit = disableTestData;
        }
    }

    onChangeKey(key: string) {
        this.setFunctionInvokeUrl(key);
        this.setFunctionKey(this.functionInfo);
    }

    onEventGridSubscribe() {
        if (this.eventGridSubscribeUrl) {
            this._portalService.openBlade({
                detailBlade: 'CreateEventSubscriptionFromSubscriberBlade',
                extension: 'Microsoft_Azure_EventGrid',
                detailBladeInputs: {
                    inputs: {
                        subscriberEndpointUrl: this.eventGridSubscribeUrl,
                        label: `functions-${this.functionInfo.name.toLowerCase()}`
                    }
                }
            }, 'function-dev');
        }
    }

    public keyDown(event: KeyboardEvent, key: string, param: any) {
        if (AccessibilityHelper.isEnterOrSpace(event)) {
            switch(key) {
                case 'clickRightTab':
                    this.clickRightTab(param);
                    break;
                case 'setShowFunctionInvokeUrlModal':
                    this.setShowFunctionInvokeUrlModal(param);
                    break;
                case 'setShowFunctionKeyModal':
                    this.setShowFunctionKeyModal(param);
                    break;
                case 'onEventGridSubscribe':
                    this.onEventGridSubscribe();
                    break;
            }
        }
    }

    private getTestData(): string {
        if (this.runHttp) {
            this.runHttp.model.body = this.updatedTestContent !== undefined ? this.updatedTestContent : this.runHttp.model.body;
            // remove "code" param fix
            const clonedModel: HttpRunModel = JSON.parse(JSON.stringify(this.runHttp.model));
            const codeIndex = clonedModel.queryStringParams.findIndex(p => p.name === 'code');

            if (codeIndex > -1) {
                clonedModel.queryStringParams.splice(codeIndex, 1);
            }

            return JSON.stringify(clonedModel);
        } else {
            return this.updatedTestContent !== undefined ? this.updatedTestContent : this.functionInfo.test_data;
        }
    }

    private runFunctionInternal() {

        if (this.scriptFile.isDirty) {
            this.saveScript().add(() => setTimeout(() => this.runFunction(), 1000));
        } else {
            const result = (this.runHttp) ? this.functionApp.runHttpFunction(this.functionInfo, this.functionInvokeUrl, this.runHttp.model) :
                this.functionApp.runFunction(this.functionInfo, this.getTestData());

            this.running = result
                .switchMap(r => {
                    return r.statusCode >= 400
                        ? this.functionApp.checkFunctionStatus(this.functionInfo).map(_ => r)
                        : Observable.of(r);
                })
                .subscribe(r => {
                    this.runResult = r;
                    this._globalStateService.clearBusyState();
                    delete this.running;

                }, () => this._globalStateService.clearBusyState());
        }
    }

    private updateKeys() {
        if (this.functionApp && this.functionInfo) {
            Observable.zip(
                this.functionApp.getFunctionKeys(this.functionInfo),
                this.functionApp.getFunctionHostKeys(),
                (k1, k2) => ({ functionKeys: k1, hostKeys: k2 }))
                .subscribe((r: any) => {
                    this.functionKeys = r.functionKeys || [];
                    this.hostKeys = r.hostKeys || [];

                    if (this.authLevel && this.authLevel.toLowerCase() === 'admin') {
                        const masterKey = r.hostKeys.keys.find((k) => k.name === '_master');
                        if (masterKey) {
                            this.onChangeKey(masterKey.value);
                        }
                    } else {
                        const allKeys = r.functionKeys.keys.concat(this.hostKeys.keys);
                        if (allKeys.length > 0) {
                            this.onChangeKey(allKeys[0].value);
                        }
                    }

                });
        }
    }
}
