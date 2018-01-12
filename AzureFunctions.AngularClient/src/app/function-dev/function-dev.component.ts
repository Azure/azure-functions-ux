import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { FunctionAppService } from './../shared/services/function-app.service';
import { FileUtilities } from './../shared/Utilities/file';
import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
import { ConfigService } from './../shared/services/config.service';
import { Component, QueryList, ViewChild, ViewChildren, OnDestroy, ElementRef, ChangeDetectorRef, AfterViewInit, AfterContentInit } from '@angular/core';
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
import { LogStreamingComponent } from '../log-streaming/log-streaming.component';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { PortalService } from '../shared/services/portal.service';
import { BindingType } from '../shared/models/binding';
import { RunFunctionResult } from '../shared/models/run-function-result';
import { FileExplorerComponent } from '../file-explorer/file-explorer.component';
import { GlobalStateService } from '../shared/services/global-state.service';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { PortalResources } from '../shared/models/portal-resources';
import { TutorialEvent, TutorialStep } from '../shared/models/tutorial';
import { MonacoEditorDirective } from '../shared/directives/monaco-editor.directive';
import { BindingManager } from '../shared/models/binding-manager';
import { RunHttpComponent } from '../run-http/run-http.component';
import { errorIds } from '../shared/models/error-ids';
import { HttpRunModel } from '../shared/models/http-run';
import { FunctionKeys } from '../shared/models/function-key';
import { MonacoHelper } from '../shared/Utilities/monaco.helper';
import { AccessibilityHelper } from '../shared/Utilities/accessibility-helper';

@Component({
    selector: 'function-dev',
    templateUrl: './function-dev.component.html',
    styleUrls: ['./function-dev.component.scss']
})
export class FunctionDevComponent extends FunctionAppContextComponent implements AfterViewInit, AfterContentInit, OnDestroy {
    @ViewChild(FileExplorerComponent) fileExplorer: FileExplorerComponent;
    @ViewChild(RunHttpComponent) runHttp: RunHttpComponent;
    @ViewChildren(BusyStateComponent) BusyStates: QueryList<BusyStateComponent>;
    @ViewChildren(MonacoEditorDirective) monacoEditors: QueryList<MonacoEditorDirective>;
    @ViewChildren(LogStreamingComponent) logStreamings: QueryList<LogStreamingComponent>;

    @ViewChild('functionContainer') functionContainer: ElementRef;
    @ViewChild('editorContainer') editorContainer: ElementRef;
    @ViewChild('rightContainer') rightContainer: ElementRef;
    @ViewChild('bottomContainer') bottomContainer: ElementRef;

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
    public functionKeys: FunctionKeys;
    public hostKeys: FunctionKeys;
    public masterKey: string;
    public isStandalone: boolean;
    public inTab: boolean;
    public disabled: Observable<boolean>;
    public eventGridSubscribeUrl: string;
    public selectedFileStream: Subject<VfsObject>;
    public functionKey: string;

    private updatedContent: string;
    private updatedTestContent: string;
    private _disableTestDataAfterViewInit = false;

    constructor(broadcastService: BroadcastService,
        configService: ConfigService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _functionAppService: FunctionAppService,
        private cd: ChangeDetectorRef) {
        super('function-dev', _functionAppService, broadcastService, () => _globalStateService.setBusyState());

        this.functionInvokeUrl = this._translateService.instant(PortalResources.functionDev_loading);
        this.isStandalone = configService.isStandalone();
        this.inTab = PortalService.inTab();

        this.selectedFileStream = new Subject<VfsObject>();
        this.selectedFileStream
            .switchMap(file => {
                if (this.fileExplorer) {
                    this.fileExplorer.setBusyState();
                }
                return Observable.zip(
                    this._functionAppService.getFileContent(this.context, file),
                    Observable.of(file));
            })
            .subscribe(tuple => {
                if (tuple[0].isSuccessful) {
                    this.content = tuple[0].result;
                    this.updatedContent = tuple[0].result;
                    tuple[1].isDirty = false;
                    this.scriptFile = tuple[1];
                    this.fileName = tuple[1].name;
                } else {
                    this.content = '';
                    this.updatedContent = '';
                    tuple[1].isDirty = false;
                    this.scriptFile = null;
                    this.fileName = '';
                }

                if (this.fileExplorer) {
                    this.fileExplorer.clearBusyState();
                }

            }, () => this._globalStateService.clearBusyState());

        this.functionUpdate = broadcastService.subscribe(BroadcastEvent.FunctionUpdated, (newFunctionInfo: FunctionInfo) => {
            this.functionInfo.config = newFunctionInfo.config;
            this.setInvokeUrlVisibility();
        });
    }

    setup(): Subscription {
        return this.viewInfoEvents
            .switchMap(functionView => {
                delete this.updatedTestContent;
                delete this.runResult;
                this.disabled = this._functionAppService.getFunctionAppEditMode(functionView.context)
                    .map(r => r.isSuccessful ? EditModeHelper.isReadOnly(r.result) : false);

                return Observable.zip(
                    Observable.of(functionView),
                    this._functionAppService.getEventGridKey(functionView.context),
                    this._functionAppService.getFunctionHostStatus(functionView.context),
                    this._functionAppService.getFunctionKeys(functionView.context, functionView.functionInfo.result));
            })
            .do(() => this._globalStateService.clearBusyState())
            .subscribe(tuple => {
                if (tuple[2].isSuccessful) {
                    const status = tuple[2].result;
                    if (status.state !== 'Running' && status.state !== 'Default') {
                        status.errors = status.errors || [];
                        this.showComponentError({
                            message: this._translateService.instant(PortalResources.error_functionRuntimeIsUnableToStart)
                                + '\n'
                                + status.errors.reduce((a, b) => `${a}\n${b}`, '\n'),
                            errorId: errorIds.functionRuntimeIsUnableToStart,
                            resourceId: this.context.site.id
                        });
                    }
                } else {
                    this.showComponentError({
                        message: this._translateService.instant(PortalResources.error_functionRuntimeIsUnableToStart),
                        errorId: errorIds.functionRuntimeIsUnableToStart,
                        resourceId: this.context.site.id
                    });
                }
                if (tuple[0].functionInfo.isSuccessful) {
                    const functionInfo = tuple[0].functionInfo.result;
                    this.content = '';
                    this.eventGridSubscribeUrl =
                        `${this.context.mainSiteUrl.toLowerCase()}/admin/extensions/EventGridExtensionConfig?functionName=${functionInfo.name}&code=${tuple[1].result}`;
                    this.testContent = functionInfo.test_data;
                    try {
                        const httpModel = JSON.parse(this.testContent);
                        // Check if it's valid model
                        if (Array.isArray(httpModel.headers)) {
                            this.testContent = httpModel.body;
                        }
                    } catch (e) {
                        // it's not run http model
                    }

                    this.fileName = functionInfo.script_href.substring(functionInfo.script_href.lastIndexOf('/') + 1);
                    let href = functionInfo.script_href;

                    if (FileUtilities.isBinary(this.fileName)) {
                        this.fileName = functionInfo.config_href.substring(functionInfo.config_href.lastIndexOf('/') + 1);
                        href = functionInfo.config_href;
                    }

                    this.scriptFile = this.scriptFile && this.functionInfo && this.functionInfo.href === functionInfo.href
                        ? this.scriptFile
                        : { name: this.fileName, href: href, mime: 'file' };
                    this.selectedFileStream.next(this.scriptFile);
                    this.functionInfo = functionInfo;
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

                    // This subscribe method changes a lot of UI elements. Normally that's fine if the data leading
                    // to the subscribe isn't ready and need to be fetched from the server.
                    // if the data is cached on the client, this causes few rapid changes in the DOM and we need to inform the change detector of these changes.
                    // Otherwise we'll get ExpressionChangedAfterItHasBeenCheckedError
                    this.cd.detectChanges();
                    this.setFunctionInvokeUrl();
                }
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

    private setFunctionKey(functionInfo) {
        if (functionInfo) {
            this._functionAppService.getFunctionKeys(this.context, functionInfo)
                .subscribe(keys => {
                    if (keys.isSuccessful && keys.result.keys && keys.result.keys.length > 0) {
                        this.functionKey = keys.result.keys.find(k => k.name === 'default').value || keys.result.keys[0].value;
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

            this._functionAppService.getHostJson(this.context)
                .subscribe((jsonObj) => {
                    let result = (
                        jsonObj.isSuccessful &&
                        jsonObj.result.http &&
                        jsonObj.result.http.routePrefix !== undefined &&
                        jsonObj.result.http.routePrefix !== null
                    )
                        ? jsonObj.result.http.routePrefix
                        : 'api';

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

                    this.functionInvokeUrl = this.context.mainSiteUrl + path;
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
                this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, errorIds.errorParsingConfig);
                syncTriggers = true;
            } catch (e) {
                this.showComponentError({
                    message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }),
                    errorId: errorIds.errorParsingConfig,
                    resourceId: this.context.site.id
                });
                return null;
            }
        }

        this._globalStateService.setBusyState();

        if (this.scriptFile.name.toLowerCase() === 'function.json') {
            this.functionInfo.config = JSON.parse(this.updatedContent);
        }

        return this._functionAppService.saveFile(this.context, this.scriptFile, this.updatedContent, this.functionInfo)
            .subscribe(r => {
                if (!dontClearBusy) {
                    this._globalStateService.clearBusyState();
                }

                if (r.isSuccessful && typeof r.result !== 'string' && r.result.isDirty) {
                    r.result.isDirty = false;
                    this._broadcastService.clearDirtyState('function');
                    this._portalService.setDirtyState(false);
                }

                if (syncTriggers) {
                    this._functionAppService.fireSyncTrigger(this.context);
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
            this._functionAppService.updateFunction(this.context, this.functionInfo)
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
            switch (key) {
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
            const result = (this.runHttp)
                ? this._functionAppService.runHttpFunction(this.context, this.functionInfo, this.functionInvokeUrl, this.runHttp.model)
                : this._functionAppService.runFunction(this.context, this.functionInfo, this.getTestData());

            this.running = result
                .switchMap(r => {
                    return r.result.statusCode >= 400
                        ? this._functionAppService.getFunctionErrors(this.context, this.functionInfo).map(_ => r)
                        : Observable.of(r);
                })
                .subscribe(r => {
                    this.runResult = r.result;
                    this._globalStateService.clearBusyState();
                    delete this.running;

                }, () => this._globalStateService.clearBusyState());
        }
    }

    private updateKeys() {
        Observable.zip(
            this._functionAppService.getFunctionKeys(this.context, this.functionInfo),
            this._functionAppService.getHostKeys(this.context)
        )
            .subscribe(tuple => {
                this.functionKeys = tuple[0].isSuccessful ? tuple[0].result : { keys: [], links: [] };
                this.hostKeys = tuple[1].isSuccessful ? tuple[1].result : { keys: [], links: [] };

                if (this.authLevel && this.authLevel.toLowerCase() === 'admin') {
                    const masterKey = this.hostKeys.keys.find((k) => k.name === '_master');
                    if (masterKey) {
                        this.onChangeKey(masterKey.value);
                    }
                } else {
                    const allKeys = this.functionKeys.keys.concat(this.hostKeys.keys);
                    if (allKeys.length > 0) {
                        this.onChangeKey(allKeys[0].value);
                    }
                }
            });
    }
}
