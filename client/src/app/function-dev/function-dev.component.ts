import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { FunctionAppService } from './../shared/services/function-app.service';
import { FileUtilities } from './../shared/Utilities/file';
import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
import { ConfigService } from './../shared/services/config.service';
import {
  Component,
  QueryList,
  ViewChild,
  ViewChildren,
  OnDestroy,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
  AfterContentInit,
  AfterViewChecked,
} from '@angular/core';
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
import { FunctionConsoleComponent } from '../function-console/function-console.component';
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
import { FunctionKeys, HostKeys } from '../shared/models/function-key';
import { MonacoHelper } from '../shared/Utilities/monaco.helper';
import { AccessibilityHelper } from '../shared/Utilities/accessibility-helper';
import { LogService } from '../shared/services/log.service';
import { LogCategories, WebhookTypes } from '../shared/models/constants';
import { ArmUtil } from '../shared/Utilities/arm-utils';
import { AiService } from 'app/shared/services/ai.service';
import { FunctionService } from 'app/shared/services/function.service';
import { runtimeIsV1 } from 'app/shared/models/functions-version-info';

type FileSelectionEvent = VfsObject | [VfsObject, monaco.editor.IMarkerData[], monaco.editor.IMarkerData];

@Component({
  selector: 'function-dev',
  templateUrl: './function-dev.component.html',
  styleUrls: ['./function-dev.component.scss'],
})
export class FunctionDevComponent extends FunctionAppContextComponent
  implements AfterViewInit, AfterContentInit, OnDestroy, AfterViewChecked {
  @ViewChild(FileExplorerComponent)
  fileExplorer: FileExplorerComponent;
  @ViewChild(RunHttpComponent)
  runHttp: RunHttpComponent;
  @ViewChildren(BusyStateComponent)
  BusyStates: QueryList<BusyStateComponent>;
  @ViewChildren(MonacoEditorDirective)
  monacoEditors: QueryList<MonacoEditorDirective>;
  @ViewChildren(LogStreamingComponent)
  logStreamings: QueryList<LogStreamingComponent>;
  @ViewChild(FunctionConsoleComponent)
  functionConsole: FunctionConsoleComponent;

  @ViewChild('functionContainer')
  functionContainer: ElementRef;
  @ViewChild('rightContainer')
  rightContainer: ElementRef;
  @ViewChild('bottomContainer')
  bottomContainer: ElementRef;
  @ViewChild('selectKeys')
  selectKeys: ElementRef;

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
  public isRunEnabled = true;
  public runHoverText: string;

  public rightTab: string;
  public bottomTab: string;
  public functionInvokeUrl: string;
  public expandLogs = false;
  public functionKeys: FunctionKeys;
  public hostKeys: HostKeys;
  public isStandalone: boolean;
  public inTab: boolean;
  public disabled: Observable<boolean>;
  public eventGridSubscribeUrl: string;
  public selectedFileStream: Subject<FileSelectionEvent>;
  public functionKey: string;

  public bottomBarExpanded: boolean;
  public rightBarExpanded: boolean;

  public showErrorsAndWarnings: boolean;

  public showConsole: boolean;

  private updatedContent: string;
  private updatedTestContent: string;
  private _disableTestDataAfterViewInit = false;
  private _restartHostSubscription: Subscription;

  private functionAppVersion: string;
  private _initialSetFocus = true;

  constructor(
    private broadcastService: BroadcastService,
    configService: ConfigService,
    private _portalService: PortalService,
    private _globalStateService: GlobalStateService,
    private _translateService: TranslateService,
    private _functionAppService: FunctionAppService,
    private _logService: LogService,
    private cd: ChangeDetectorRef,
    private _aiService: AiService,
    private _functionService: FunctionService
  ) {
    super('function-dev', _functionAppService, broadcastService, _functionService, () => _globalStateService.setBusyState());

    this.functionInvokeUrl = this._translateService.instant(PortalResources.functionDev_loading);
    this.isStandalone = configService.isStandalone();
    this.inTab = PortalService.inTab();

    this.selectedFileStream = new Subject<FileSelectionEvent>();
    // a type predicate for checking which type in in a FileSelectionEvent
    const isVfsObject = (obj: FileSelectionEvent): obj is VfsObject => {
      return (obj as VfsObject).href !== undefined;
    };

    this.selectedFileStream
      .switchMap(file => {
        if (this.fileExplorer) {
          this.fileExplorer.setBusyState();
        }
        const vfsFile = isVfsObject(file) ? file : file[0];
        const diagnostics = isVfsObject(file) ? null : file[1];
        const diagnostic = isVfsObject(file) ? null : file[2];

        return Observable.zip(
          this._functionAppService.getFileContent(this.context, vfsFile),
          Observable.of(vfsFile),
          Observable.of(diagnostics),
          Observable.of(diagnostic)
        );
      })
      .subscribe(
        tuple => {
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

          if (tuple[2]) {
            // if we have a diagnostics info in the event
            // make sure to set it after giving Monaco a chance
            // to update its file
            setTimeout(() => {
              this.codeEditor.setDiagnostics(tuple[2]);
              if (tuple[3]) {
                // if we have a specific diagnostic, set position to it.
                this.codeEditor.setPosition(tuple[3].startLineNumber, tuple[3].startColumn);
              }
            });
          }

          if (this.fileExplorer) {
            this.fileExplorer.clearBusyState();
          }
        },
        () => this._globalStateService.clearBusyState()
      );

    this.functionUpdate = broadcastService.subscribe(BroadcastEvent.FunctionUpdated, (newFunctionInfo: FunctionInfo) => {
      this.functionInfo.config = newFunctionInfo.config;
      this._setInvokeUrlVisibility();
    });
  }

  setup(): Subscription {
    return this.viewInfoEvents
      .switchMap(functionView => {
        delete this.updatedTestContent;
        delete this.runResult;
        this.disabled = this._functionAppService
          .getFunctionAppEditMode(functionView.context)
          .map(r => (r.isSuccessful ? EditModeHelper.isReadOnly(r.result) : false));
        this.showConsole = !ArmUtil.isLinuxDynamic(functionView.context.site);
        return Observable.zip(
          Observable.of(functionView),
          this._functionAppService.getEventGridUri(functionView.context, functionView.functionInfo.result.properties.name),
          this._functionAppService.getFunctionHostStatus(functionView.context),
          this._functionAppService.getFunctionErrors(functionView.context, functionView.functionInfo.result.properties),
          this._functionAppService.getRuntimeGeneration(functionView.context),
          this._functionAppService.getFunctionTestData(functionView.context, functionView.functionInfo.result.properties.test_data_href)
        );
      })
      .do(() => {
        this.runValid = false;
        this.showFunctionInvokeUrl = false;
        this._globalStateService.clearBusyState();
      })
      .subscribe(tuple => {
        if (tuple[2].isSuccessful) {
          const status = tuple[2].result;
          if (status.state === 'Error') {
            status.errors = status.errors || [];
            this.showComponentError({
              message:
                this._translateService.instant(PortalResources.error_functionRuntimeIsUnableToStart) +
                '\n' +
                status.errors.reduce((a, b) => `${a}\n${b}`, '\n'),
              errorId: errorIds.functionRuntimeIsUnableToStart,
              resourceId: this.context.site.id,
            });
          }
        } else {
          this.showComponentError({
            message: this._translateService.instant(PortalResources.error_functionRuntimeIsUnableToStart),
            errorId: errorIds.functionRuntimeIsUnableToStart,
            resourceId: this.context.site.id,
          });
        }
        if (tuple[3].isSuccessful && tuple[3].result.length > 0) {
          this.showComponentError({
            message: this._translateService.instant(PortalResources.functionDev_functionErrorMessage, {
              name: tuple[0].functionInfo.result.name,
              error: tuple[3].result.reduce((a, b) => `${a}\n${b}`, '\n'),
            }),
            errorId: errorIds.generalFunctionErrorFromHost,
            resourceId: this.context.site.id,
          });
        }
        if (this._restartHostSubscription) {
          this._restartHostSubscription.unsubscribe();
          delete this._restartHostSubscription;
        }
        if (ArmUtil.isLinuxApp(this.context.site)) {
          this._restartHostSubscription = this.broadcastService
            .getEvents(BroadcastEvent.FunctionCodeUpdate)
            .merge(() => Observable.create(o => this.broadcastService.subscribe(BroadcastEvent.FunctionUpdated, () => o.onNext(0))))
            .debounceTime(500)
            .concatMap(() => this._functionAppService.restartFunctionsHost(this.context))
            .subscribe(() => this._logService.verbose(LogCategories.functionHostRestart, `restart for ${this.context.site.id}`));
        }
        if (tuple[5].isSuccessful) {
          this.testContent = tuple[5].result;
          try {
            const httpModel = JSON.parse(this.testContent);
            // Check if it's valid model
            if (Array.isArray(httpModel.headers)) {
              this.testContent = httpModel.body;
            }
          } catch (e) {
            // it's not run http model
          }
        }
        if (tuple[0].functionInfo.isSuccessful) {
          const functionInfo = tuple[0].functionInfo.result.properties;
          this.content = '';
          this.eventGridSubscribeUrl = tuple[1].result;

          this.fileName = functionInfo.script_href.substring(functionInfo.script_href.lastIndexOf('/') + 1);
          let href = functionInfo.script_href;

          if (FileUtilities.isBinary(this.fileName)) {
            this.fileName = functionInfo.config_href.substring(functionInfo.config_href.lastIndexOf('/') + 1);
            href = functionInfo.config_href;
          }

          this.scriptFile =
            this.scriptFile && this.functionInfo && this.functionInfo.href === functionInfo.href
              ? this.scriptFile
              : { name: this.fileName, href: href, mime: 'file' };
          this.selectedFileStream.next(this.scriptFile);
          this.functionInfo = functionInfo;

          this.configContent = JSON.stringify(this.functionInfo.config, undefined, 2);

          let inputBinding =
            this.functionInfo.config && this.functionInfo.config.bindings
              ? this.functionInfo.config.bindings.find(e => !!e.webHookType)
              : null;
          if (inputBinding) {
            this.webHookType = inputBinding.webHookType;
          } else {
            delete this.webHookType;
          }

          this.showFunctionKey = this.webHookType && this.webHookType.toLowerCase() === WebhookTypes.github;

          this.isRunEnabled = !this.showFunctionKey;
          this.runHoverText = this.isRunEnabled ? PortalResources.run : PortalResources.testFunctionNotSupportedForGitHubWebhook;

          inputBinding =
            this.functionInfo.config && this.functionInfo.config.bindings
              ? this.functionInfo.config.bindings.find(e => !!e.authLevel)
              : null;
          if (inputBinding) {
            this.authLevel = inputBinding.authLevel;
          } else {
            delete this.authLevel;
          }
          this._updateKeys();

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
          this._setFunctionInvokeUrl();
        }
        this.functionAppVersion = tuple[4];
        this.showErrorsAndWarnings = runtimeIsV1(this.functionAppVersion);
      });
  }

  expandLogsClicked(isExpand: boolean) {
    this.expandLogs = isExpand;
    this.onResize();
  }

  onResize() {
    // make sure to call monaco resize to let the editor
    // handle viewport changes.
    if (this.codeEditor) {
      this.codeEditor.resize();
    }

    if (this.testDataEditor) {
      this.testDataEditor.resize();
    }

    if (this.bottomContainer) {
      this.bottomContainer.nativeElement.style.width = this.codeEditor.width + 'px';
    }
  }

  clickBottomTab(tab: string) {
    this.expandLogs = false;
    if (this.runLogs) {
      this.runLogs.compress(true);
    }
    if (this.functionConsole) {
      this.functionConsole.compress(true);
    }

    if (this.bottomTab === tab) {
      this.bottomTab = '';
      this.bottomBarExpanded = false;
    } else {
      this.bottomTab = tab;
      this.bottomBarExpanded = true;
    }

    // double resize to fix pre height
    setTimeout(() => {
      this.onResize();
    }, 0);
  }

  clickRightTab(tab: string) {
    this.rightTab = this.rightTab === tab ? '' : tab;
    this.rightBarExpanded = !!this.rightTab;

    // double resize to fix pre height
    this.onResize();
    setTimeout(() => {
      this.onResize();
    }, 0);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this._globalStateService.clearBusyState();
    this.functionUpdate.unsubscribe();
    this.selectedFileStream.unsubscribe();
    if (this._restartHostSubscription) {
      this._restartHostSubscription.unsubscribe();
    }
    if (this.logStreamings) {
      this.logStreamings.toArray().forEach(ls => {
        ls.ngOnDestroy();
      });
    }
  }

  ngAfterContentInit() {
    this._broadcastService.broadcast<TutorialEvent>(BroadcastEvent.TutorialStep, {
      functionInfo: null,
      step: TutorialStep.Develop,
    });
  }

  ngAfterViewInit() {
    this.onDisableTestData(this._disableTestDataAfterViewInit);
  }

  ngAfterViewChecked() {
    if (this.showFunctionInvokeUrlModal && this._initialSetFocus) {
      this.selectKeys.nativeElement.focus();
      this._initialSetFocus = false;
    }
  }

  private _setInvokeUrlVisibility() {
    if (this.functionInfo.config.bindings) {
      const b = this.functionInfo.config.bindings.find(b => {
        return b.type === BindingType.httpTrigger.toString();
      });
      this.showFunctionInvokeUrl = b ? true : false;
    }
  }

  private _setFunctionKey(functionInfo) {
    if (functionInfo) {
      this._functionService.getFunctionKeys(this.context.site.id, functionInfo.name).subscribe(keys => {
        if (keys.isSuccessful && keys.result.keys && keys.result.keys.length > 0) {
          this.functionKey = keys.result.keys.find(k => k.name === 'default').value || keys.result.keys[0].value;
        }
      });
    }
  }

  private _setFunctionInvokeUrl(key?: string) {
    if (this.isHttpFunction) {
      // No webhook https://xxx.azurewebsites.net/api/HttpTriggerCSharp1?code=[keyvalue]
      // WebhookType = "Generic JSON"  https://xxx.azurewebsites.net/api/HttpTriggerCSharp1?code=[keyvalue]&clientId=[keyname]
      // WebhookType = "GitHub" or "Slack" https://xxx.azurewebsites.net/api/HttpTriggerCSharp1?clientId=[keyname]
      let code = '';
      let clientId = '';
      let queryParams = '';

      // NOTE(michinoy): With existing implementation, the public functionKey is assigned once the component is loaded.
      // But one could also change the key by selecting the dropdown. This is a currently a safer change instead having to
      // refactor several areas of this file.
      const functionKey = key || this.functionKey;

      if (functionKey) {
        code = functionKey;
      }

      if (this.webHookType && functionKey) {
        const allKeys = this.functionKeys.keys.concat(this.hostKeys.functionKeys.keys).concat(this.hostKeys.systemKeys.keys);
        const keyWithValue = allKeys.find(k => k.value === functionKey);
        if (keyWithValue) {
          clientId = keyWithValue.name;
        }

        if (this.webHookType.toLowerCase() !== WebhookTypes.genericjson) {
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

      if (runtimeIsV1(this.functionAppVersion)) {
        this._functionAppService.getHostV1Json(this.context).subscribe(jsonObj => {
          const result =
            jsonObj.isSuccessful &&
            jsonObj.result.http &&
            jsonObj.result.http.routePrefix !== undefined &&
            jsonObj.result.http.routePrefix !== null
              ? jsonObj.result.http.routePrefix
              : 'api';

          this._updateFunctionInvokeUrl(result, queryParams);
        });
      } else {
        this._functionAppService.getHostV2V3Json(this.context).subscribe(jsonObj => {
          const result =
            jsonObj.isSuccessful &&
            jsonObj.result.extensions &&
            jsonObj.result.extensions.http &&
            jsonObj.result.extensions.http.routePrefix !== undefined &&
            jsonObj.result.extensions.http.routePrefix !== null
              ? jsonObj.result.extensions.http.routePrefix
              : 'api';

          this._updateFunctionInvokeUrl(result, queryParams);
        });
      }
    } else {
      this.runValid = true;
    }
  }

  saveScript(dontClearBusy?: boolean): Subscription | null {
    // Only save if the file is dirty
    if (!this.scriptFile.isDirty) {
      return null;
    }
    this._broadcastService.broadcastEvent<void>(BroadcastEvent.FunctionCodeUpdate);
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
          resourceId: this.context.site.id,
        });
        return null;
      }
    }

    this._globalStateService.setBusyState();

    if (this.scriptFile.name.toLowerCase() === 'function.json') {
      this.functionInfo.config = JSON.parse(this.updatedContent);
    }

    return this._functionAppService.saveFile(this.context, this.scriptFile, this.updatedContent).subscribe(
      r => {
        this._broadcastService.broadcastEvent<void>(BroadcastEvent.FunctionCodeUpdate);
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

        this._portalService.logAction('function-dev', 'save-script', {
          scriptName: this.scriptFile.name,
          mimeType: this.scriptFile.mime,
          appResourceId: this.context.site.id,
        });
      },
      () => {
        this._globalStateService.clearBusyState();
      }
    );
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
    const test_data = this._getTestData();
    if (this.functionInfo.test_data !== test_data) {
      this.functionInfo.test_data = test_data;
      this._functionService.updateFunction(this.context.site.id, this.functionInfo).subscribe(r => {
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

    this._aiService.trackEvent('/function-dev/function run', {
      bottomTab: this.bottomTab,
      rightTab: this.rightTab,
    });
    if (this.bottomTab !== 'logs') {
      this.clickBottomTab('logs');
    }

    if (this.rightTab !== 'run') {
      this.clickRightTab('run');
    }

    this._globalStateService.setBusyState();
    this.saveTestData();

    const run = () => {
      if (this.isHttpFunction && !this.runHttp) {
        // if this is an http function, but the <run-http> component isn't
        // ready yet, give it some more time to load.
        // this.clickRightTab('run') above should cause it to load eventually.
        setTimeout(() => run(), 100);
      } else {
        if (this.runHttp) {
          if (!this.runHttp.valid) {
            this._globalStateService.clearBusyState();
            this.runValid = false;
            return;
          }

          if (this.httpRunLogs) {
            this.httpRunLogs.clearLogs();
          }
          this._runFunctionInternal();
        } else {
          this._runFunctionInternal();
        }
      }
    };

    run();
    this._broadcastService.broadcastEvent<void>(BroadcastEvent.FunctionRunEvent);
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

    return this.logStreamings.toArray().find(l => {
      return l.isHttpLogs !== true;
    });
  }

  get httpRunLogs(): LogStreamingComponent {
    if (!this.logStreamings) {
      return null;
    }

    return this.logStreamings.toArray().find(l => {
      return l.isHttpLogs === true;
    });
  }

  onRunValid(runValid: any) {
    this.runValid = runValid && this.functionInvokeUrl !== this._translateService.instant(PortalResources.functionDev_loading);
  }

  setShowFunctionInvokeUrlModal(value: boolean) {
    const allKeys = this.functionKeys.keys.concat(this.hostKeys.functionKeys.keys).concat(this.hostKeys.systemKeys.keys);
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
    this._initialSetFocus = true;
  }

  onDisableTestData(disableTestData: boolean) {
    if (this.testDataEditor) {
      this.testDataEditor.disabled = disableTestData;
    } else {
      this._disableTestDataAfterViewInit = disableTestData;
    }
  }

  onChangeKey(key: string) {
    this._setFunctionInvokeUrl(key);
    this._setFunctionKey(this.functionInfo);
  }

  onEventGridSubscribe() {
    if (this.eventGridSubscribeUrl) {
      this._portalService.openBladeDeprecated(
        {
          detailBlade: 'CreateEventSubscriptionBlade',
          extension: 'Microsoft_Azure_EventGrid',
          detailBladeInputs: {
            inputs: {
              label: `functions-${this.functionInfo.name.toLowerCase()}`,
              endpointType: 'AzureFunction',
              endpointResourceId: `${this.context.site.id}/functions/${this.functionInfo.name}`,
            },
          },
        },
        'function-dev'
      );
    }
  }

  public keyDown(event: KeyboardEvent, key: string, param: any) {
    if (AccessibilityHelper.isEnterOrSpace(event)) {
      switch (key) {
        case 'clickRightTab':
          this.clickRightTab(param);
          break;
        case 'clickBottomTab':
          this.clickBottomTab(param);
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

  private _updateFunctionInvokeUrl(result: string, queryParams: string) {
    const httpTrigger = this.functionInfo.config.bindings.find(b => {
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
  }

  private _getTestData(): string {
    if (this.runHttp) {
      this.runHttp.model.body = this.updatedTestContent !== undefined ? this.updatedTestContent : this.runHttp.model.body;
      // remove "code" param fix
      const clonedModel: HttpRunModel = JSON.parse(JSON.stringify(this.runHttp.model));
      const codeIndex = (clonedModel.queryStringParams && clonedModel.queryStringParams.findIndex(p => p.name === 'code')) || -1;

      if (codeIndex > -1) {
        clonedModel.queryStringParams.splice(codeIndex, 1);
      }

      return JSON.stringify(clonedModel);
    } else {
      return this.updatedTestContent !== undefined ? this.updatedTestContent : this.functionInfo.test_data;
    }
  }

  private _runFunctionInternal() {
    if (this.scriptFile.isDirty) {
      this.saveScript().add(() => setTimeout(() => this.runFunction(), 1000));
    } else {
      const result = this.runHttp
        ? this._functionAppService.runHttpFunction(
            this.context,
            this.functionInfo,
            this.functionInvokeUrl,
            this.runHttp.model,
            this.runHttp.key
          )
        : this._functionAppService.runFunction(this.context, this.functionInfo, this._getTestData());

      this.running = result
        .switchMap(r => {
          return r.result.statusCode >= 400
            ? this._functionAppService.getFunctionErrors(this.context, this.functionInfo).map(_ => r)
            : Observable.of(r);
        })
        .subscribe(
          r => {
            this.runResult = r.result;
            this._globalStateService.clearBusyState();
            delete this.running;
          },
          () => this._globalStateService.clearBusyState()
        );
    }
  }

  private _updateKeys() {
    Observable.zip(
      this._functionService.getFunctionKeys(this.context.site.id, this.functionInfo.name),
      this._functionService.getHostKeys(this.context.site.id)
    ).subscribe(tuple => {
      this.functionKeys = tuple[0].isSuccessful ? tuple[0].result : { keys: [] };
      this.hostKeys = tuple[1].isSuccessful ? tuple[1].result : { masterKey: '', functionKeys: { keys: [] }, systemKeys: { keys: [] } };
      this._setFirstKey();
      this._setInvokeUrlVisibility();
    });
  }

  private _setFirstKey() {
    if (this.authLevel && this.authLevel.toLowerCase() === 'admin') {
      const masterKey = this.hostKeys.masterKey;
      if (masterKey) {
        this.onChangeKey(masterKey);
      }
    } else {
      const allKeys = this.functionKeys.keys.concat(this.hostKeys.functionKeys.keys).concat(this.hostKeys.systemKeys.keys);
      if (allKeys.length > 0) {
        this.onChangeKey(allKeys[0].value);
      }
    }
  }
}
