import { CdsFunctionDescriptor } from 'app/shared/resourceDescriptors';
import { errorIds } from 'app/shared/models/error-ids';
import { ErrorEvent } from 'app/shared/models/error-event';
import { HttpResult } from './../../../shared/models/http-result';
import { Observable } from 'rxjs/Observable';
import { PortalResources } from './../../../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { RightTabEvent } from './../../../controls/right-tabs/right-tab-event';
import { TextEditorComponent } from './../../../controls/text-editor/text-editor.component';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { FunctionInfo } from './../../../shared/models/function-info';
import { CacheService } from './../../../shared/services/cache.service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { Subject } from 'rxjs/Subject';
import { BroadcastEvent, TreeUpdateEvent } from './../../../shared/models/broadcast-event';
import { TreeViewInfo } from './../../../tree-view/models/tree-view-info';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AfterContentInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { EmbeddedService } from 'app/shared/services/embedded.service';

@Component({
  selector: 'embedded-function-editor',
  templateUrl: './embedded-function-editor.component.html',
  styleUrls: ['./embedded-function-editor.component.scss'],
})
export class EmbeddedFunctionEditorComponent implements OnInit, AfterContentInit, OnDestroy {
  @ViewChild(TextEditorComponent)
  codeEditor: TextEditorComponent;

  public resourceId: string;
  public initialEditorContent = '';
  public fileName = '';
  public rightBarExpanded = false;
  public bottomBarExpanded = false;
  public displayName = '';

  private _updatedEditorContent = '';

  private _functionInfo: FunctionInfo;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  private _busyManager: BusyStateScopeManager;

  constructor(
    private _broadcastService: BroadcastService,
    private _cacheService: CacheService,
    private _translateService: TranslateService,
    private _embeddedService: EmbeddedService
  ) {
    this._busyManager = new BusyStateScopeManager(this._broadcastService, 'dashboard');

    this._broadcastService
      .getEvents<TreeViewInfo<any>>(BroadcastEvent.TreeNavigation)
      .distinctUntilChanged()
      .filter(info => info.dashboardType === DashboardType.FunctionDashboard)
      .takeUntil(this._ngUnsubscribe)
      .switchMap(info => {
        return this._getScriptContent(info.resourceId);
      })
      .retry()
      .subscribe(r => {
        this._busyManager.clearBusy();

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

    this._broadcastService
      .getEvents<RightTabEvent<boolean>>(BroadcastEvent.RightTabsEvent)
      .filter(e => e.type === 'isExpanded')
      .takeUntil(this._ngUnsubscribe)
      .subscribe(e => {
        this.toggleRightBarExpanded();
      });
  }

  private _getScriptContent(resourceId: string): Observable<HttpResult<string>> {
    this._busyManager.setBusy();
    this.resourceId = resourceId;

    return this._cacheService
      .getArm(resourceId, true)
      .switchMap(r => {
        this._functionInfo = r.json();

        const scriptHrefParts = this._functionInfo.script_href.split('/');
        this.fileName = scriptHrefParts[scriptHrefParts.length - 1];
        const event = this._functionInfo.config.bindings[0].message.toLowerCase();
        const entity = scriptHrefParts[8].toLowerCase();
        this.displayName = `${entity}/${event}/${this.fileName}`;
        return this._cacheService.getArm(this._functionInfo.script_href, true);
      })
      .map(r => {
        return <HttpResult<string>>{
          isSuccessful: true,
          error: null,
          result: r.text(),
        };
      })
      .catch(e => {
        const descriptor = new CdsFunctionDescriptor(this.resourceId);
        return Observable.of(<HttpResult<string>>{
          isSuccessful: false,
          error: {
            errorId: errorIds.embeddedEditorLoadError,
            message: this._translateService.instant(PortalResources.error_unableToRetrieveFunction).format(descriptor.name),
          },
        });
      });
  }

  ngOnInit() {}

  ngAfterContentInit() {}

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

  toggleRightBarExpanded() {
    this.rightBarExpanded = !this.rightBarExpanded;

    setTimeout(() => {
      this.codeEditor.resize();
    });
  }

  setBottomBarState(expanded: boolean) {
    this.bottomBarExpanded = expanded;

    setTimeout(() => {
      this.codeEditor.resize();
    });
  }

  saveEditorContent() {
    this._busyManager.setBusy();
    this._cacheService.putArm(this._functionInfo.script_href, null, this._updatedEditorContent).subscribe(
      r => {
        this._busyManager.clearBusy();
        this.initialEditorContent = r.text();
        this._updatedEditorContent = this.initialEditorContent;
      },
      err => {
        this._busyManager.clearBusy();
        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
          message: this._translateService.instant(PortalResources.error_unableToSaveFunction).format(this._functionInfo.name),
          errorId: errorIds.embeddedEditorSaveError,
          resourceId: this.resourceId,
        });
      }
    );
  }

  editorContentChanged(content: string) {
    this._updatedEditorContent = content;
  }

  deleteFunction() {
    const result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: this._functionInfo.name }));
    if (result) {
      this._busyManager.setBusy();
      this._embeddedService.deleteFunction(this.resourceId).subscribe(r => {
        if (r.isSuccessful) {
          this._busyManager.clearBusy();
          this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
            resourceId: this.resourceId,
            operation: 'remove',
          });
        } else {
          this._busyManager.clearBusy();
          this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
            message: r.error.message,
            errorId: r.error.errorId,
            resourceId: this.resourceId,
          });
        }
      });
    }
  }
}
