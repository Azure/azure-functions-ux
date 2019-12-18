import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';
import { AiService } from './../shared/services/ai.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { FunctionTemplate } from '../shared/models/function-template';
import { FunctionInfo } from '../shared/models/function-info';
import { PortalService } from '../shared/services/portal.service';
import { BindingManager } from '../shared/models/binding-manager';
import { GlobalStateService } from '../shared/services/global-state.service';
import { PortalResources } from '../shared/models/portal-resources';
import { errorIds } from '../shared/models/error-ids';
import { FunctionsNode } from '../tree-view/functions-node';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { DashboardType } from '../tree-view/models/dashboard-type';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { Subscription } from 'rxjs/Subscription';
import { KeyCodes, Constants, WorkerRuntimeLanguages, SiteTabIds } from '../shared/models/constants';
import { Dom } from '../shared/Utilities/dom';
import { Observable } from 'rxjs/Observable';
import { ArmObj } from '../shared/models/arm/arm-obj';
import { ApplicationSettings } from '../shared/models/arm/application-settings';
import { SiteService } from '../shared/services/site.service';
import { FunctionService } from 'app/shared/services/function.service';
import { runtimeIsV1 } from 'app/shared/models/functions-version-info';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';

type TemplateType = 'HttpTrigger' | 'TimerTrigger' | 'QueueTrigger';

@Component({
  selector: 'function-quickstart',
  templateUrl: './function-quickstart.component.html',
  styleUrls: ['./function-quickstart.component.scss'],
})
export class FunctionQuickstartComponent extends FunctionAppContextComponent {
  @Input()
  functionsInfo: ArmObj<FunctionInfo>[];

  selectedFunction: string;
  selectedLanguage: string;
  bc: BindingManager = new BindingManager();
  showJavaSplashPage = false;
  setShowJavaSplashPage = new Subject<boolean>();
  templateTypeOptions: TemplateType[];
  isV1: boolean;
  public appSettingsArm: ArmObj<ApplicationSettings>;
  functionAppLanguage: string;

  private functionsNode: FunctionsNode;
  private _viewInfoStream = new Subject<TreeViewInfo<any>>();

  @ViewChild('http')
  httpTemplate: ElementRef;
  @ViewChild('timer')
  timerTemplate: ElementRef;
  @ViewChild('queue')
  queueTemplate: ElementRef;

  constructor(
    broadcastService: BroadcastService,
    private _portalService: PortalService,
    private _globalStateService: GlobalStateService,
    private _translateService: TranslateService,
    private _aiService: AiService,
    private _functionAppService: FunctionAppService,
    private _siteService: SiteService,
    private _functionService: FunctionService
  ) {
    super('function-quickstart', _functionAppService, broadcastService, _functionService, () => _globalStateService.setBusyState());

    this.selectedFunction = 'HttpTrigger';
    this.selectedLanguage = 'CSharp';

    this.setShowJavaSplashPage.subscribe(show => {
      this.showJavaSplashPage = show;
    });
  }

  setup(): Subscription {
    return this.viewInfoEvents
      .switchMap(r => {
        this.functionsNode = r.node as FunctionsNode;
        return Observable.zip(
          this._functionService.getFunctions(this.context.site.id),
          this._functionAppService.getRuntimeGeneration(this.context),
          this._siteService.getAppSettings(this.context.site.id)
        );
      })
      .do(null, e => {
        this._aiService.trackException(e, '/errors/function-quickstart');
        console.error(e);
      })
      .subscribe(tuple => {
        this.functionsInfo = tuple[0].isSuccessful ? tuple[0].result.value : [];
        this.isV1 = runtimeIsV1(tuple[1]);
        this.appSettingsArm = tuple[2].result;

        if (this.isV1) {
          this.templateTypeOptions = ['HttpTrigger', 'TimerTrigger', 'QueueTrigger'];
        } else {
          this.templateTypeOptions = ['HttpTrigger', 'TimerTrigger'];
        }

        if (this.appSettingsArm.properties.hasOwnProperty(Constants.functionsWorkerRuntimeAppSettingsName)) {
          const workerRuntime = this.appSettingsArm.properties[Constants.functionsWorkerRuntimeAppSettingsName];
          this.functionAppLanguage = WorkerRuntimeLanguages[workerRuntime] === 'C#' ? 'CSharp' : WorkerRuntimeLanguages[workerRuntime];
          this.selectedLanguage = this.functionAppLanguage;
        }

        this._globalStateService.clearBusyState();
      });
  }

  set viewInfoInput(viewInfoInput: TreeViewInfo<any>) {
    this._viewInfoStream.next(viewInfoInput);
  }

  onFunctionClicked(selectedFunction: string) {
    if (!this._broadcastService.getDirtyState('function_disabled')) {
      this.selectedFunction = selectedFunction;
    }
  }

  onFunctionKey(event: KeyboardEvent, currentFunction: TemplateType) {
    const currentIndex = this.templateTypeOptions.indexOf(currentFunction);
    let nextIndex: number;

    if (event.keyCode === KeyCodes.arrowRight) {
      nextIndex = currentIndex + 1;
      nextIndex = nextIndex > this.templateTypeOptions.length - 1 ? 0 : nextIndex;
    } else if (event.keyCode === KeyCodes.arrowLeft) {
      nextIndex = currentIndex - 1;
      nextIndex = nextIndex < 0 ? this.templateTypeOptions.length - 1 : nextIndex;
    } else {
      return;
    }

    const nextFunction = this.templateTypeOptions[nextIndex];
    switch (nextFunction) {
      case 'HttpTrigger': {
        Dom.setFocus(Dom.getTabbableControl(this.httpTemplate.nativeElement));
        break;
      }
      case 'TimerTrigger': {
        Dom.setFocus(Dom.getTabbableControl(this.timerTemplate.nativeElement));
        break;
      }
      case 'QueueTrigger': {
        Dom.setFocus(Dom.getTabbableControl(this.queueTemplate.nativeElement));
        break;
      }
    }
    this.onFunctionClicked(nextFunction);
  }

  onLanguageClicked(selectedLanguage: string) {
    if (!this._broadcastService.getDirtyState('function_disabled')) {
      this.selectedLanguage = selectedLanguage;
    }
  }

  onCreateNewFunction() {
    if (this._globalStateService.IsBusy) {
      return;
    }

    this._globalStateService.setBusyState();

    if (this.selectedLanguage === 'Java') {
      this.setShowJavaSplashPage.next(true);
    }
    this._functionAppService.getTemplates(this.context).subscribe(templates => {
      if (templates.isSuccessful) {
        const selectedTemplate: FunctionTemplate = templates.result.find(t => {
          return t.id === this.selectedFunction + '-' + this.selectedLanguage;
        });

        if (selectedTemplate) {
          try {
            const functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
            this._portalService.logAction('intro-create-from-template', 'creating', {
              template: selectedTemplate.id,
              name: functionName,
              appResourceId: this.context.site.id,
            });

            this.bc.setDefaultValues(selectedTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);

            this._functionService
              .createFunction(this.context.site.id, functionName, selectedTemplate.files, selectedTemplate.function)
              .subscribe(
                res => {
                  if (res.isSuccessful) {
                    this._portalService.logAction('intro-create-from-template', 'success', {
                      template: selectedTemplate.id,
                      name: functionName,
                      appResourceId: this.context.site.id,
                    });

                    this.functionsNode.addChild(res.result.properties);
                  }
                  this._globalStateService.clearBusyState();
                },
                () => {
                  this._globalStateService.clearBusyState();
                }
              );
          } catch (e) {
            this.showComponentError({
              message: this._translateService.instant(PortalResources.functionCreateErrorDetails, { error: JSON.stringify(e) }),
              errorId: errorIds.unableToCreateFunction,
              resourceId: this.context.site.id,
            });

            this._aiService.trackEvent(errorIds.unableToCreateFunction, {
              exception: e,
            });
            throw e;
          }
        } else {
          this._globalStateService.clearBusyState();
        }
      }
    });
  }

  createFromScratch() {
    const functionsNode = this.functionsNode;
    functionsNode.openCreateDashboard(DashboardType.CreateFunctionDashboard);
  }

  startFromSC() {
    this._broadcastService.broadcastEvent(BroadcastEvent.OpenTab, SiteTabIds.continuousDeployment);
    this._broadcastService.broadcastEvent(BroadcastEvent.TreeUpdate, {
      operation: 'navigate',
      data: 'appNode',
    });
  }

  onKeyDown(event: KeyboardEvent, command: string) {
    if (event.keyCode === KeyCodes.enter) {
      switch (command) {
        case 'scratch': {
          this.createFromScratch();
          break;
        }
        case 'SC': {
          this.startFromSC();
          break;
        }
      }
    }
  }
}
