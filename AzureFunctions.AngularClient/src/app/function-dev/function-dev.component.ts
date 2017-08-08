import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
import { ConfigService } from './../shared/services/config.service';
import { Component, QueryList, OnChanges, Input, SimpleChange, ViewChild, ViewChildren, OnDestroy, ElementRef } from '@angular/core';
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
import { AiService } from '../shared/services/ai.service';
import { MonacoEditorDirective } from '../shared/directives/monaco-editor.directive';
import { BindingManager } from '../shared/models/binding-manager';
import { RunHttpComponent } from '../run-http/run-http.component';
import { ErrorIds } from '../shared/models/error-ids';
import { HttpRunModel } from '../shared/models/http-run';
import { FunctionKeys } from '../shared/models/function-key';
import { TabCommunicationVerbs } from "app/shared/models/constants";
import { contentUpdateMessage, TabMessage } from "app/shared/models/localStorage/local-storage";
import { Logger } from "app/shared/utilities/logger";


@Component({
    selector: "function-dev",
    templateUrl: "./function-dev.component.html",
    styleUrls: ["./function-dev.component.scss"]
})
export class FunctionDevComponent implements OnChanges, OnDestroy {
    @ViewChild(FileExplorerComponent) fileExplorer: FileExplorerComponent;
    @ViewChild(RunHttpComponent) runHttp: RunHttpComponent;
    @ViewChildren(BusyStateComponent) BusyStates: QueryList<BusyStateComponent>;
    @ViewChildren(MonacoEditorDirective) monacoEditors: QueryList<MonacoEditorDirective>;
    @ViewChildren(LogStreamingComponent) logStreamings: QueryList<LogStreamingComponent>;

    @ViewChild("functionContainer") functionContainer: ElementRef;
    @ViewChild("editorContainer") editorContainer: ElementRef;
    @ViewChild("rightContainer") rightContainer: ElementRef;
    @ViewChild("bottomContainer") bottomContainer: ElementRef;

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
    public showFunctionInvokeUrlModal: boolean = false;
    public showFunctionInvokeUrl: boolean = false;
    public showFunctionKey: boolean = false;
    public showFunctionKeyModal: boolean = false;

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
    public eventGridSubscribeUrl: string;

    public disabled: Observable<boolean>;
    public monacoDirtyState: boolean;

    public recievedUpdatedFunctionContent: Subject<string>;
    public sentUpdatedFunctionContent: Subject<contentUpdateMessage>;

    public fileResourceId = "";
    private updatedContent: string;
    private updatedTestContent: string;
    private functionSelectStream: Subject<FunctionInfo>;
    public selectedFileStream: Subject<VfsObject>;
    public functionKey: string;

    private _isClientCertEnabled = false;
    constructor(private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _aiService: AiService,
        configService: ConfigService) {

        this.functionInvokeUrl = this._translateService.instant(PortalResources.functionDev_loading);
        this.isStandalone = configService.isStandalone();

        this.selectedFileStream = new Subject<VfsObject>();
        this.selectedFileStream
            .switchMap(file => {
                if (this.fileExplorer) {
                    this.fileExplorer.setBusyState();
                }
                return Observable.zip(this.selectedFunction.functionApp.getFileContent(file), Observable.of(file), (c, f) => ({ content: c, file: f }));
            })
            .do(null, err => {
                this._aiService.trackEvent('/errors/functionDev', err);
                this._globalStateService.clearBusyState();
            })
            .retry()
            .subscribe((res: { content: string, file: VfsObject }) => {
                try {
                    this.content = res.content;
                    this.updatedContent = res.content;
                    res.file.isDirty = false;
                    this.scriptFile = res.file;
                    this.fileName = res.file.name;

                    this.fileResourceId = `${this.functionApp.site.id}/functions/${this.functionInfo.name}/files/${this.fileName}`;
                    this._portalService.fileResourceId = this.fileResourceId

                    if (this.updatedContent && res.file.isDirty) {
                        this.sendContentMessage(this.updatedContent);
                    }

                    if (this.fileExplorer) {
                        this.fileExplorer.clearBusyState();
                    }
                    // ask for updated info if changes have been made to the file
                    this._portalService._sendTabMessage(this._portalService.windowId, TabCommunicationVerbs.getUpdatedContent, this._portalService.fileResourceId)

                } catch (e) {
                    this._globalStateService.clearBusyState();
                    this._aiService.trackEvent('/errors/functionDev', e);
                };
            });

        this.functionSelectStream = new Subject<FunctionInfo>();
        this.functionSelectStream
            .switchMap(fi => {
                this.functionApp = fi.functionApp;
                this.disabled = this.functionApp.getFunctionAppEditMode().map(EditModeHelper.isReadOnly);
                this._globalStateService.setBusyState();
                this.checkErrors(fi);

                this.functionApp.getEventGridKey().subscribe(eventGridKey => {
                    this.eventGridSubscribeUrl = `${this.functionApp.getMainSiteUrl().toLowerCase()}/admin/extensions/EventGridExtensionConfig?functionName=${this.functionInfo.name}&code=${eventGridKey}`;;
                });

                return Observable.zip(
                    fi.clientOnly || this.functionApp.isMultiKeySupported ? Observable.of({}) : this.functionApp.getSecrets(fi),
                    Observable.of(fi),
                    this.functionApp.getAuthSettings(),
                    (s, f, e) => ({ secrets: s, functionInfo: f, authSettings: e }));
            })
            .subscribe(res => {
                this.functionInfo = res.functionInfo;

                this._isClientCertEnabled = res.authSettings.clientCertEnabled;
                this.content = '';
                this.testContent = this.functionInfo.test_data;
                try {
                    const httpModel = JSON.parse(this.functionInfo.test_data);
                    // Check if it's valid model
                    if (Array.isArray(httpModel.headers)) {
                        this.testContent = httpModel.body;
                    }
                } catch (e) {
                    // it's not run http model
                }

                this._globalStateService.clearBusyState();
                this.fileName = this.functionInfo.script_href.substring(this.functionInfo.script_href.lastIndexOf("/") + 1);
                var href = this.functionInfo.script_href;
                if (this.fileName.toLowerCase().endsWith('dll')) {
                    this.fileName = this.functionInfo.config_href.substring(this.functionInfo.config_href.lastIndexOf("/") + 1);
                    href = this.functionInfo.config_href;
                }

                this.scriptFile = this.scriptFile && this.functionInfo && this.functionInfo.href === this.functionInfo.href
                    ? this.scriptFile
                    : { name: this.fileName, href: href, mime: "file" };
                this.selectedFileStream.next(this.scriptFile);
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

                this.showFunctionKey = this.webHookType === "github";

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

                this.fileResourceId = `${this.functionApp.site.id}/functions/${this.functionInfo.name}/files/${this.fileName}`;
                this._portalService.fileResourceId = this.fileResourceId
                // ask for updated info if changes have been made to the file
                this._portalService._sendTabMessage(this._portalService.windowId, TabCommunicationVerbs.getUpdatedContent, this._portalService.fileResourceId)

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
            });

        this.functionUpdate = _broadcastService.subscribe(BroadcastEvent.FunctionUpdated, (newFunctionInfo: FunctionInfo) => {
            this.functionInfo.config = newFunctionInfo.config;
            this.setInvokeUrlVisibility();
        });

        this.recievedUpdatedFunctionContent = new Subject<string>();
        this.recievedUpdatedFunctionContent
            .subscribe(content => {
                this.updateContentFromOtherWindow(content)
                // unlock monaco (not disabled)
                this.disabled = this.functionApp.getFunctionAppEditMode()
                    .map(editMode => {
                        return EditModeHelper.isReadOnly(editMode) || false;
                    })
                Logger.debug("editor unlocked");
            });

        // handle messages recieved by portalService
        this._portalService.storageMessageStream
            .subscribe(msg => {
                this.storageMessageHandler(msg);
            })

        let lock = false; // ensures that the lock message sends only once
        // stream of content shown in monaco editor
        this.sentUpdatedFunctionContent = new Subject<contentUpdateMessage>();
        this.sentUpdatedFunctionContent
            // send one message to lock the other editors while typing
            .do((contentMessage) => {
                if (!lock) {
                    lock = true;
                    this._portalService._sendTabMessage(this._portalService.windowId, TabCommunicationVerbs.lockEditor, this.fileResourceId)
                }
            })
            // only send the content update after typing stops for .5 seconds
            .debounceTime(500)
            .subscribe(contentMessage => {
                lock = false;
                const id = this._portalService.windowId;
                this._portalService._sendTabMessage<contentUpdateMessage>(id, TabCommunicationVerbs.updatedFile, contentMessage);

            });
    }

    public updateFileStream(file: VfsObject) {
        this.selectedFileStream.next(file);
    }

    private storageMessageHandler(msg: TabMessage<any>) {
        if (msg.verb === TabCommunicationVerbs.lockEditor) {
            // lock the editor until updated content is recieved
            if ((msg.data === this.fileResourceId)) {
                // lock monaco (disabled)
                this.disabled = this.functionApp.getFunctionAppEditMode()
                    .map(editMode => {
                        return EditModeHelper.isReadOnly(editMode) || true;
                    })
                Logger.debug("editor locked");
            }
        }

        else if (msg.verb === TabCommunicationVerbs.updatedFile) {
            //check if file is open, if yes then update
            const updateInfo: contentUpdateMessage = msg.data;

            if ((updateInfo.resourceId === this.fileResourceId)) {
                Logger.debug("update information recieved")
                // tell function-dev to update content 
                this.recievedUpdatedFunctionContent.next(updateInfo.content);
            }
        }

        else if (msg.verb === TabCommunicationVerbs.getUpdatedContent && msg.data === this.fileResourceId) {
            //if changes have been made to the file, send them
            if (this.monacoDirtyState) {
                Logger.debug("update information sent");
                const contentMessage: contentUpdateMessage = {
                    resourceId: this.fileResourceId,
                    content: this.updatedContent
                };
                this._portalService._sendTabMessage<contentUpdateMessage>(this._portalService.windowId, TabCommunicationVerbs.updatedFile, contentMessage);
            }
        }

        // ask if file is open in another window
        else if (msg.verb === TabCommunicationVerbs.fileOpenElsewhereCheck && msg.data === this.fileResourceId) {
            Logger.debug("responded to request if file is open in another window")
            this._portalService._sendTabMessage(this._portalService.windowId, TabCommunicationVerbs.fileIsOpenElsewhere, null);
        }

        // if file has been saved in another tab
        else if (msg.verb === TabCommunicationVerbs.fileSaved) {
            Logger.debug("file was saved in another window");
            if (this.scriptFile.isDirty) {
                this.scriptFile.isDirty = false;
                this.monacoDirtyState = this.scriptFile.isDirty;
                this._broadcastService.setDirtyState("function");
                this._portalService.setDirtyState(false);
            }
        }
    }

    expandLogsClicked(isExpand: boolean) {
        this.expandLogs = isExpand;
        this.onResize();
    }

    public onResize() {

        const functionNameHeight = 46;
        const editorPadding = 25;

        let functionContainerWidth;
        let functionContainerHeight;
        if (this.functionContainer) {
            functionContainerWidth = window.innerWidth - this.functionContainer.nativeElement.getBoundingClientRect().left;
            functionContainerHeight = window.innerHeight - this.functionContainer.nativeElement.getBoundingClientRect().top;
        }
        const rightContainerWidth = this.rightTab ? Math.floor((functionContainerWidth / 3)) : 50;
        let bottomContainerHeight = this.bottomTab ? Math.floor((functionContainerHeight / 3)) : 50;

        const editorContainerWidth = functionContainerWidth - rightContainerWidth - 50;
        let editorContainerHeight = functionContainerHeight - bottomContainerHeight - functionNameHeight - editorPadding;

        if (this.expandLogs) {
            editorContainerHeight = 0;
            // editorContainerWidth = 0;

            bottomContainerHeight = functionContainerHeight - functionNameHeight;

            this.editorContainer.nativeElement.style.visibility = 'hidden';
            this.bottomContainer.nativeElement.style.marginTop = '0px';
        } else {
            this.editorContainer.nativeElement.style.visibility = 'visible';
            this.bottomContainer.nativeElement.style.marginTop = '25px';
        }


        if (this.editorContainer) {
            this.editorContainer.nativeElement.style.width = editorContainerWidth + 'px';
            this.editorContainer.nativeElement.style.height = editorContainerHeight + 'px';
        }

        if (this.codeEditor) {
            this.codeEditor.setLayout(
                editorContainerWidth - 2,
                editorContainerHeight - 2
            );
        }

        if (this.rightContainer) {
            this.rightContainer.nativeElement.style.width = rightContainerWidth + 'px';
            this.rightContainer.nativeElement.style.height = functionContainerHeight + 'px';
        }

        if (this.bottomContainer) {
            this.bottomContainer.nativeElement.style.height = bottomContainerHeight + 'px';
            this.bottomContainer.nativeElement.style.width = (editorContainerWidth + editorPadding * 2) + 'px';
        }

        if (this.testDataEditor) {
            const widthDataEditor = rightContainerWidth - 24;

            setTimeout(() => {
                if (this.testDataEditor) {
                    this.testDataEditor.setLayout(
                        this.rightTab ? widthDataEditor : 0,
                        this.isHttpFunction ? 230 : functionContainerHeight / 2
                        // functionContainaerHeight / 2
                    );
                }
            }, 0);
        }
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

    private setInvokeUrlVisibility() {
        if (this.functionInfo.config.bindings) {
            const b = this.functionInfo.config.bindings.find((b) => {
                return b.type === BindingType.httpTrigger.toString();
            });
            this.showFunctionInvokeUrl = b ? true : false;
        }
    }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (changes["selectedFunction"]) {
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

                if (this.webHookType.toLowerCase() !== "genericjson") {
                    code = "";
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
                    result = result + "/" + httpTrigger.route;
                } else {
                    result = result + "/" + this.functionInfo.name;
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

        let notificationId = null;
        return this._portalService.startNotification(
            this._translateService.instant(PortalResources.functionDev_saveFunctionNotifyTitle).format(this.functionInfo.name),
            this._translateService.instant(PortalResources.functionDev_saveFunctionNotifyTitle).format(this.functionInfo.name))
            .first()
            .switchMap(r => {
                notificationId = r.id;
                return this.functionApp.saveFile(this.scriptFile, this.updatedContent, this.functionInfo);
            })
            .subscribe(r => {
                if (!dontClearBusy) {
                    this._globalStateService.clearBusyState();
                    this._portalService._sendTabMessage(this._portalService.windowId, TabCommunicationVerbs.fileSaved, this.fileResourceId);
                }
                if (typeof r !== "string" && r.isDirty) {
                    r.isDirty = false;
                    this.monacoDirtyState = r.isDirty;
                    this._broadcastService.clearDirtyState("function");
                    this._portalService.setDirtyState(false);
                }
                if (syncTriggers) {
                    this.functionApp.fireSyncTrigger();
                }
                this._portalService.stopNotification(
                    notificationId,
                    true,
                    this._translateService.instant(PortalResources.functionDev_saveFunctionSuccess).format(this.functionInfo.name));
                this.content = this.updatedContent;
            },
            () => {
                this._globalStateService.clearBusyState();
                this._portalService.stopNotification(
                    notificationId,
                    false,
                    this._translateService.instant(PortalResources.functionDev_saveFunctionFailure).format(this.functionInfo.name));

            });
    }

    contentChanged(content: string) {
        if (!this.scriptFile.isDirty) {
            this.scriptFile.isDirty = true;
            this.monacoDirtyState = this.scriptFile.isDirty;
            this._broadcastService.setDirtyState("function");
            this._portalService.setDirtyState(true);
        }
        this.updatedContent = content;
        this.sendContentMessage(content);
    }

    sendContentMessage(content: string) {
        const contentMessage: contentUpdateMessage = {
            resourceId: this.fileResourceId,
            content: content
        };
        // update the new content
        this.sentUpdatedFunctionContent.next(contentMessage)
    }

    public updateContentFromOtherWindow(content: string) {
        this.scriptFile.isDirty = true;
        this.monacoDirtyState = this.scriptFile.isDirty;
        this._broadcastService.setDirtyState("function");
        this._portalService.setDirtyState(true);

        this.updatedContent = content;
        this.content = content;
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

    checkErrors(functionInfo: FunctionInfo) {
        this.functionApp.getFunctionErrors(functionInfo)
            .subscribe(errors => {
                this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.generalFunctionErrorFromHost + functionInfo.name);
                // Give clearing a chance to run
                setTimeout(() => {
                    if (errors) {
                        errors.forEach(e => {
                            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                message: this._translateService.instant(PortalResources.functionDev_functionErrorMessage, { name: functionInfo.name, error: e }),
                                details: this._translateService.instant(PortalResources.functionDev_functionErrorDetails, { error: e }),
                                errorId: ErrorIds.generalFunctionErrorFromHost + functionInfo.name,
                                errorType: ErrorType.FunctionError,
                                resourceId: this.functionApp.site.id
                            });
                            this._aiService.trackEvent(ErrorIds.generalFunctionErrorFromHost, { error: e, functionName: functionInfo.name, functionConfig: JSON.stringify(functionInfo.config) });
                        });
                    } else {
                        this.functionApp.getHostErrors()
                            .subscribe(hostErrors => {
                                this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.generalHostErrorFromHost);
                                // Give clearing a chance to run
                                setTimeout(() => {
                                    hostErrors.forEach(e => {
                                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                            message: this._translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e }),
                                            details: this._translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e }),
                                            errorId: ErrorIds.generalHostErrorFromHost,
                                            errorType: ErrorType.RuntimeError,
                                            resourceId: this.functionApp.site.id
                                        });
                                        this._aiService.trackEvent("/errors/host", { error: e, app: this._globalStateService.FunctionContainer.id });
                                    });
                                });
                            });
                    }
                });
            });
    }

    get codeEditor(): MonacoEditorDirective {
        return this.getMonacoDirective('code');
    }

    get testDataEditor(): MonacoEditorDirective {
        return this.getMonacoDirective('test_data');
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
        this.testDataEditor.disabled = disableTestData;
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

    private getMonacoDirective(id: string): MonacoEditorDirective {

        if (!this.monacoEditors) {
            return null;
        }

        return this.monacoEditors.toArray().find((e) => {
            return e.elementRef.nativeElement.id === id;
        });
    }

    private runFunctionInternal() {

        if (this.scriptFile.isDirty) {
            this.saveScript().add(() => setTimeout(() => this.runFunction(), 1000));
        } else {
            const result = (this.runHttp) ? this.functionApp.runHttpFunction(this.functionInfo, this.functionInvokeUrl, this.runHttp.model) :
                this.functionApp.runFunction(this.functionInfo, this.getTestData());

            this.running = result.subscribe(r => {
                this.runResult = r;
                this._globalStateService.clearBusyState();
                delete this.running;
                if (this.runResult.statusCode >= 400) {
                    this.checkErrors(this.functionInfo);
                }
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
