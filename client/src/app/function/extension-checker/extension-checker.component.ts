import { PortalService } from 'app/shared/services/portal.service';
import { PortalResources } from 'app/shared/models/portal-resources';
import { LogCategories, KeyCodes, Links } from './../../shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { FunctionTemplate } from './../../shared/models/function-template';
import { FunctionsNode } from './../../tree-view/functions-node';
import { AppNode } from './../../tree-view/app-node';
import { FunctionInfo } from 'app/shared/models/function-info';
import { Component, Input, Output } from '@angular/core';
import { CreateCard } from 'app/function/function-new/function-new.component';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { BaseExtensionInstallComponent } from '../../extension-install/base-extension-install-component';
import { TranslateService } from '@ngx-translate/core';
import { AiService } from '../../shared/services/ai.service';
import { FunctionAppContext } from '../../shared/function-app-context';
import { BusyStateScopeManager } from '../../busy-state/busy-state-scope-manager';
import { errorIds } from '../../shared/models/error-ids';
import { FunctionService } from 'app/shared/services/function.service';

@Component({
  selector: 'extension-checker',
  templateUrl: './extension-checker.component.html',
  styleUrls: ['./extension-checker.component.scss'],
})
export class ExtensionCheckerComponent extends BaseExtensionInstallComponent {
  @Input()
  functionLanguage: string;
  @Input()
  functionsInfo: FunctionInfo[];
  @Input()
  functionAppLanguage: string;
  @Input()
  appNode: AppNode;
  @Input()
  functionsNode: FunctionsNode;
  @Input()
  passedContext: FunctionAppContext;
  @Output()
  closePanel = new Subject();

  public openFunctionNewDetail = false;
  public showExtensionInstallDetail = false;
  public currentTemplate: FunctionTemplate;
  public autoPickedLanguage = false;
  public _functionCard: CreateCard;
  public detailsUrl: string;
  public installFailedUrl: string;
  public installFailedInstallId: string;
  public installFailedSessionId: string;
  public documentationLink = Links.extensionInstallHelpLink;

  private functionCardStream: Subject<CreateCard>;
  private _busyManager: BusyStateScopeManager;

  constructor(
    aiService: AiService,
    broadcastService: BroadcastService,
    functionService: FunctionService,
    private _functionAppService: FunctionAppService,
    private _logService: LogService,
    private _portalService: PortalService,
    private _translateService: TranslateService
  ) {
    super('extension-checker', _functionAppService, broadcastService, aiService, _translateService, _portalService, functionService);

    this._busyManager = new BusyStateScopeManager(this._broadcastService, 'sidebar');
    this.functionCardStream = new Subject();
    this.functionCardStream
      .takeUntil(this.ngUnsubscribe)
      .switchMap(card => {
        this._busyManager.setBusy();
        this._functionCard = card;
        return this._functionAppService.getTemplates(this.passedContext);
      })
      .switchMap(templates => {
        if (!this.functionLanguage) {
          this.functionLanguage = this._functionCard.languages[0];
          this.autoPickedLanguage = true;
        }
        this.currentTemplate = templates.result.find(
          t => t.metadata.language === this.functionLanguage && !!this._functionCard.ids.find(id => id === t.id)
        );
        this.runtimeExtensions = this.currentTemplate.metadata.extensions;
        if (this.runtimeExtensions && this.runtimeExtensions.length > 0) {
          return this.getNeededExtensions(this.runtimeExtensions);
        } else {
          return Observable.of(null);
        }
      })
      .switchMap(extensions => {
        return this.setInstallationVariables(extensions);
      })
      .do(null, e => {
        this._busyManager.clearBusy();
        this.showComponentError({
          message: this._translateService.instant(PortalResources.functionCreateErrorDetails, { error: e }),
          errorId: errorIds.unableToCreateFunction,
          resourceId: this.context.site.id,
        });
        this._logService.error(LogCategories.functionNew, '/sidebar-error', e);
      })
      .subscribe(r => {
        this.functionLanguage = this.autoPickedLanguage ? null : this.functionLanguage;
        if (this.allInstalled) {
          this.continueToFunctionNewDetail();
        } else {
          this.showExtensionInstallDetail = true;
          if (this.installing) {
            this.pollInstallationStatus(0);
          }
        }
        this._busyManager.clearBusy();
      });
  }

  @Input()
  set functionCard(value: CreateCard) {
    setTimeout(() => {
      this.functionCardStream.next(value);
    }, 100);
  }

  continueToFunctionNewDetail() {
    this.openFunctionNewDetail = true;
    this.showExtensionInstallDetail = false;
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.keyCode === KeyCodes.escape) {
      this.close();
    }
  }

  showInstallFailed(context: FunctionAppContext, id: string) {
    this.installFailed = true;
    this.detailsUrl = context.urlTemplates.getRuntimeHostExentensionsJobUrl(id);
    this.installFailedUrl = this._translateService.instant(PortalResources.failedToInstallExtensionUrl);
    this.installFailedInstallId = this._translateService.instant(PortalResources.failedToInstallExtensionInstallId, { installId: id });
    this.installFailedSessionId = this._translateService.instant(PortalResources.failedToInstallExtensionSessionId, {
      sessionId: this._portalService.sessionId,
    });
  }

  close() {
    this.closePanel.next();
  }
}
