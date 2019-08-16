import { FunctionAppContext } from 'app/shared/function-app-context';
import { FunctionInfo } from './../../../shared/models/function-info';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { PortalTemplateCard } from 'app/site/quickstart/Models/portal-function-card';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { BindingManager } from 'app/shared/models/binding-manager';
import { GlobalStateService } from 'app/shared/services/global-state.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionTemplate } from 'app/shared/models/function-template';
import { WorkerRuntimeLanguages, SiteTabIds, KeyCodes } from 'app/shared/models/constants';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { Observable } from 'rxjs/Observable';
import { workerRuntimeOptions } from 'app/site/quickstart/wizard-logic/quickstart-models';
import { Subject } from 'rxjs/Subject';
import { errorIds } from 'app/shared/models/error-ids';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { FunctionService } from 'app/shared/services/function.service';

@Component({
  selector: 'step-create-portal-function',
  templateUrl: './step-create-portal-function.component.html',
  styleUrls: ['./step-create-portal-function.component.scss', '../quickstart.component.scss'],
})
export class StepCreatePortalFunctionComponent implements OnInit, OnDestroy {
  public readonly httpTriggerCard: PortalTemplateCard = {
    id: 'HttpTrigger',
    name: this._translateService.instant(PortalResources.intro_webHook),
    icon: 'image/http.svg',
    color: '#731DDA',
    description: this._translateService.instant(PortalResources.httpCardDescription),
  };

  public readonly timerTriggerCard: PortalTemplateCard = {
    id: 'TimerTrigger',
    name: this._translateService.instant(PortalResources.intro_timer),
    icon: 'image/timer.svg',
    color: '#3C86FF',
    description: this._translateService.instant(PortalResources.timerCardDescription),
  };

  public readonly moreTemplatesCard: PortalTemplateCard = {
    id: 'MoreTemplates',
    name: this._translateService.instant(PortalResources.moreTemplatesTitle),
    icon: 'image/other.svg',
    color: '#000000',
    description: this._translateService.instant(PortalResources.moreTemplatesDescription),
  };

  public portalTemplateCards: PortalTemplateCard[];
  public selectedPortalTemplateCard: PortalTemplateCard = null;
  public bindingManager: BindingManager = new BindingManager();
  public context: FunctionAppContext;
  public isLinux: boolean;
  public workerRuntime: workerRuntimeOptions;
  public language: string;
  public templates: FunctionTemplate[];
  public functionsInfo: ArmObj<FunctionInfo>[];
  public finishButtonText: string;
  public isDreamspark: boolean;

  private _ngUnsubscribe = new Subject();

  constructor(
    private _wizardService: QuickstartStateManager,
    private _translateService: TranslateService,
    private _globalStateService: GlobalStateService,
    private _functionAppService: FunctionAppService,
    private _broadcastService: BroadcastService,
    private _functionService: FunctionService
  ) {
    this.context = this._wizardService.context.value;
    this.isLinux = this._wizardService.isLinux.value;
    this.workerRuntime = this._wizardService.workerRuntime.value;
    this.isDreamspark = this._wizardService.isDreamspark.value;
    this.language = this._getLanguage();
    this.portalTemplateCards = this._getPortalTemplateCards();

    this._wizardService.context.statusChanges.takeUntil(this._ngUnsubscribe).subscribe(() => {
      this.context = this._wizardService.context.value;
    });

    this._wizardService.workerRuntime.statusChanges.takeUntil(this._ngUnsubscribe).subscribe(() => {
      this.workerRuntime = this._wizardService.workerRuntime.value;
      this.language = this._getLanguage();
    });

    this._wizardService.isLinux.statusChanges.takeUntil(this._ngUnsubscribe).subscribe(() => {
      this.isLinux = this._wizardService.isLinux.value;
      this.portalTemplateCards = this._getPortalTemplateCards();
    });

    this._wizardService.isDreamspark.statusChanges.takeUntil(this._ngUnsubscribe).subscribe(() => {
      this.isDreamspark = this._wizardService.isDreamspark.value;
      this.portalTemplateCards = this._getPortalTemplateCards();
    });
  }

  ngOnInit() {
    return Observable.zip(
      this._functionAppService.getTemplates(this.context),
      this._functionService.getFunctions(this.context.site.id)
    ).subscribe(r => {
      this.templates = r[0].isSuccessful ? r[0].result : null;
      this.functionsInfo = r[1].isSuccessful ? r[1].result.value : null;
    });
  }

  public selectPortalTemplate(card: PortalTemplateCard) {
    this.selectedPortalTemplateCard = card;
    this._setButtonText();
    this._wizardService.portalTemplate.setValue(card.id);
  }

  public finish() {
    if (this.selectedPortalTemplateCard.id === 'MoreTemplates') {
      this._navigateToMoreTempaltes();
    } else {
      this._createFunction();
    }
  }

  public onKeyPress(event: KeyboardEvent, card: PortalTemplateCard) {
    if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
      this.selectPortalTemplate(card);
    }
  }

  private _createFunction() {
    if (!this._globalStateService.IsBusy) {
      this._globalStateService.setBusyState();
      if (!!this.templates && !!this.functionsInfo) {
        const selectedTemplate: FunctionTemplate = this.templates.find(t => {
          return t.id === this.selectedPortalTemplateCard.id + '-' + this.language;
        });

        if (selectedTemplate) {
          try {
            const functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
            this.bindingManager.setDefaultValues(selectedTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);
            this._functionService
              .createFunction(this.context.site.id, functionName, selectedTemplate.files, selectedTemplate.function)
              .subscribe(res => {
                this._globalStateService.clearBusyState();
                if (res.isSuccessful) {
                  this._broadcastService.broadcastEvent(BroadcastEvent.CloseTab, SiteTabIds.quickstart);
                  this._broadcastService.broadcastEvent(BroadcastEvent.TreeUpdate, {
                    operation: 'newFunction',
                    data: res.result.properties,
                  });
                }
              });
          } catch (e) {
            this._broadcastService.broadcast(BroadcastEvent.Error, {
              message: this._translateService.instant(PortalResources.functionCreateErrorDetails, { error: JSON.stringify(e) }),
              errorId: errorIds.unableToCreateFunction,
              resourceId: this.context.site.id,
            });
            this._globalStateService.clearBusyState();
          }
        }
      } else {
        this._globalStateService.clearBusyState();
      }
    }
  }

  private _getPortalTemplateCards(): PortalTemplateCard[] {
    if (this.isDreamspark) {
      return [this.httpTriggerCard];
    } else if (this.isLinux) {
      return [this.httpTriggerCard, this.timerTriggerCard];
    }
    return [this.httpTriggerCard, this.timerTriggerCard, this.moreTemplatesCard];
  }

  private _navigateToMoreTempaltes() {
    this._broadcastService.broadcastEvent(BroadcastEvent.CloseTab, SiteTabIds.quickstart);
    this._broadcastService.broadcastEvent(BroadcastEvent.TreeUpdate, { operation: 'moreTemplates' });
  }

  private _setButtonText() {
    if (this.selectedPortalTemplateCard.id === 'MoreTemplates') {
      this.finishButtonText = this._translateService.instant(PortalResources.moreTemplatesButton);
    } else {
      this.finishButtonText = this._translateService.instant(PortalResources.create);
    }
  }

  private _getLanguage(): string {
    return WorkerRuntimeLanguages[this.workerRuntime] === 'C#' ? 'CSharp' : WorkerRuntimeLanguages[this.workerRuntime];
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }
}
