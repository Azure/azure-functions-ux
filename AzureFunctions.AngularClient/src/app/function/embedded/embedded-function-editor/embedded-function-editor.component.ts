import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { FunctionInfo } from './../../../shared/models/function-info';
import { CacheService } from './../../../shared/services/cache.service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { Subject } from 'rxjs/Subject';
import { BroadcastEvent } from './../../../shared/models/broadcast-event';
import { TreeViewInfo } from './../../../tree-view/models/tree-view-info';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { MonacoEditorDirective } from './../../../shared/directives/monaco-editor.directive';
import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { AfterContentInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'embedded-function-editor',
  templateUrl: './embedded-function-editor.component.html',
  styleUrls: ['./embedded-function-editor.component.scss']
})
export class EmbeddedFunctionEditorComponent implements OnInit, AfterContentInit, OnDestroy {

  @ViewChild('codeContainer') codeContainer: ElementRef;
  @ViewChild(MonacoEditorDirective) codeEditor: MonacoEditorDirective;

  public resourceId: string;
  public initialEditorContent = '';
  public fileName = '';
  private _updatedEditorContent = '';

  private _functionInfo: FunctionInfo;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  private _busyManager: BusyStateScopeManager;
  
  private _rightBarExpandedWidth = 460;
  private _rightBarClosedWidth = 44;
  private _bottomBarClosedHeight = 39;
  private _bottomBarExpandedHeight = 300;

  constructor(
    private _broadcastService: BroadcastService,
    private _cacheService: CacheService) {

    this._busyManager = new BusyStateScopeManager(this._broadcastService, 'dashboard');

    this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.TreeNavigation)
      .filter(info => info.dashboardType === DashboardType.FunctionDashboard)
      .takeUntil(this._ngUnsubscribe)
      .switchMap(info => {
        this._busyManager.setBusy();
        this.resourceId = info.resourceId;
        return this._cacheService.getArm(info.resourceId);
      })
      .switchMap(r => {
        this._functionInfo = r.json();

        const scriptHrefParts = this._functionInfo.script_href.split('/');
        this.fileName = scriptHrefParts[scriptHrefParts.length - 1];
        return this._cacheService.getArm(this._functionInfo.script_href);
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
  }

  ngOnInit() {
    // this.onResize();
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.onResize();
    });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

  onResize() {
    const width = this.codeContainer.nativeElement.clientWidth;
    const height = this.codeContainer.nativeElement.clientHeight;

    this.codeEditor.setLayout(width - 50, height - 50);
  }

  handleRightBarExpansion(isExpanded: boolean) {

    const parentElement = this.codeContainer.nativeElement.parentElement;
    if (isExpanded) {
      parentElement.style.width = `calc(100% - ${this._rightBarExpandedWidth + 1}px)`;
    } else {
      parentElement.style.width = `calc(100% - ${this._rightBarClosedWidth + 1}px)`;
    }

    setTimeout(() => {
      this.onResize();
    });
  }

  handleBottomBarExpansion(isExpanded: boolean) {

    const parentElement = this.codeContainer.nativeElement.parentElement;
    if (isExpanded) {
      parentElement.style.height = `calc(100% - ${this._bottomBarExpandedHeight + 1}px)`;
    } else {
      parentElement.style.height = `calc(100% - ${this._bottomBarClosedHeight + 1}px)`;
    }

    setTimeout(() => {
      this.onResize();
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
}
