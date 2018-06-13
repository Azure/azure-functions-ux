import { FunctionEditorEvent } from 'app/function/embedded/function-editor-event';
import { PortalService } from 'app/shared/services/portal.service';
import { CdsFunctionDescriptor } from 'app/shared/resourceDescriptors';
import { errorIds } from 'app/shared/models/error-ids';
import { ErrorEvent } from 'app/shared/models/error-event';
import { HttpResult } from './../../../shared/models/http-result';
import { Observable } from 'rxjs/Observable';
import { PortalResources } from './../../../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { TextEditorComponent } from './../../../controls/text-editor/text-editor.component';
import { FunctionInfo } from './../../../shared/models/function-info';
import { CacheService } from './../../../shared/services/cache.service';
import { BroadcastEvent } from './../../../shared/models/broadcast-event';
import { TreeViewInfo, SiteData } from './../../../tree-view/models/tree-view-info';
import { Component, ViewChild, OnDestroy, Input, Injector } from '@angular/core';
import { EmbeddedService } from 'app/shared/services/embedded.service';
import { FeatureComponent } from '../../../shared/components/feature-component';
import { SiteTabIds } from '../../../shared/models/constants';
@Component({
  selector: 'embedded-function-editor',
  templateUrl: './embedded-function-editor.component.html',
  styleUrls: ['./embedded-function-editor.component.scss']
})
export class EmbeddedFunctionEditorComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {

  @ViewChild(TextEditorComponent) codeEditor: TextEditorComponent;

  public resourceId: string;
  public initialEditorContent = '';
  public fileName = '';
  public rightBarExpanded = false;
  public bottomBarExpanded = false;
  public bottomBarMaximized = false;
  public functionName = '';
  public getLogs = false;
  public viewInfo: TreeViewInfo<SiteData>;

  @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.setInput(viewInfo);
  }

  private _updatedEditorContent = '';
  private _functionInfo: FunctionInfo;

  constructor(
    private _cacheService: CacheService,
    private _translateService: TranslateService,
    private _embeddedService: EmbeddedService,
    private _portalService: PortalService,
    injector: Injector) {

    super('EmbeddedFunctionEditorComponent', injector, SiteTabIds.embeddedEditor);

    this.featureName = 'embeddededitor';
    this.isParentComponent = true;
  }

  private _getScriptContent(resourceId: string): Observable<HttpResult<string>> {
    this.setBusy();
    this.resourceId = resourceId;

    return this._cacheService.getArm(resourceId, true)
      .switchMap(r => {
        this._functionInfo = r.json();
        const scriptHrefParts = this._functionInfo.script_href.split('/');
        this.fileName = ` > ${scriptHrefParts[scriptHrefParts.length - 1]}`;
        this.functionName = ` > ${this._functionInfo.name}`;
        return this._cacheService.getArm(this._functionInfo.script_href, true);
      })
      .map(r => {
        return <HttpResult<string>>{
          isSuccessful: true,
          error: null,
          result: r.text()
        };
      })
      .catch(e => {
        const descriptor = new CdsFunctionDescriptor(this.resourceId);
        return Observable.of(<HttpResult<string>>{
          isSuccessful: false,
          error: {
            errorId: errorIds.embeddedEditorLoadError,
            message: this._translateService.instant(PortalResources.error_unableToRetrieveFunction).format(descriptor.name)
          }
        });
      });
  }

  protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(viewInfo => {
        this.viewInfo = viewInfo;

        this.initialEditorContent = '';
        this.fileName = '';
        this.rightBarExpanded = false;
        this.bottomBarExpanded = false;
        this.bottomBarMaximized = false;
        this.functionName = '';
        this.getLogs = false;

        return Observable.of(viewInfo);
      })
      .switchMap(info => {
        return this._getScriptContent(info.resourceId);
      })
      .retry()
      .do(r => {
        this.clearBusy();
        if (r.isSuccessful) {
          this.initialEditorContent = r.result;
          this._updatedEditorContent = this.initialEditorContent;
        } else {
          this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
            message: r.error.message,
            errorId: r.error.errorId,
            resourceId: this.resourceId,
          });
        }
      });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.clearBusy();
  }

  setBottomBarState() {
    this.bottomBarExpanded = !this.bottomBarExpanded;
    this.bottomBarMaximized = false;
    this.getLogs = this.bottomBarExpanded;

    if (this.getLogs) {
      setTimeout(() => {
        this._broadcastService.broadcastEvent<FunctionEditorEvent<void>>(BroadcastEvent.FunctionEditorEvent, {
          type: 'startLogs',
          value: null
        });
      });
    }

    setTimeout(() => {
      this.codeEditor.resize();
    });
  }

  maximizeBottomBar() {
    this.bottomBarMaximized = true;

    setTimeout(() => {
      this.codeEditor.resize();
    });
  }

  compressBottomBar( ) {
    this.bottomBarMaximized = false;

    setTimeout(() => {
      this.codeEditor.resize();
    });
  }

  setRightBarState() {
    this.rightBarExpanded = !this.rightBarExpanded;

    setTimeout(() => {
      this.codeEditor.resize();
    });
  }

  run() {
    this.rightBarExpanded = true;
    this.bottomBarExpanded = true;

    setTimeout(() => {
      this.codeEditor.resize();
    });
  }

  copyLogs() {
    setTimeout(() => {
      this._broadcastService.broadcastEvent<FunctionEditorEvent<void>>(BroadcastEvent.FunctionEditorEvent, {
        type: 'copyLogs',
        value: null
      });
    });
  }

  pauseLogs() {
    this.getLogs = false;
    setTimeout(() => {
      this._broadcastService.broadcastEvent<FunctionEditorEvent<void>>(BroadcastEvent.FunctionEditorEvent, {
        type: 'pauseLogs',
        value: null
      });
    });
  }

  startLogs() {
    this.getLogs = true;
    setTimeout(() => {
      this._broadcastService.broadcastEvent<FunctionEditorEvent<void>>(BroadcastEvent.FunctionEditorEvent, {
        type: 'startLogs',
        value: null
      });
    });
  }

  clearLogs() {
    this.getLogs = false;
    setTimeout(() => {
      this._broadcastService.broadcastEvent<FunctionEditorEvent<void>>(BroadcastEvent.FunctionEditorEvent, {
        type: 'clearLogs',
        value: null
      });
    });
  }

  saveEditorContent() {
    this.setBusy();
    this._cacheService.putArm(this._functionInfo.script_href, null, this._updatedEditorContent)
      .subscribe(r => {
        this.clearBusy();
        this.initialEditorContent = r.text();
        this._updatedEditorContent = this.initialEditorContent;
      }, err => {
        this.clearBusy();
        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
          message: this._translateService.instant(PortalResources.error_unableToSaveFunction).format(this._functionInfo.name),
          errorId: errorIds.embeddedEditorSaveError,
          resourceId: this.resourceId,
        });
      });
  }

  editorContentChanged(content: string) {
    this._updatedEditorContent = content;
  }

  deleteFunction() {
    const result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: this._functionInfo.name }));
    if (result) {
      this.setBusy();
      this._embeddedService.deleteFunction(this.resourceId)
        .subscribe(r => {
          if (r.isSuccessful) {
            this._portalService.closeBlades();
          } else {
            this.clearBusy();
            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
              message: r.error.message,
              errorId: r.error.errorId,
              resourceId: this.resourceId,
            });
          }
        });
    }
  }

  navigateToList() {
    this.setBusy();
    this._portalService.closeBlades();
  }
}
