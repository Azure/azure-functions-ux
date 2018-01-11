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

@Component({
  selector: 'embedded-function-editor',
  templateUrl: './embedded-function-editor.component.html',
  styleUrls: ['./embedded-function-editor.component.scss']
})
export class EmbeddedFunctionEditorComponent implements OnInit, AfterContentInit, OnDestroy {

  @ViewChild(TextEditorComponent) codeEditor: TextEditorComponent;

  public resourceId: string;
  public initialEditorContent = '';
  public fileName = '';
  public rightBarExpanded = false;
  public bottomBarExpanded = false;
  private _updatedEditorContent = '';

  private _functionInfo: FunctionInfo;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  private _busyManager: BusyStateScopeManager;

  constructor(
    private _broadcastService: BroadcastService,
    private _cacheService: CacheService,
    private _translateService: TranslateService) {

    this._busyManager = new BusyStateScopeManager(this._broadcastService, 'dashboard');

    this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.TreeNavigation)
      .filter(info => info.dashboardType === DashboardType.FunctionDashboard)
      .takeUntil(this._ngUnsubscribe)
      .switchMap(info => {
        this._busyManager.setBusy();
        this.resourceId = info.resourceId;
        return this._cacheService.getArm(info.resourceId, true);
      })
      .switchMap(r => {
        this._functionInfo = r.json();

        const scriptHrefParts = this._functionInfo.script_href.split('/');
        this.fileName = scriptHrefParts[scriptHrefParts.length - 1];
        return this._cacheService.getArm(this._functionInfo.script_href, true);
      })
      .do(null, err => {
        // TODO: ellhamai - log error
        this._busyManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        this._busyManager.clearBusy();
        this.initialEditorContent = r.text();
        this._updatedEditorContent = this.initialEditorContent;
      });

    this._broadcastService.getEvents<RightTabEvent<boolean>>(BroadcastEvent.RightTabsEvent)
      .filter(e => e.type === 'isExpanded')
      .takeUntil(this._ngUnsubscribe)
      .subscribe(e => {
        this.toggleRightBarExpanded();
      });
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
  }

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

    console.log('editor bottom bar expanded - ' + this.bottomBarExpanded);

    setTimeout(() => {
      this.codeEditor.resize();
    });
  }

  saveEditorContent() {
    this._busyManager.setBusy();
    this._cacheService.putArm(this._functionInfo.script_href, null, this._updatedEditorContent)
      .subscribe(r => {
        this._busyManager.clearBusy();
        this.initialEditorContent = r.text();
        this._updatedEditorContent = this.initialEditorContent;
      }, err => {
        this._busyManager.clearBusy();
        // TODO: ellhamai - handle error
      });
  }

  editorContentChanged(content: string) {
    this._updatedEditorContent = content;
  }

  deleteFunction() {
    const result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: this._functionInfo.name }));
    if (result) {
      this._busyManager.setBusy();
      this._cacheService.deleteArm(this.resourceId)
        .subscribe(r => {
          this._busyManager.clearBusy();
          this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
            resourceId: this.resourceId,
            operation: 'remove'
          });
        }, err => {
          this._busyManager.clearBusy();
          // TODO: ellhamai - handle error
        });
    }
  }
}
